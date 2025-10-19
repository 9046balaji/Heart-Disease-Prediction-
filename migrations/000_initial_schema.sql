-- Consolidated initial schema migration
-- This squashes all the initial migrations (0000 to 014) into a single clean schema file
-- This addresses the chaotic initial migration history issue

-- UP: Create complete initial schema
-- ================================================

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  -- MFA fields
  mfa_method VARCHAR(20), -- 'email', 'authenticator', 'sms'
  mfa_secret TEXT, -- For authenticator app
  phone_number TEXT, -- For SMS
  mfa_code TEXT, -- Temporary code for email/SMS
  mfa_expires_at DATETIME, -- Expiration time for MFA code
  email TEXT, -- For email MFA
  -- Biometric authentication fields
  biometric_template TEXT, -- Hashed biometric template
  biometric_type VARCHAR(20), -- 'fingerprint', 'face', 'voice'
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  COMMENT 'User accounts with bcrypt hashed passwords'
);

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  dob DATETIME,
  sex ENUM('male', 'female', 'other'),
  height_cm INT,
  weight_kg INT,
  diet_preference ENUM('vegetarian', 'non-veg', 'vegan', 'pescatarian'),
  allergies JSON, -- JSON array of allergies
  medical_conditions JSON, -- JSON array of medical conditions
  medications JSON, -- JSON array of medications
  mobility_limitations ENUM('none', 'knee_pain', 'balance_issues'),
  calorie_target INT,
  -- Add new fields for advanced profile management
  health_history JSON, -- JSON array of health history entries
  family_medical_history JSON, -- JSON array of family medical history entries
  adverse_reactions JSON, -- JSON array of adverse reaction entries
  -- Add privacy controls
  privacy_settings JSON, -- JSON object for privacy settings
  consent_history JSON, -- JSON array of consent records
  data_sharing_preferences JSON, -- JSON object for data sharing preferences
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create clinical_entries table
CREATE TABLE IF NOT EXISTS clinical_entries (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  timestamp DATETIME NOT NULL,
  age INT NOT NULL,
  sex INT NOT NULL, -- 0 = female, 1 = male
  cp INT NOT NULL, -- chest pain type (0-3)
  trestbps INT NOT NULL, -- resting blood pressure
  chol INT NOT NULL, -- serum cholesterol
  fbs INT NOT NULL, -- fasting blood sugar > 120 mg/dl (0 = false, 1 = true)
  restecg INT NOT NULL, -- resting electrocardiographic results (0-2)
  thalach INT NOT NULL, -- maximum heart rate achieved
  exang INT NOT NULL, -- exercise induced angina (0 = no, 1 = yes)
  oldpeak INT NOT NULL, -- ST depression induced by exercise relative to rest
  slope INT NOT NULL, -- the slope of the peak exercise ST segment (0-2)
  ca INT NOT NULL, -- number of major vessels (0-3) colored by fluoroscopy
  thal INT NOT NULL, -- thalassemia (0 = normal, 1 = fixed defect, 2 = reversable defect)
  height INT, -- height in cm
  weight INT, -- weight in kg
  smoking_status ENUM('never', 'former', 'current')
);

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  clinical_entry_id VARCHAR(36) NOT NULL,
  timestamp DATETIME NOT NULL,
  score INT NOT NULL, -- Risk score between 0 and 100
  label ENUM('low', 'medium', 'high') NOT NULL,
  model_version VARCHAR(20) NOT NULL,
  shap_top_features JSON NOT NULL -- JSON array of SHAP explanations
);

