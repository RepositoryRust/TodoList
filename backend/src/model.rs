use chrono::prelude::*;
use serde::{Deserialize, Serialize};

#[allow(non_snake_case)]
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct User {
    pub id: Option<String>,
    pub name: String,
    pub verified: bool,
    pub email: String,
    pub password: String,
    pub provider: String,
    pub createdAt: Option<DateTime<Utc>>,
    pub updatedAt: Option<DateTime<Utc>>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
    pub token_type: String,
}

#[derive(Debug, Deserialize)]
pub struct RequestUser {
    pub email: String,
    pub password: String,
}

#[derive(Serialize)]
pub struct ResponseMessage {
    pub status: u16,
    pub message: String,
    pub access_token: Option<String>,
}