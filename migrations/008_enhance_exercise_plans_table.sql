-- Enhance exercise_plans table structure
ALTER TABLE exercise_plans 
ADD COLUMN duration_weeks INT,
ADD COLUMN days JSON,
ADD COLUMN safety_flags JSON,
ADD COLUMN metadata JSON;