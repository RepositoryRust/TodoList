mod model;
mod handler;
mod error;

use axum::{Router, serve};
use dotenv::dotenv;
use http::{Method, header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE}};
use model::AppState;
use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;

use crate::handler::health_checker;

#[tokio::main]
async fn main() {
    dotenv().ok();

    let db = AppState::init();

    let cors = CorsLayer::new()
        .allow_origin("http://localhost:3000".parse::<http::HeaderValue>().unwrap())
        .allow_methods([Method::GET, Method::POST])
        .allow_headers([CONTENT_TYPE, AUTHORIZATION, ACCEPT])
        .allow_credentials(true);

    println!("🚀 Server started successfully");

    let app = Router::new()
        .route("/healthchecker", health_checker)
        .with_state(db);

    let listener = TcpListener::bind("0.0.0.0:3000").await.unwrap();
    serve(listener, app).await.unwrap();

    // HttpServer::new(move || {
    //     let cors = Cors::default()
    //         .allowed_origin("http://localhost:3000")
    //         .allowed_methods(vec!["GET", "POST"])
    //         .allowed_headers(vec![
    //             header::CONTENT_TYPE,
    //             header::AUTHORIZATION,
    //             header::ACCEPT,
    //         ])
    //         .supports_credentials();
    //     App::new()
    //         .app_data(app_data.clone())
    //         .service(actix_files::Files::new("/api/images", &public_dir))
    //         .configure(handler::config)
    //         .wrap(cors)
    //         .wrap(Logger::default())
    // })
    // .bind(("127.0.0.1", 8000))?
    // .run()
    // .await
}
