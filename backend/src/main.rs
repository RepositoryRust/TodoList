mod email_template;
mod error;
mod handler;
mod model;
mod state;
mod utils;

use std::env;

use axum::{
    Router,
    routing::{get, post},
    serve,
};
use dotenv::dotenv;
use http::{
    Method,
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::handler::{
    get_user, login_user, logout_user, refresh_token, register_user, resend_verification_email,
    verify_email,
};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let origin = env::var("ALLOWED_ORIGIN").unwrap_or_else(|_| "http://localhost:5173".into());

    let state = state::AppState::new().await;
    let cors = CorsLayer::new()
        .allow_origin(origin.parse::<http::HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_credentials(true);

    println!("🚀 Server started successfully");

    let app = Router::new()
        .route("/users/register", post(register_user))
        .route("/users/login", post(login_user))
        .route("/users/logout", post(logout_user))
        .route("/users/refresh", post(refresh_token))
        .route("/users/verify-email", get(verify_email))
        .route(
            "/users/resend-verification",
            post(resend_verification_email),
        )
        .route("/users/me", get(get_user))
        .with_state(state)
        .layer(cors);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    serve(listener, app).await.unwrap();
}
