CREATE TABLE users (
    id          CHAR(36)     NOT NULL PRIMARY KEY,
    name        VARCHAR(255),
    verified    BOOLEAN      NOT NULL DEFAULT false,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    provider    VARCHAR(50)  DEFAULT 'local',
    created_at  DATETIME     DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE email_verifications (
    id          CHAR(36)      NOT NULL PRIMARY KEY,
    user_id     CHAR(36)      NOT NULL,
    token       CHAR(64)      NOT NULL,
    used_at     DATETIME      DEFAULT NULL,
    expires_at  DATETIME      NOT NULL,
    created_at  DATETIME      DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
