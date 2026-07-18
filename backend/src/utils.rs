use sha2::{Sha256, Digest};

pub fn generate_token() -> (String, String) {
    let raw_token = uuid::Uuid::new_v4().to_string(); 
    let hash = Sha256::digest(raw_token.as_bytes());
    let token_hash = hex::encode(hash);    
    (raw_token, token_hash)
}

use chrono::{Duration, Utc};
use jsonwebtoken::{encode, EncodingKey, Header};

use crate::{error::AppError, model::Claims};

pub fn generate_access_token(
    user_id: &str,
    secret: &str,
) -> Result<String, AppError> {
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

pub fn generate_refresh_token(
    user_id: &str,
    secret: &str,
) -> Result<String, AppError> {
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