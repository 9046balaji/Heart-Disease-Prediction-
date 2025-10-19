-- Migration: Add user registration functionality
-- This migration adds proper user registration with password hashing

-- UP: Add user registration functionality
-- ================================================

-- Ensure the users table has the correct structure
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  -- MFA fields
  mfa_method VARCHAR(20), -- 'email', 'authenticator', 'sms'
  mfa_secret TEXT, -- For authenticator app
  phone_number TEXT, -- For SMS
  mfa_code TEXT, -- Temporary code for email/SMS
  mfa_expires_at DATETIME, -- Expiration time for MFA code
  email TEXT, -- For email MFA
  -- Biometric authentication fields
  biometric_template TEXT, -- Hashed biometric template
  biometric_type VARCHAR(20), -- 'fingerprint', 'face', 'voice'
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Add a stored procedure for user registration (MySQL 8.0+)
-- This is a simplified version - in practice, password hashing should be done in the application layer
DELIMITER //

CREATE PROCEDURE IF NOT EXISTS RegisterUser(
  IN p_username VARCHAR(255),
  IN p_password VARCHAR(255)
)
BEGIN
  DECLARE user_exists INT DEFAULT 0;
  DECLARE new_user_id VARCHAR(36);
  
  -- Check if user already exists
  SELECT COUNT(*) INTO user_exists FROM users WHERE username = p_username;
  
  IF user_exists = 0 THEN
    -- Generate a new UUID for the user
    SET new_user_id = UUID();
    
    -- Insert the new user (password should be hashed in the application)
    INSERT INTO users (
      id, 
      username, 
      password,
      created_at,
      updated_at
    ) VALUES (
      new_user_id,
      p_username,
      p_password,  -- In practice, this should be a bcrypt hash
      NOW(),
      NOW()
    );
    
    -- Return the new user ID
    SELECT new_user_id as user_id;
  ELSE
    -- Return NULL if user already exists
    SELECT NULL as user_id;
  END IF;
END//

DELIMITER ;

-- ================================================
-- DOWN: Remove user registration functionality
-- ================================================

-- Drop the stored procedure
DROP PROCEDURE IF EXISTS RegisterUser;