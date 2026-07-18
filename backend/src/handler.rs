use axum::{Json, extract::State};
use axum_extra::extract::cookie::{Cookie, CookieJar, SameSite};
use http::StatusCode;
use rand::RngExt;
use sqlx::Row;
use time::Duration;
use uuid::Uuid;

use crate::{
    email_template::confirmation_email,
    error::AppError,
    model::{RequestUser, ResponseMessage},
    state,
    utils::{generate_access_token, generate_refresh_token},
};

#[axum::debug_handler]
pub async fn register_user(
    State(state): State<state::AppState>,
    Json(form): Json<RequestUser>,
) -> Result<Json<ResponseMessage>, AppError> {
    let password_hash = bcrypt::hash(form.password, bcrypt::DEFAULT_COST)
        .map_err(|_| AppError::InternalServerError("Failed to hash password".into()))?;

    let number: u32 = rand::rng().random_range(100000..999999);
    let user_name = format!("user#{}", number);

    let user_id = Uuid::new_v4().to_string();

    sqlx::query("INSERT INTO users (id, name, email, password) VALUES (?, ?, ?, ?)")
        .bind(user_id)
        .bind(user_name)
        .bind(&form.email)
        .bind(password_hash)
        .execute(&state.pool)
        .await
        .map_err(|_| AppError::Conflict("Username already exists".into()))?;

    let email = confirmation_email(form.email);

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
    Json(form): Json<RequestUser>,
) -> Result<(CookieJar, Json<ResponseMessage>), AppError> {
    let user = sqlx::query("SELECT id, name, email, password FROM users WHERE email = ?")
        .bind(form.email)
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

    let user_id: String = user.get("id");
    let access_token = generate_access_token(&user_id, &state.jwt_secret_access)?;
    let refresh_token = generate_refresh_token(&user_id, &state.jwt_secret_refresh)?;

    let refresh_cookie = Cookie::build(("refresh_token", refresh_token))
        .http_only(true)
        .secure(true)
        .same_site(SameSite::Strict)
        .path("/api/auth/refresh")
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
// async fn login_user_handler(
//     body: web::Json<LoginUserSchema>,
//     data: web::Data<AppState>,
// ) -> impl Responder {
//     let vec = data.db.lock().unwrap();

//     let user = vec
//         .iter()
//         .find(|user| user.email == body.email.to_lowercase());

//     if user.is_none() {
//         return HttpResponse::BadRequest()
//             .json(serde_json::json!({"status": "fail", "message": "Invalid email or password"}));
//     }

//     let user = user.unwrap().clone();

//     if user.provider == "Google" {
//         return HttpResponse::Unauthorized()
//             .json(serde_json::json!({"status": "fail", "message": "Use Google OAuth2 instead"}));
//     } else if user.provider == "GitHub" {
//         return HttpResponse::Unauthorized()
//             .json(serde_json::json!({"status": "fail", "message": "Use GitHub OAuth instead"}));
//     }

//     let jwt_secret = data.env.jwt_secret.to_owned();
//     let now = Utc::now();
//     let iat = now.timestamp() as usize;
//     let exp = (now + Duration::minutes(data.env.jwt_max_age)).timestamp() as usize;
//     let claims: TokenClaims = TokenClaims {
//         sub: user.id.unwrap(),
//         exp,
//         iat,
//     };

//     let token = encode(
//         &Header::default(),
//         &claims,
//         &EncodingKey::from_secret(jwt_secret.as_ref()),
//     )
//     .unwrap();

//     let cookie = Cookie::build("token", token)
//         .path("/")
//         .max_age(ActixWebDuration::new(60 * data.env.jwt_max_age, 0))
//         .http_only(true)
//         .finish();

//     HttpResponse::Ok()
//         .cookie(cookie)
//         .json(serde_json::json!({"status": "success"}))
// }
