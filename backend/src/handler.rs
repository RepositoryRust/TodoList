use axum::{
    Json,
    extract::{Query, State},
};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use chrono::{NaiveDateTime, Utc};
use http::{HeaderMap, StatusCode, header::AUTHORIZATION};
use rand::RngExt;
use sha2::{Digest, Sha256};
use sqlx::Row;
use time::Duration;
use uuid::Uuid;
use validator::Validate;

use crate::{
    email_template::confirmation_email, error::AppError, model::{
        LoginRequest, RegisterRequest, ResendVerificationRequest, ResponseMessage, UserResponse,
        VerifyEmailQuery, VerifyEmailResponse,
    }, state::{self, AppState}, utils::{
        generate_access_token, generate_refresh_token, generate_token, resend_verification_response, verify_access_token, verify_refresh_token,
    },
};

#[axum::debug_handler]
pub async fn register_user(
    State(state): State<state::AppState>,
    Json(form): Json<RegisterRequest>,
) -> Result<Json<ResponseMessage>, AppError> {
    form.validate()?;

    let password_hash = bcrypt::hash(&form.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::InternalServerError("Failed to hash password".into()))?;

    let number: u32 = rand::rng().random_range(100000..999999);
    let user_name = format!("user#{}", number);

    let user_id = Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)")
        .bind(&user_id)
        .bind(user_name)
        .bind(&form.email)
        .bind(password_hash)
        .execute(&state.pool)
        .await
        .map_err(|_| AppError::Conflict("Username already exists".into()))?;

    let (raw_token, token_hash) = generate_token();
    let verification_id = uuid::Uuid::new_v4().to_string();
    let expires_at = Utc::now().naive_utc() + chrono::Duration::hours(24);

    sqlx::query(
        "INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    )
    .bind(verification_id)
    .bind(user_id)
    .bind(token_hash)
    .bind(expires_at)
    .execute(&state.pool)
    .await
    .map_err(|_| AppError::InternalServerError("Failed to save email verification token".into()))?;

    let email = confirmation_email(form.email, raw_token);

    state
        .resend
        .emails
        .send(email)
        .await
        .map_err(|_| AppError::InternalServerError("Failed to send confirmation email".into()))?;

    Ok(Json(ResponseMessage {
        status: StatusCode::CREATED.into(),
        message: "User registered successfully".into(),
        access_token: None,
    }))
}

pub async fn login_user(
    State(state): State<state::AppState>,
    jar: CookieJar,
    Json(form): Json<LoginRequest>,
) -> Result<(CookieJar, Json<ResponseMessage>), AppError> {
    form.validate()?;

    let user = sqlx::query("SELECT id, name, email, password, verified FROM users WHERE email = ?")
        .bind(&form.email)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let user = match user {
        Some(user) => user,
        None => return Err(AppError::Unauthorized("Email or password is wrong".into())),
    };

    let password_hash: String = user.get("password");
    let valid = bcrypt::verify(&form.password, &password_hash)
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;
    if !valid {
        return Err(AppError::Unauthorized("Email or password is wrong".into()));
    }

    let verified: bool = user.get("verified");
    if !verified {
        return Err(AppError::Unauthorized(
            "Please verify your email first".into(),
        ));
    }

    let user_id: String = user.get("id");
    let access_token = generate_access_token(&user_id, &state.jwt_secret_access)?;
    let refresh_token = generate_refresh_token(&user_id, &state.jwt_secret_refresh)?;

    let refresh_cookie = Cookie::build(("refresh_token", refresh_token))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .path("/users/refresh")
        .max_age(Duration::days(30))
        .build();

    let jar = jar.add(refresh_cookie);

    Ok((
        jar,
        Json(ResponseMessage {
            status: StatusCode::OK.into(),
            message: "Login successful".into(),
            access_token: Some(access_token),
        }),
    ))
}

pub async fn verify_email(
    State(state): State<AppState>,
    Query(params): Query<VerifyEmailQuery>,
) -> Result<Json<VerifyEmailResponse>, AppError> {
    let token = match params
        .token
        .as_deref()
        .map(str::trim)
        .filter(|token| !token.is_empty())
    {
        Some(token) => token,
        None => return Ok(Json(VerifyEmailResponse::failure())),
    };

    let now = Utc::now().naive_utc();
    let token_hash = hex::encode(Sha256::digest(token.as_bytes()));

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let user_verification = sqlx::query(
        r#"
        SELECT
            ev.id,
            ev.user_id,
            ev.expires_at,
            ev.used_at,
            u.verified AS user_verified
        FROM email_verifications ev
        INNER JOIN users u ON u.id = ev.user_id
        WHERE ev.token = ?
        FOR UPDATE
        "#,
    )
    .bind(&token_hash)
    .fetch_optional(&mut *tx)
    .await
    .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let user_verification = match user_verification {
        Some(row) => row,
        None => {
            tx.rollback().await.ok();
            return Ok(Json(VerifyEmailResponse::failure()));
        }
    };

    let user_id: String = user_verification.get("user_id");
    let user_verified: bool = user_verification.get("user_verified");
    let used_at: Option<NaiveDateTime> = user_verification.get("used_at");

    if used_at.is_some() {
        if !user_verified {
            sqlx::query("UPDATE users SET verified = true WHERE id = ?")
                .bind(&user_id)
                .execute(&mut *tx)
                .await
                .map_err(|_| AppError::InternalServerError("Failed to verify email".into()))?;
        }

        tx.commit()
            .await
            .map_err(|_| AppError::InternalServerError("Failed to verify email".into()))?;

        return Ok(Json(VerifyEmailResponse::success()));
    }

    let expires_at: NaiveDateTime = user_verification.get("expires_at");
    if expires_at <= now {
        tx.rollback().await.ok();
        return Ok(Json(VerifyEmailResponse::failure()));
    }

    let verification_id: String = user_verification.get("id");
    let claim =
        sqlx::query("UPDATE email_verifications SET used_at = ? WHERE id = ? AND used_at IS NULL")
            .bind(now)
            .bind(&verification_id)
            .execute(&mut *tx)
            .await
            .map_err(|_| AppError::InternalServerError("Failed to verify email".into()))?;

    if claim.rows_affected() != 1 {
        tx.rollback().await.ok();
        return Ok(Json(VerifyEmailResponse::failure()));
    }

    sqlx::query("UPDATE users SET verified = true WHERE id = ?")
        .bind(&user_id)
        .execute(&mut *tx)
        .await
        .map_err(|_| AppError::InternalServerError("Failed to verify email".into()))?;

    tx.commit()
        .await
        .map_err(|_| AppError::InternalServerError("Failed to verify email".into()))?;

    Ok(Json(VerifyEmailResponse::success()))
}

