-- Add portion_size column to food_logs table
-- First check if column exists to avoid errors
SET @column_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND column_name = 'portion_size');
SET @sql = IF(@column_exists = 0, 'ALTER TABLE food_logs ADD COLUMN portion_size ENUM(''small'', ''medium'', ''large'')', 'SELECT ''Column already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Ensure all foreign key constraints are properly set
-- Check if foreign key exists before adding
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND constraint_name = 'fk_food_logs_user_id');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE food_logs ADD CONSTRAINT fk_food_logs_user_id FOREIGN KEY (user_id) REFERENCES users(id)', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lab_results' AND constraint_name = 'fk_lab_results_user_id');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE lab_results ADD CONSTRAINT fk_lab_results_user_id FOREIGN KEY (user_id) REFERENCES users(id)', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'symptoms' AND constraint_name = 'fk_symptoms_user_id');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE symptoms ADD CONSTRAINT fk_symptoms_user_id FOREIGN KEY (user_id) REFERENCES users(id)', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Note: portion_guidelines table does not have a user_id column, so we skip this FK

-- Create indexes for better performance (skip if they already exist)
-- These indexes should have been created in the original table creation scripts
-- We'll skip them here as they would cause errors if they already exist