-- Migration to convert inefficient TEXT columns to VARCHAR(255) for better performance
-- This addresses the issue where many columns that should be VARCHAR(255) were defined as TEXT

-- UP: Convert TEXT columns to VARCHAR(255)
-- ================================================

-- Convert username in users table
ALTER TABLE users MODIFY COLUMN username VARCHAR(255) NOT NULL;

-- Convert title in recipes table
ALTER TABLE recipes MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Convert title in forum_posts table
ALTER TABLE forum_posts MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Convert name in medications table
ALTER TABLE medications MODIFY COLUMN name VARCHAR(255) NOT NULL;

-- Convert dosage in medications table
ALTER TABLE medications MODIFY COLUMN dosage VARCHAR(255) NOT NULL;

-- Convert frequency in medications table
ALTER TABLE medications MODIFY COLUMN frequency VARCHAR(255) NOT NULL;

-- Convert time in medications table
ALTER TABLE medications MODIFY COLUMN time VARCHAR(255) NOT NULL;

-- Convert name in meal_plans table
ALTER TABLE meal_plans MODIFY COLUMN name VARCHAR(255) NOT NULL;

-- Convert title in exercises table
ALTER TABLE exercises MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Convert doctor_name in tele_consult_bookings table
ALTER TABLE tele_consult_bookings MODIFY COLUMN doctor_name VARCHAR(255) NOT NULL;

-- Convert doctor_specialty in tele_consult_bookings table
ALTER TABLE tele_consult_bookings MODIFY COLUMN doctor_specialty VARCHAR(255) NOT NULL;

-- Convert appointment_time in tele_consult_bookings table
ALTER TABLE tele_consult_bookings MODIFY COLUMN appointment_time VARCHAR(255) NOT NULL;

-- Convert name in forum_categories table
ALTER TABLE forum_categories MODIFY COLUMN name VARCHAR(255) NOT NULL;

-- Convert title in weekly_challenges table
ALTER TABLE weekly_challenges MODIFY COLUMN title VARCHAR(255) NOT NULL;

-- Convert food_category in portion_guidelines table
ALTER TABLE portion_guidelines MODIFY COLUMN food_category VARCHAR(255) NOT NULL;

-- Convert food_type in portion_guidelines table
ALTER TABLE portion_guidelines MODIFY COLUMN food_type VARCHAR(255) NOT NULL;

-- Convert type in symptoms table
ALTER TABLE symptoms MODIFY COLUMN type VARCHAR(255) NOT NULL;

-- Convert food_name in food_logs table
ALTER TABLE food_logs MODIFY COLUMN food_name VARCHAR(255);

-- Convert description in food_logs table
ALTER TABLE food_logs MODIFY COLUMN description VARCHAR(255);

-- Add comments to document the changes
ALTER TABLE users COMMENT = 'User accounts with VARCHAR(255) for username';
ALTER TABLE recipes COMMENT = 'Recipes with VARCHAR(255) for title';
ALTER TABLE forum_posts COMMENT = 'Forum posts with VARCHAR(255) for title';

-- ================================================
-- DOWN: Revert changes (convert back to TEXT)
-- ================================================

-- Revert username in users table
-- ALTER TABLE users MODIFY COLUMN username TEXT NOT NULL;

-- Revert title in recipes table
-- ALTER TABLE recipes MODIFY COLUMN title TEXT NOT NULL;

-- Revert title in forum_posts table
-- ALTER TABLE forum_posts MODIFY COLUMN title TEXT NOT NULL;

-- Revert name in medications table
-- ALTER TABLE medications MODIFY COLUMN name TEXT NOT NULL;

-- Revert dosage in medications table
-- ALTER TABLE medications MODIFY COLUMN dosage TEXT NOT NULL;

-- Revert frequency in medications table
-- ALTER TABLE medications MODIFY COLUMN frequency TEXT NOT NULL;

-- Revert time in medications table
-- ALTER TABLE medications MODIFY COLUMN time TEXT NOT NULL;

-- Revert name in meal_plans table
-- ALTER TABLE meal_plans MODIFY COLUMN name TEXT NOT NULL;

-- Revert title in exercises table
-- ALTER TABLE exercises MODIFY COLUMN title TEXT NOT NULL;

-- Revert doctor_name in tele_consult_bookings table
-- ALTER TABLE tele_consult_bookings MODIFY COLUMN doctor_name TEXT NOT NULL;

-- Revert doctor_specialty in tele_consult_bookings table
-- ALTER TABLE tele_consult_bookings MODIFY COLUMN doctor_specialty TEXT NOT NULL;

-- Revert appointment_time in tele_consult_bookings table
-- ALTER TABLE tele_consult_bookings MODIFY COLUMN appointment_time TEXT NOT NULL;

-- Revert name in forum_categories table
-- ALTER TABLE forum_categories MODIFY COLUMN name TEXT NOT NULL;

-- Revert title in weekly_challenges table
-- ALTER TABLE weekly_challenges MODIFY COLUMN title TEXT NOT NULL;

-- Revert food_category in portion_guidelines table
-- ALTER TABLE portion_guidelines MODIFY COLUMN food_category TEXT NOT NULL;

-- Revert food_type in portion_guidelines table
-- ALTER TABLE portion_guidelines MODIFY COLUMN food_type TEXT NOT NULL;

-- Revert type in symptoms table
-- ALTER TABLE symptoms MODIFY COLUMN type TEXT NOT NULL;

-- Revert food_name in food_logs table
-- ALTER TABLE food_logs MODIFY COLUMN food_name TEXT;

-- Revert description in food_logs table
-- ALTER TABLE food_logs MODIFY COLUMN description TEXT;

-- Remove comments
-- ALTER TABLE users COMMENT = '';
-- ALTER TABLE recipes COMMENT = '';
-- ALTER TABLE forum_posts COMMENT = '';