-- Create medications table
CREATE TABLE IF NOT EXISTS medications (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  dosage VARCHAR(255) NOT NULL,
  frequency VARCHAR(255) NOT NULL,
  time VARCHAR(255) NOT NULL, -- Time of day to take medication (HH:MM format)
  start_date DATETIME NOT NULL,
  end_date DATETIME,
  taken BOOLEAN NOT NULL DEFAULT FALSE,
  taken_history JSON NOT NULL -- JSON array of taken history
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  calories INT NOT NULL,
  tags JSON NOT NULL, -- JSON array of tags
  meals JSON NOT NULL, -- JSON array of meals
  start_date DATETIME,
  days JSON, -- JSON array of daily meal plans
  metadata JSON, -- JSON object for additional metadata
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  duration_min INT,
  intensity ENUM('low', 'moderate', 'high'),
  instructions JSON, -- JSON array of step-by-step instructions
  gif_url TEXT,
  lottie_url TEXT,
  safety_considerations JSON, -- JSON array of safety considerations
  accessibility_options JSON, -- JSON array of accessibility options
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create exercise_plans table
CREATE TABLE IF NOT EXISTS exercise_plans (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  level ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  duration INT NOT NULL, -- in minutes
  duration_weeks INT, -- in weeks
  weekly_goal TEXT NOT NULL,
  days JSON, -- JSON array of daily exercise plans
  exercises JSON NOT NULL, -- JSON array of exercises
  safety_flags JSON, -- JSON array of safety flags
  metadata JSON, -- JSON object for additional metadata
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create tele_consult_bookings table
CREATE TABLE IF NOT EXISTS tele_consult_bookings (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  doctor_specialty VARCHAR(255) NOT NULL,
  appointment_date DATETIME NOT NULL,
  appointment_time VARCHAR(255) NOT NULL, -- Time in HH:MM format
  status ENUM('scheduled', 'completed', 'cancelled') NOT NULL DEFAULT 'scheduled',
  notes TEXT,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create forum_categories table
CREATE TABLE IF NOT EXISTS forum_categories (
  id VARCHAR(36) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  post_count INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL
);

-- Create forum_posts table
CREATE TABLE IF NOT EXISTS forum_posts (
  id VARCHAR(36) PRIMARY KEY,
  category_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  reply_count INT NOT NULL DEFAULT 0,
  view_count INT NOT NULL DEFAULT 0,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  COMMENT 'Forum posts with VARCHAR(255) for title'
);

-- Create forum_replies table
CREATE TABLE IF NOT EXISTS forum_replies (
  id VARCHAR(36) PRIMARY KEY,
  post_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  is_accepted_answer BOOLEAN NOT NULL DEFAULT FALSE,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create health_goals table
CREATE TABLE IF NOT EXISTS health_goals (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category ENUM('diet', 'exercise', 'medication', 'sleep', 'stress', 'other') NOT NULL,
  target_value INT NOT NULL,
  current_value INT NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  deadline DATETIME,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  completion_date DATETIME,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create goal_achievements table
CREATE TABLE IF NOT EXISTS goal_achievements (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  goal_id VARCHAR(36) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  badge_icon TEXT,
  awarded_date DATETIME NOT NULL
);

-- Create biometric_templates table
CREATE TABLE IF NOT EXISTS biometric_templates (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  template TEXT NOT NULL, -- Hashed biometric template
  type ENUM('fingerprint', 'face', 'voice') NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL
);

-- Create weekly_challenges table
CREATE TABLE IF NOT EXISTS weekly_challenges (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category ENUM('diet', 'exercise', 'medication', 'sleep', 'stress', 'other') NOT NULL,
  difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
  points INT NOT NULL,
  duration_days INT NOT NULL, -- How many days the challenge lasts
  start_date DATETIME NOT NULL,
  end_date DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at DATETIME NOT NULL
);

-- Create user_challenge_participations table
CREATE TABLE IF NOT EXISTS user_challenge_participations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  challenge_id VARCHAR(36) NOT NULL,
  start_date DATETIME NOT NULL,
  completion_date DATETIME,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  progress INT NOT NULL DEFAULT 0, -- Percentage of completion
  earned_points INT NOT NULL DEFAULT 0,
  created_at DATETIME NOT NULL
);

-- Create lab_results table
CREATE TABLE IF NOT EXISTS lab_results (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type ENUM('bloodPressure', 'cholesterol', 'hba1c') NOT NULL,
  -- Blood pressure fields
  systolic INT,
  diastolic INT,
  -- Cholesterol fields
  total_cholesterol INT,
  ldl INT,
  hdl INT,
  triglycerides INT,
  -- HbA1c field
  hba1c INT,
  date DATETIME NOT NULL,
  notes TEXT,
  created_at DATETIME NOT NULL
);

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  type VARCHAR(255) NOT NULL, -- Type of symptom (e.g., chest_pain, shortness_of_breath)
  severity INT, -- Severity on a scale (e.g., 1-10)
  duration TEXT, -- How long the symptom lasted
  notes TEXT, -- Additional notes about the symptom
  timestamp DATETIME NOT NULL,
  created_at DATETIME NOT NULL
);

-- Create food_logs table
CREATE TABLE IF NOT EXISTS food_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  recipe_id VARCHAR(36),
  meal_type ENUM('breakfast', 'lunch', 'dinner', 'snack') NOT NULL,
  food_name VARCHAR(255),
  calories INT,
  protein INT, -- in grams
  carbs INT, -- in grams
  fat INT, -- in grams
  sodium INT, -- in mg
  description VARCHAR(255), -- for free-text entries
  portion_size ENUM('small', 'medium', 'large'), -- for portion guidance
  logged_at DATETIME NOT NULL,
  created_at DATETIME NOT NULL
);

-- Create portion_guidelines table
CREATE TABLE IF NOT EXISTS portion_guidelines (
  id VARCHAR(36) PRIMARY KEY,
  food_category VARCHAR(255) NOT NULL,
  food_type VARCHAR(255) NOT NULL,
  small_portion TEXT NOT NULL, -- Description of small portion
  medium_portion TEXT NOT NULL, -- Description of medium portion
  large_portion TEXT NOT NULL, -- Description of large portion
  calories_per_unit INT, -- Calories per standard unit
  created_at DATETIME NOT NULL
);

-- Create workout_logs table
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
  created_at DATETIME NOT NULL
);

-- Create safety_checks table
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
  created_at DATETIME NOT NULL
);

