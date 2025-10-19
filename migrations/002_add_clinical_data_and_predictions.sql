-- Add clinical entries table
CREATE TABLE IF NOT EXISTS clinical_entries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  timestamp DATETIME NOT NULL,
  age INT NOT NULL,
  sex INT NOT NULL,
  cp INT NOT NULL,
  trestbps INT NOT NULL,
  chol INT NOT NULL,
  fbs INT NOT NULL,
  restecg INT NOT NULL,
  thalach INT NOT NULL,
  exang INT NOT NULL,
  oldpeak INT NOT NULL,
  slope INT NOT NULL,
  ca INT NOT NULL,
  thal INT NOT NULL,
  height INT,
  weight INT,
  smoking_status ENUM('never', 'former', 'current')
);

-- Add predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  clinical_entry_id VARCHAR(36) NOT NULL,
  timestamp DATETIME NOT NULL,
  score INT NOT NULL,
  label ENUM('low', 'medium', 'high') NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  shap_top_features JSON NOT NULL
);

-- Add medications table
CREATE TABLE IF NOT EXISTS medications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  time TEXT NOT NULL,
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  taken BOOLEAN NOT NULL DEFAULT FALSE,
  taken_history JSON NOT NULL
);

-- Add meal plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  calories INT NOT NULL,
  tags JSON NOT NULL,
  meals JSON NOT NULL,
  created_at DATETIME NOT NULL
);

-- Add exercise plans table
CREATE TABLE IF NOT EXISTS exercise_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  duration INT NOT NULL,
  weekly_goal TEXT NOT NULL,
  exercises JSON NOT NULL,
  created_at DATETIME NOT NULL
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clinical_entries_user_id ON clinical_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_user_id ON predictions(user_id);
CREATE INDEX IF NOT EXISTS idx_predictions_clinical_entry_id ON predictions(clinical_entry_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_id ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_user_id ON meal_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_plans_user_id ON exercise_plans(user_id);