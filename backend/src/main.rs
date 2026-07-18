mod email_template;
mod error;
mod handler;
mod model;
mod state;
mod utils;

use axum::{Router, routing::post, serve};
use dotenv::dotenv;
use http::{
    Method,
    header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
};
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::handler::{login_user, register_user};

#[tokio::main]
async fn main() {
    dotenv().ok();

    let state = state::AppState::new().await;
    let cors = CorsLayer::new()
        .allow_origin(
            "http://localhost:5173"
                .parse::<http::HeaderValue>()
                .unwrap(),
        )
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_credentials(true);

    println!("🚀 Server started successfully");

    let app = Router::new()
        .route("/users/register", post(register_user))
        .route("/users/login", post(login_user))
        .with_state(state)
        .layer(cors);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    serve(listener, app).await.unwrap();
}