pub async fn resend_verification_email(
    State(state): State<AppState>,
    Json(form): Json<ResendVerificationRequest>,
) -> Result<Json<ResponseMessage>, AppError> {
    form.validate()?;

    let email = form.email.trim();
    let now = Utc::now().naive_utc();
    let expires_at = now + chrono::Duration::hours(24);
    let (raw_token, token_hash) = generate_token();
    let verification_id = Uuid::new_v4().to_string();

    let mut tx = state
        .pool
        .begin()
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let user = sqlx::query("SELECT id, email, verified FROM users WHERE email = ? FOR UPDATE")
        .bind(email)
        .fetch_optional(&mut *tx)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    let user = match user {
        Some(row) => row,
        None => {
            tx.rollback().await.ok();
            return Ok(resend_verification_response());
        }
    };

    let verified: bool = user.get("verified");
    if verified {
        tx.rollback().await.ok();
        return Ok(resend_verification_response());
    }

    let user_id: String = user.get("id");
    let user_email: String = user.get("email");

    sqlx::query(
        "INSERT INTO email_verifications (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)",
    )
    .bind(&verification_id)
    .bind(&user_id)
    .bind(token_hash)
    .bind(expires_at)
    .execute(&mut *tx)
    .await
    .map_err(|_| AppError::InternalServerError("Failed to save email verification token".into()))?;

    tx.commit().await.map_err(|_| {
        AppError::InternalServerError("Failed to save email verification token".into())
    })?;

    let email = confirmation_email(user_email, raw_token);

    state
        .resend
        .emails
        .send(email)
        .await
        .map_err(|_| AppError::InternalServerError("Failed to send verification email".into()))?;

    Ok(resend_verification_response())
}

pub async fn get_user(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> Result<Json<UserResponse>, AppError> {
    let token = headers
        .get(AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .and_then(|value| value.strip_prefix("Bearer "))
        .ok_or_else(|| AppError::Unauthorized("Missing or invalid Authorization header".into()))?;

    let claims = verify_access_token(token, &state.jwt_secret_access)?;

    let user = sqlx::query("SELECT email FROM users WHERE id = ?")
        .bind(&claims.sub)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    match user {
        Some(row) => {
            let email: String = row.get("email");
            Ok(Json(UserResponse { email }))
        }
        None => Err(AppError::Unauthorized("User not found".into())),
    }
}

pub async fn refresh_token(
    State(state): State<AppState>,
    jar: CookieJar,
) -> Result<Json<ResponseMessage>, AppError> {
    let refresh_token = jar
        .get("refresh_token")
        .map(|cookie| cookie.value().to_string())
        .ok_or_else(|| AppError::Unauthorized("Missing refresh token".into()))?;

    let claims = verify_refresh_token(&refresh_token, &state.jwt_secret_refresh)?;

    let user_exists = sqlx::query("SELECT id FROM users WHERE id = ?")
        .bind(&claims.sub)
        .fetch_optional(&state.pool)
        .await
        .map_err(|e| AppError::InternalServerError(e.to_string()))?;

    if user_exists.is_none() {
        return Err(AppError::Unauthorized("User not found".into()));
    }

    let access_token = generate_access_token(&claims.sub, &state.jwt_secret_access)?;

    Ok(Json(ResponseMessage {
        status: StatusCode::OK.into(),
        message: "Token refreshed".into(),
        access_token: Some(access_token),
    }))
}

pub async fn logout_user(jar: CookieJar) -> (CookieJar, Json<ResponseMessage>) {
    let refresh_cookie = Cookie::build(("refresh_token", ""))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .path("/users/refresh")
        .max_age(Duration::seconds(0))
        .build();

    let jar = jar.add(refresh_cookie);

    (
        jar,
        Json(ResponseMessage {
            status: StatusCode::OK.into(),
            message: "Logout successful".into(),
            access_token: None,
        }),
    )
}