-- Create privacy_consents table
CREATE TABLE IF NOT EXISTS privacy_consents (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  consent_type VARCHAR(50) NOT NULL, -- e.g., 'research', 'analytics', 'marketing'
  granted BOOLEAN NOT NULL,
  timestamp DATETIME NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  file_type ENUM('json', 'csv', 'pdf') NOT NULL,
  requested_at DATETIME NOT NULL,
  completed_at DATETIME,
  file_path TEXT
);

-- Create data_deletion_requests table
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  request_id VARCHAR(36) NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') NOT NULL DEFAULT 'pending',
  requested_at DATETIME NOT NULL,
  completed_at DATETIME,
  reason TEXT
);

-- Create recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  tags JSON NOT NULL, -- JSON array of tags
  ingredients JSON NOT NULL, -- JSON array of ingredients with quantities
  nutrients JSON NOT NULL, -- JSON object with nutritional information
  steps JSON NOT NULL, -- JSON array of preparation steps
  allergen_flags JSON NOT NULL, -- JSON array of allergen flags
  medication_interactions JSON NOT NULL, -- JSON array of medication interactions
  image_url TEXT, -- URL to recipe image
  dietary_restrictions JSON, -- JSON array of dietary restrictions (e.g., gluten-free, dairy-free)
  cooking_time INT, -- Total cooking time in minutes
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  COMMENT 'Recipes with VARCHAR(255) for title'
);

