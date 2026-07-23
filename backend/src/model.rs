use serde::{Deserialize, Serialize};
use validator::{Validate, ValidationError};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: usize,
    pub iat: usize,
    pub token_type: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct RegisterRequest {
    #[validate(email(message = "Email is not valid"))]
    pub email: String,
    #[validate(length(min = 8, max = 20, message = "Password must be 8-20 characters long"))]
    #[validate(custom(function = "validate_password"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct LoginRequest {
    #[validate(email(message = "Email is not valid"))]
    pub email: String,
    #[validate(length(min = 1, message = "Password is required"))]
    pub password: String,
}

#[derive(Debug, Deserialize, Validate)]
pub struct ResendVerificationRequest {
    #[validate(email(message = "Email is not valid"))]
    pub email: String,
}

fn validate_password(password: &str) -> Result<(), ValidationError> {
    let has_uppercase = password.chars().any(|c| c.is_ascii_uppercase());
    let has_lowercase = password.chars().any(|c| c.is_ascii_lowercase());

    if !(has_uppercase && has_lowercase) {
        let mut error = ValidationError::new("password_case");
        error.message = Some("Password must contain uppercase and lowercase letters".into());
        return Err(error);
    }

    let has_digit_or_symbol = password
        .chars()
        .any(|c| c.is_ascii_digit() || !c.is_ascii_alphanumeric());

    if !has_digit_or_symbol {
        let mut error = ValidationError::new("password_number_or_symbol");
        error.message = Some("Password must contain at least 1 number or symbol".into());
        return Err(error);
    }

    Ok(())
}

#[derive(Serialize)]
pub struct UserResponse {
    pub email: String,
}

#[derive(Serialize)]
pub struct ResponseMessage {
    pub status: u16,
    pub message: String,
    pub access_token: Option<String>,
}

#[derive(Deserialize)]
pub struct VerifyEmailQuery {
    pub token: Option<String>,
}

#[derive(Serialize)]
pub struct VerifyEmailResponse {
    pub verified: bool,
    pub message: String,
}

impl VerifyEmailResponse {
    pub fn success() -> Self {
        Self {
            verified: true,
            message: "Email verified successfully".into(),
        }
    }

    pub fn failure() -> Self {
        Self {
            verified: false,
            message: "Verification link is invalid or has expired".into(),
        }
    }
}
