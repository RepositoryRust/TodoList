use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use thiserror::Error;
use validator::{ValidationErrors, ValidationErrorsKind};

#[derive(Error, Debug)]
pub enum AppError {
    #[error("Bad request: {0}")]
    BadRequest(String),

    #[error("Internal server error: {0}")]
    InternalServerError(String),

    #[error("Conflict: {0}")]
    Conflict(String),

    #[error("Unauthorized: {0}")]
    Unauthorized(String),
}

impl From<ValidationErrors> for AppError {
    fn from(errors: ValidationErrors) -> Self {
        let mut messages = Vec::new();
        collect_validation_messages(&errors, &mut messages);

        if messages.is_empty() {
            AppError::BadRequest("Invalid request".into())
        } else {
            AppError::BadRequest(messages.join(", "))
        }
    }
}

fn collect_validation_messages(errors: &ValidationErrors, messages: &mut Vec<String>) {
    for (field, error_kind) in errors.errors() {
        match error_kind {
            ValidationErrorsKind::Field(field_errors) => {
                for error in field_errors {
                    let message = error
                        .message
                        .as_ref()
                        .map(ToString::to_string)
                        .unwrap_or_else(|| format!("Invalid {field}"));
                    messages.push(message);
                }
            }
            ValidationErrorsKind::Struct(errors) => collect_validation_messages(errors, messages),
            ValidationErrorsKind::List(list_errors) => {
                for errors in list_errors.values() {
                    collect_validation_messages(errors, messages);
                }
            }
        }
    }
}

#[derive(Serialize)]
struct ErrorResponse {
    code: u16,
    message: String,
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        let (status, error_message) = match self {
            AppError::BadRequest(msg) => (StatusCode::BAD_REQUEST, msg),
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
