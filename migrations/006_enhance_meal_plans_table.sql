-- Enhance meal_plans table structure
ALTER TABLE meal_plans 
ADD COLUMN start_date DATETIME,
ADD COLUMN days JSON,
ADD COLUMN metadata JSON;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_meal_plans_start_date ON meal_plans(start_date);