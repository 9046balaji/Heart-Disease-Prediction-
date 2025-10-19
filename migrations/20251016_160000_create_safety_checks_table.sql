-- Create safety_checks table
-- This migration adds the safety_checks table for pre-exercise verification

CREATE TABLE IF NOT EXISTS safety_checks (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  exercise_plan_id VARCHAR(36),
  exercise_id VARCHAR(36),
  -- Safety questions and responses
  feeling_well BOOLEAN NOT NULL, -- Are you feeling well today?
  chest_pain BOOLEAN NOT NULL, -- Do you have chest pain?
  dizziness BOOLEAN NOT NULL, -- Do you feel dizzy or lightheaded?
  joint_pain BOOLEAN NOT NULL, -- Do you have joint or muscle pain?
  medication_taken BOOLEAN NOT NULL, -- Have you taken your medication as prescribed?
  notes TEXT, -- Additional notes or concerns
  -- Risk assessment
  risk_level ENUM('low', 'moderate', 'high'), -- Calculated risk level
  recommendations JSON, -- JSON array of safety recommendations
  approved BOOLEAN NOT NULL DEFAULT FALSE, -- Whether the safety check was approved
  approved_by VARCHAR(36), -- Clinician ID if approved by clinician
  approved_at DATETIME, -- When it was approved
  completed_at DATETIME NOT NULL, -- When the safety check was completed
  created_at DATETIME NOT NULL,
  
  -- Foreign key constraints
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Add indexes for better performance
-- Check if indexes exist before creating them
SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'safety_checks' AND index_name = 'idx_safety_checks_user_id');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_safety_checks_user_id ON safety_checks(user_id)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'safety_checks' AND index_name = 'idx_safety_checks_completed_at');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_safety_checks_completed_at ON safety_checks(completed_at)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = 'safety_checks' AND index_name = 'idx_safety_checks_approved');
SET @sql = IF(@index_exists = 0, 'CREATE INDEX idx_safety_checks_approved ON safety_checks(approved)', 'SELECT ''Index already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;