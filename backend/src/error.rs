use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Internal server error: {0}")]
    InternalServerError(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),
}

#[derive(Serialize)]
struct ErrorResponse {
    code: u16,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::InternalServerError(msg) => (StatusCode::INTERNAL_SERVER_ERROR, msg),
            AppError::Conflict(msg) => (StatusCode::CONFLICT, msg),
            AppError::Unauthorized(msg) => (StatusCode::UNAUTHORIZED, msg),
        };

        let body = Json(ErrorResponse {
            code: status.as_u16(),
            message: error_message,
        });

        (status, body).into_response()
    }
}
