CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL
);

-- Indexes for better performance
CREATE INDEX idx_users_username ON users(username);