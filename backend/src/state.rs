use resend_rs::Resend;
use sqlx::{MySql, Pool, mysql::MySqlPoolOptions};

#[derive(Clone)]
pub struct AppState {
    pub pool: Pool<MySql>,
    pub resend: Resend,
    pub jwt_secret_access: String,
    pub jwt_secret_refresh: String,
}

impl AppState {
    pub async fn new() -> Self {
        let database_url = std::env::var("DATABASE_URL").unwrap();
        let resend_api_key = std::env::var("RESEND_API_KEY").unwrap();
        let jwt_secret_access = std::env::var("ACCESS_SECRET").unwrap();
        let jwt_secret_refresh = std::env::var("REFRESH_SECRET").unwrap();

        let pool = MySqlPoolOptions::new()
            .max_connections(10)
            .connect(&database_url)
            .await
            .expect("Failed to create MySQL connection pool");

        let resend = Resend::new(&resend_api_key);

        AppState {
            pool,
            resend,
            jwt_secret_access,
            jwt_secret_refresh,
        }
    }
}
