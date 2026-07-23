use crate::{
    error::AppError,
    model::{Claims, ResponseMessage},
};
use axum::Json;
use chrono::{Duration, Utc};
use http::StatusCode;
use jsonwebtoken::{DecodingKey, EncodingKey, Header, Validation, decode, encode};
use sha2::{Digest, Sha256};

pub fn generate_token() -> (String, String) {
    let raw_token = uuid::Uuid::new_v4().to_string();
    let hash = Sha256::digest(raw_token.as_bytes());
    let token_hash = hex::encode(hash);
    (raw_token, token_hash)
}

pub fn generate_access_token(user_id: &str, secret: &str) -> Result<String, AppError> {
    let now = Utc::now();

    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: (now + Duration::minutes(15)).timestamp() as usize,
        token_type: "access".into(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::InternalServerError(e.to_string()))
}

pub fn generate_refresh_token(user_id: &str, secret: &str) -> Result<String, AppError> {
    let now = Utc::now();

    let claims = Claims {
        sub: user_id.to_string(),
        iat: now.timestamp() as usize,
        exp: (now + Duration::days(30)).timestamp() as usize,
        token_type: "refresh".into(),
    };

    encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(secret.as_bytes()),
    )
    .map_err(|e| AppError::InternalServerError(e.to_string()))
}

pub fn verify_access_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".into()))?;

    if claims.token_type != "access" {
        return Err(AppError::Unauthorized("Invalid token type".into()));
    }

    Ok(claims)
}

pub fn verify_refresh_token(token: &str, secret: &str) -> Result<Claims, AppError> {
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret.as_bytes()),
        &Validation::default(),
    )
    .map(|data| data.claims)
    .map_err(|_| AppError::Unauthorized("Invalid or expired token".into()))?;

    if claims.token_type != "refresh" {
        return Err(AppError::Unauthorized("Invalid token type".into()));
    }

    Ok(claims)
}

const RESEND_VERIFICATION_MESSAGE: &str =
    "If the email is registered and not verified, we sent a new verification link.";

pub fn resend_verification_response() -> Json<ResponseMessage> {
    Json(ResponseMessage {
        status: StatusCode::OK.into(),
        message: RESEND_VERIFICATION_MESSAGE.into(),
        access_token: None,
    })
}