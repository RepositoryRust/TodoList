use resend_rs::types::{CreateEmailBaseOptions, EmailTemplate};

pub fn confirmation_email(to: String) -> CreateEmailBaseOptions {
    let from = std::env::var("EMAIL_FROM").unwrap();

    let subject = "Email Confirmation".to_string();
    
    let template = EmailTemplate::new("confirm-email");
    
    let email = CreateEmailBaseOptions::new(from, vec![to], subject)
        .with_template(template);
    email
}
