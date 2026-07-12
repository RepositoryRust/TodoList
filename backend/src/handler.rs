
use axum::Json;
use chrono::{prelude::*, Duration};
use jsonwebtoken::{encode, EncodingKey, Header};
use uuid::Uuid;

use crate::model::HealthResponse;

pub async fn health_checker() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "success",
        message: "How to Implement Google and GitHub OAuth2 in Rust",
    })
}

async fn register_user_handler(
    body: web::Json<RegisterUserSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let mut vec = data.db.lock().unwrap();

    let user = vec.iter().find(|user| user.email == body.email);

    if user.is_some() {
        return HttpResponse::Conflict()
            .json(serde_json::json!({"status": "fail","message": "Email already exist"}));
    }

    let uuid_id = Uuid::new_v4();
    let datetime = Utc::now();

    let user = User {
        id: Some(uuid_id.to_string()),
        name: body.name.to_owned(),
        verified: false,
        email: body.email.to_owned().to_lowercase(),
        provider: "local".to_string(),
        role: "user".to_string(),
        password: "".to_string(),
        photo: "default.png".to_string(),
        createdAt: Some(datetime),
        updatedAt: Some(datetime),
    };

    vec.push(user.to_owned());

    let json_response = UserResponse {
        status: "success".to_string(),
        data: UserData {
            user: user_to_response(&user),
        },
    };

    HttpResponse::Ok().json(json_response)
}

async fn login_user_handler(
    body: web::Json<LoginUserSchema>,
    data: web::Data<AppState>,
) -> impl Responder {
    let vec = data.db.lock().unwrap();

    let user = vec
        .iter()
        .find(|user| user.email == body.email.to_lowercase());

    if user.is_none() {
        return HttpResponse::BadRequest()
            .json(serde_json::json!({"status": "fail", "message": "Invalid email or password"}));
    }

    let user = user.unwrap().clone();

    if user.provider == "Google" {
        return HttpResponse::Unauthorized()
            .json(serde_json::json!({"status": "fail", "message": "Use Google OAuth2 instead"}));
    } else if user.provider == "GitHub" {
        return HttpResponse::Unauthorized()
            .json(serde_json::json!({"status": "fail", "message": "Use GitHub OAuth instead"}));
    }

    let jwt_secret = data.env.jwt_secret.to_owned();
    let now = Utc::now();
    let iat = now.timestamp() as usize;
    let exp = (now + Duration::minutes(data.env.jwt_max_age)).timestamp() as usize;
    let claims: TokenClaims = TokenClaims {
        sub: user.id.unwrap(),
        exp,
        iat,
    };

    let token = encode(
        &Header::default(),
        &claims,
        &EncodingKey::from_secret(jwt_secret.as_ref()),
    )
    .unwrap();

    let cookie = Cookie::build("token", token)
        .path("/")
        .max_age(ActixWebDuration::new(60 * data.env.jwt_max_age, 0))
        .http_only(true)
        .finish();

    HttpResponse::Ok()
        .cookie(cookie)
        .json(serde_json::json!({"status": "success"}))
}
