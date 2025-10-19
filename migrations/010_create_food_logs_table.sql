-- Create food_logs table
-- This migration adds the food_logs table to track user's food consumption

CREATE TABLE IF NOT EXISTS food_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  recipe_id VARCHAR(36),
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  food_name TEXT,
  calories INT,
  protein INT,
  carbs INT,
  fat INT,
  sodium INT,
  description TEXT,
  logged_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  
  -- Foreign key constraint will be added in a separate migration to avoid conflicts
);

-- Add indexes for better performance
-- Check if indexes exist before creating them
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND index_name = 'idx_food_logs_user_id');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_food_logs_user_id ON food_logs(user_id)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND index_name = 'idx_food_logs_logged_at');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_food_logs_logged_at ON food_logs(logged_at)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;