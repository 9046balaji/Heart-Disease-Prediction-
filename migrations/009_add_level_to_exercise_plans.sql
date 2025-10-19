-- Add level column to exercise_plans table (if it doesn't already exist)
ALTER TABLE exercise_plans 
ADD COLUMN level ENUM('beginner', 'intermediate', 'advanced') NOT NULL DEFAULT 'beginner';

-- Remove the default constraint after setting appropriate values
ALTER TABLE exercise_plans 
ALTER COLUMN level DROP DEFAULT;