-- Add foreign key constraints
ALTER TABLE user_profiles ADD CONSTRAINT fk_user_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE clinical_entries ADD CONSTRAINT fk_clinical_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE predictions ADD CONSTRAINT fk_predictions_clinical_entry FOREIGN KEY (clinical_entry_id) REFERENCES clinical_entries(id) ON DELETE CASCADE;
ALTER TABLE predictions ADD CONSTRAINT fk_predictions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE medications ADD CONSTRAINT fk_medications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE meal_plans ADD CONSTRAINT fk_meal_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE exercise_plans ADD CONSTRAINT fk_exercise_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE food_logs ADD CONSTRAINT fk_food_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE food_logs ADD CONSTRAINT fk_food_logs_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL;
ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL;
ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_plan FOREIGN KEY (exercise_plan_id) REFERENCES exercise_plans(id) ON DELETE SET NULL;
ALTER TABLE safety_checks ADD CONSTRAINT fk_safety_checks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT fk_forum_posts_category FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE;
ALTER TABLE forum_posts ADD CONSTRAINT fk_forum_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_post FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE;
ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE health_goals ADD CONSTRAINT fk_health_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE goal_achievements ADD CONSTRAINT fk_goal_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE goal_achievements ADD CONSTRAINT fk_goal_achievements_goal FOREIGN KEY (goal_id) REFERENCES health_goals(id) ON DELETE CASCADE;
ALTER TABLE user_challenge_participations ADD CONSTRAINT fk_challenge_participations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE user_challenge_participations ADD CONSTRAINT fk_challenge_participations_challenge FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE;
ALTER TABLE tele_consult_bookings ADD CONSTRAINT fk_tele_consult_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE lab_results ADD CONSTRAINT fk_lab_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE symptoms ADD CONSTRAINT fk_symptoms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE portion_guidelines ADD CONSTRAINT fk_portion_guidelines_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_clinical_entries_user_timestamp ON clinical_entries(user_id, timestamp);
CREATE INDEX idx_predictions_user_timestamp ON predictions(user_id, timestamp);
CREATE INDEX idx_medications_user_active ON medications(user_id, taken, end_date);
CREATE INDEX idx_meal_plans_user ON meal_plans(user_id);
CREATE INDEX idx_exercise_plans_user ON exercise_plans(user_id);
CREATE INDEX idx_food_logs_user_date ON food_logs(user_id, logged_at DESC);
CREATE INDEX idx_food_logs_user_meal_date ON food_logs(user_id, meal_type, logged_at DESC);
CREATE INDEX idx_workout_logs_user_date ON workout_logs(user_id, completed_at DESC);
CREATE INDEX idx_safety_checks_user_completed ON safety_checks(user_id, completed_at DESC);
CREATE INDEX idx_forum_posts_category_created ON forum_posts(category_id, created_at DESC);
CREATE INDEX idx_forum_posts_user_created ON forum_posts(user_id, created_at DESC);
CREATE INDEX idx_forum_replies_post_created ON forum_replies(post_id, created_at DESC);
CREATE INDEX idx_health_goals_user_active ON health_goals(user_id, is_completed, deadline);
CREATE INDEX idx_challenge_participations_user_active ON user_challenge_participations(user_id, is_completed, start_date DESC);
CREATE INDEX idx_tele_consult_user_status_date ON tele_consult_bookings(user_id, status, appointment_date);
CREATE INDEX idx_lab_results_user_type_date ON lab_results(user_id, type, date DESC);
CREATE INDEX idx_symptoms_user_timestamp ON symptoms(user_id, timestamp DESC);
CREATE INDEX idx_symptoms_user_type_timestamp ON symptoms(user_id, type, timestamp DESC);

-- ================================================
-- DOWN: Drop all tables
-- ================================================

-- Drop tables in reverse order of creation to respect foreign key constraints
DROP TABLE IF EXISTS data_deletion_requests;
DROP TABLE IF EXISTS data_export_requests;
DROP TABLE IF EXISTS privacy_consents;
DROP TABLE IF EXISTS safety_checks;
DROP TABLE IF EXISTS workout_logs;
DROP TABLE IF EXISTS portion_guidelines;
DROP TABLE IF EXISTS food_logs;
DROP TABLE IF EXISTS symptoms;
DROP TABLE IF EXISTS lab_results;
DROP TABLE IF EXISTS tele_consult_bookings;
DROP TABLE IF EXISTS user_challenge_participations;
DROP TABLE IF EXISTS goal_achievements;
DROP TABLE IF EXISTS health_goals;
DROP TABLE IF EXISTS forum_replies;
DROP TABLE IF EXISTS forum_posts;
DROP TABLE IF EXISTS forum_categories;
DROP TABLE IF EXISTS exercise_plans;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS meal_plans;
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS predictions;
DROP TABLE IF EXISTS clinical_entries;
DROP TABLE IF EXISTS biometric_templates;
DROP TABLE IF EXISTS weekly_challenges;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS users;