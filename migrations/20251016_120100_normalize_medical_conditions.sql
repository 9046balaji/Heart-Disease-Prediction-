-- Migration: 20251016_120100_normalize_medical_conditions.sql
-- Normalize medical conditions into separate tables to enable efficient querying and FK constraints

-- UP: Normalize medical conditions into separate tables
-- ================================================

-- Create medical_condition_types table for standardized condition types
CREATE TABLE IF NOT EXISTS medical_condition_types (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(100) NOT NULL UNIQUE,
  category ENUM('cardiovascular', 'metabolic', 'respiratory', 'neurological', 'other') NOT NULL,
  description TEXT,
  icd_code VARCHAR(20), -- ICD-10 code
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Create user_medical_conditions table to link users to their conditions
CREATE TABLE IF NOT EXISTS user_medical_conditions (
  id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id VARCHAR(36) NOT NULL,
  condition_id VARCHAR(36) NOT NULL,
  diagnosed_date DATE,
  status ENUM('active', 'managed', 'resolved') DEFAULT 'active',
  notes TEXT,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  CONSTRAINT fk_user_conditions_user 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_conditions_type 
    FOREIGN KEY (condition_id) REFERENCES medical_condition_types(id),
  
  UNIQUE KEY uk_user_condition (user_id, condition_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add indexes for better performance
CREATE INDEX idx_user_conditions_user_id ON user_medical_conditions(user_id);
CREATE INDEX idx_user_conditions_condition_id ON user_medical_conditions(condition_id);
CREATE INDEX idx_user_conditions_status ON user_medical_conditions(status);

-- Pre-populate common cardiovascular conditions
INSERT INTO medical_condition_types (name, category, icd_code) VALUES
('Hypertension', 'cardiovascular', 'I10'),
('Type 2 Diabetes', 'metabolic', 'E11'),
('Coronary Artery Disease', 'cardiovascular', 'I25'),
('Hyperlipidemia', 'metabolic', 'E78'),
('Atrial Fibrillation', 'cardiovascular', 'I48'),
('Heart Failure', 'cardiovascular', 'I50');

-- ================================================
-- DOWN: Rollback medical conditions normalization
-- ================================================

-- DROP TABLE IF EXISTS user_medical_conditions;
-- DROP TABLE IF EXISTS medical_condition_types;