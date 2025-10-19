-- Add user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dob DATETIME,
  sex ENUM('male', 'female', 'other'),
  height_cm INT,
  weight_kg INT,
  diet_preference ENUM('vegetarian', 'non-veg', 'vegan', 'pescatarian'),
  allergies JSON,
  medical_conditions JSON,
  medications JSON,
  mobility_limitations ENUM('none', 'knee_pain', 'balance_issues'),
  calorie_target INT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Add recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(36) PRIMARY KEY,
  title TEXT NOT NULL,
  tags JSON NOT NULL,
  ingredients JSON NOT NULL,
  nutrients JSON NOT NULL,
  steps JSON NOT NULL,
  allergen_flags JSON NOT NULL,
  medication_interactions JSON NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);