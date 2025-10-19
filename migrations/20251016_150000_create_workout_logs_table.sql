-- Create workout_logs table
-- This migration adds the workout_logs table to track completed exercises

CREATE TABLE IF NOT EXISTS workout_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  exercise_id VARCHAR(36),
  exercise_plan_id VARCHAR(36),
  duration_min INT,
  calories_burned INT,
  intensity ENUM('low', 'moderate', 'high'),
  notes TEXT,
  completed_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL,
  FOREIGN KEY (exercise_plan_id) REFERENCES exercise_plans(id) ON DELETE SET NULL
);

-- Add indexes for better performance
-- Check if indexes exist before creating them
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND index_name = 'idx_workout_logs_user_id');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_workout_logs_user_id ON workout_logs(user_id)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND index_name = 'idx_workout_logs_completed_at');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_workout_logs_completed_at ON workout_logs(completed_at)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND index_name = 'idx_workout_logs_exercise_id');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_workout_logs_exercise_id ON workout_logs(exercise_id)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND index_name = 'idx_workout_logs_plan_id');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_workout_logs_plan_id ON workout_logs(exercise_plan_id)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;