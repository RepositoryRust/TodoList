CREATE UNIQUE INDEX email_verifications_token_unique
ON email_verifications(token);

CREATE INDEX email_verifications_user_status_idx
ON email_verifications(user_id, used_at, expires_at);
