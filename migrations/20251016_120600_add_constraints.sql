-- Migration: 20251016_120600_add_constraints.sql
-- Add constraints and referential integrity to improve data quality

-- UP: Add constraints
-- ================================================

-- Add NOT NULL constraints where appropriate
ALTER TABLE users MODIFY email TEXT NOT NULL;
ALTER TABLE user_profiles MODIFY user_id VARCHAR(36) NOT NULL;
ALTER TABLE clinical_entries MODIFY user_id VARCHAR(36) NOT NULL;
ALTER TABLE predictions MODIFY user_id VARCHAR(36) NOT NULL;

-- Add UNIQUE constraints
ALTER TABLE users ADD UNIQUE INDEX uk_users_email (email(255));
ALTER TABLE recipes ADD UNIQUE INDEX uk_recipes_title (title(255));

-- Add CHECK constraints (MySQL 8.0.16+)
ALTER TABLE lab_results ADD CONSTRAINT chk_lab_results_systolic
  CHECK (systolic IS NULL OR (systolic >= 60 AND systolic <= 300));

ALTER TABLE lab_results ADD CONSTRAINT chk_lab_results_diastolic
  CHECK (diastolic IS NULL OR (diastolic >= 40 AND diastolic <= 200));

ALTER TABLE lab_results ADD CONSTRAINT chk_lab_results_cholesterol
  CHECK (total_cholesterol IS NULL OR (total_cholesterol >= 100 AND total_cholesterol <= 400));

ALTER TABLE lab_results ADD CONSTRAINT chk_lab_results_hba1c
  CHECK (hba1c IS NULL OR (hba1c >= 4 AND hba1c <= 15)); -- HbA1c in %

ALTER TABLE clinical_entries ADD CONSTRAINT chk_clinical_age
  CHECK (age >= 0 AND age <= 120);

ALTER TABLE clinical_entries ADD CONSTRAINT chk_clinical_trestbps
  CHECK (trestbps >= 60 AND trestbps <= 300);

ALTER TABLE food_logs ADD CONSTRAINT chk_food_logs_calories
  CHECK (calories IS NULL OR calories >= 0);

ALTER TABLE health_goals ADD CONSTRAINT chk_health_goals_target
  CHECK (target_value > 0);

-- ================================================
-- DOWN: Remove constraints
-- ================================================

ALTER TABLE users MODIFY email TEXT;
ALTER TABLE users DROP INDEX uk_users_email;
ALTER TABLE recipes DROP INDEX uk_recipes_title;
ALTER TABLE lab_results DROP CONSTRAINT chk_lab_results_systolic;
ALTER TABLE lab_results DROP CONSTRAINT chk_lab_results_diastolic;
ALTER TABLE lab_results DROP CONSTRAINT chk_lab_results_cholesterol;
ALTER TABLE lab_results DROP CONSTRAINT chk_lab_results_hba1c;
ALTER TABLE clinical_entries DROP CONSTRAINT chk_clinical_age;
ALTER TABLE clinical_entries DROP CONSTRAINT chk_clinical_trestbps;
ALTER TABLE food_logs DROP CONSTRAINT chk_food_logs_calories;
ALTER TABLE health_goals DROP CONSTRAINT chk_health_goals_target;