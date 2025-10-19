-- Migration: 20251016_120000_normalize_user_allergies.sql
-- Normalize allergies into a separate table to enable efficient querying and FK constraints

-- UP: Normalize allergies into a separate table
-- ================================================

-- Create user_allergies table with proper constraints
CREATE TABLE IF NOT EXISTS user_allergies (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  allergen VARCHAR(100) NOT NULL,
  severity ENUM('mild', 'moderate', 'severe', 'life_threatening') DEFAULT 'moderate',
  diagnosed_date DATE,
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_allergies_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  
  -- Prevent duplicate allergen entries per user
  UNIQUE KEY uk_user_allergen (user_id, allergen)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_user_allergies_user_id ON user_allergies(user_id);
CREATE INDEX idx_user_allergies_allergen ON user_allergies(allergen);
CREATE INDEX idx_user_allergies_severity ON user_allergies(severity);

-- ================================================
-- DOWN: Rollback to JSON column (if needed for rollback)
-- ================================================

-- First, migrate data back to JSON (only if needed for rollback)
-- UPDATE user_profiles up
-- SET allergies = (
--   SELECT JSON_ARRAYAGG(allergen)
--   FROM user_allergies
--   WHERE user_id = up.user_id
-- );

-- DROP TABLE IF EXISTS user_allergies;