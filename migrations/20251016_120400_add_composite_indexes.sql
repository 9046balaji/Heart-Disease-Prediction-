-- Migration: 20251016_120400_add_composite_indexes.sql
-- Add composite indexes for common query patterns to improve performance

-- UP: Add composite indexes
-- ================================================

-- Food logs: Common query - get user's logs for a date range
CREATE INDEX idx_food_logs_user_date 
  ON food_logs(user_id, logged_at DESC);

-- Food logs: Query by user + meal type + date (for daily summaries)
CREATE INDEX idx_food_logs_user_meal_date 
  ON food_logs(user_id, meal_type, logged_at DESC);

-- Lab results: Query by user + type + date (for trend analysis)
CREATE INDEX idx_lab_results_user_type_date 
  ON lab_results(user_id, type, date DESC);

-- Symptoms: Query by user + date (for timeline)
CREATE INDEX idx_symptoms_user_timestamp 
  ON symptoms(user_id, timestamp DESC);

-- Symptoms: Query by user + type + date
CREATE INDEX idx_symptoms_user_type_timestamp 
  ON symptoms(user_id, type, timestamp DESC);

-- Workout logs: Query by user + date
CREATE INDEX idx_workout_logs_user_date 
  ON workout_logs(user_id, completed_at DESC);

-- Predictions: Query by user + date
CREATE INDEX idx_predictions_user_timestamp 
  ON predictions(user_id, timestamp DESC);

-- Clinical entries: Query by user + date
CREATE INDEX idx_clinical_entries_user_timestamp 
  ON clinical_entries(user_id, timestamp DESC);

-- Medications: Query active medications by user
CREATE INDEX idx_medications_user_active 
  ON medications(user_id, taken, end_date);

-- Forum posts: Query by category + recent
CREATE INDEX idx_forum_posts_category_created 
  ON forum_posts(category_id, created_at DESC);

-- Forum posts: Query by user + recent
CREATE INDEX idx_forum_posts_user_created 
  ON forum_posts(user_id, created_at DESC);

-- Forum replies: Query by post + recent
CREATE INDEX idx_forum_replies_post_created 
  ON forum_replies(post_id, created_at DESC);

-- Health goals: Query active goals by user
CREATE INDEX idx_health_goals_user_active 
  ON health_goals(user_id, is_completed, deadline);

-- Challenge participations: Query by user + active
CREATE INDEX idx_challenge_participations_user_active 
  ON user_challenge_participations(user_id, is_completed, start_date DESC);

-- Tele-consult: Query by user + status + appointment date
CREATE INDEX idx_tele_consult_user_status_date 
  ON tele_consult_bookings(user_id, status, appointment_date);

-- Safety checks: Query by user + recent
CREATE INDEX idx_safety_checks_user_completed 
  ON safety_checks(user_id, completed_at DESC);

-- Privacy consents: Query by user + type + recent
CREATE INDEX idx_privacy_consents_user_type_timestamp 
  ON privacy_consents(user_id, consent_type, timestamp DESC);

-- Covering index for username lookups (authentication)
CREATE INDEX idx_users_username_password 
  ON users(username(255), password(255));

-- ================================================
-- DOWN: Remove composite indexes
-- ================================================

DROP INDEX idx_food_logs_user_date ON food_logs;
DROP INDEX idx_food_logs_user_meal_date ON food_logs;
DROP INDEX idx_lab_results_user_type_date ON lab_results;
DROP INDEX idx_symptoms_user_timestamp ON symptoms;
DROP INDEX idx_symptoms_user_type_timestamp ON symptoms;
DROP INDEX idx_workout_logs_user_date ON workout_logs;
DROP INDEX idx_predictions_user_timestamp ON predictions;
DROP INDEX idx_clinical_entries_user_timestamp ON clinical_entries;
DROP INDEX idx_medications_user_active ON medications;
DROP INDEX idx_forum_posts_category_created ON forum_posts;
DROP INDEX idx_forum_posts_user_created ON forum_posts;
DROP INDEX idx_forum_replies_post_created ON forum_replies;
DROP INDEX idx_health_goals_user_active ON health_goals;
DROP INDEX idx_challenge_participations_user_active ON user_challenge_participations;
DROP INDEX idx_tele_consult_user_status_date ON tele_consult_bookings;
DROP INDEX idx_safety_checks_user_completed ON safety_checks;
DROP INDEX idx_privacy_consents_user_type_timestamp ON privacy_consents;
DROP INDEX idx_users_username_password ON users;