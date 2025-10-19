-- Migration to add all missing foreign key constraints
-- This addresses the critical issue where the schema was missing foreign key relationships

-- Add FK from clinical_entries to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'clinical_entries' AND constraint_name = 'fk_clinical_entries_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE clinical_entries ADD CONSTRAINT fk_clinical_entries_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from predictions to clinical_entries
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'predictions' AND constraint_name = 'fk_predictions_clinical_entry');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE predictions ADD CONSTRAINT fk_predictions_clinical_entry FOREIGN KEY (clinical_entry_id) REFERENCES clinical_entries(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from predictions to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'predictions' AND constraint_name = 'fk_predictions_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE predictions ADD CONSTRAINT fk_predictions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from medications to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'medications' AND constraint_name = 'fk_medications_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE medications ADD CONSTRAINT fk_medications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from meal_plans to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'meal_plans' AND constraint_name = 'fk_meal_plans_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE meal_plans ADD CONSTRAINT fk_meal_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from exercise_plans to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'exercise_plans' AND constraint_name = 'fk_exercise_plans_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE exercise_plans ADD CONSTRAINT fk_exercise_plans_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from food_logs to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND constraint_name = 'fk_food_logs_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE food_logs ADD CONSTRAINT fk_food_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from food_logs to recipes (nullable)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'food_logs' AND constraint_name = 'fk_food_logs_recipe');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE food_logs ADD CONSTRAINT fk_food_logs_recipe FOREIGN KEY (recipe_id) REFERENCES recipes(id) ON DELETE SET NULL', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from workout_logs to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND constraint_name = 'fk_workout_logs_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from workout_logs to exercises (nullable)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND constraint_name = 'fk_workout_logs_exercise');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_exercise FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE SET NULL', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from workout_logs to exercise_plans (nullable)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'workout_logs' AND constraint_name = 'fk_workout_logs_plan');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE workout_logs ADD CONSTRAINT fk_workout_logs_plan FOREIGN KEY (exercise_plan_id) REFERENCES exercise_plans(id) ON DELETE SET NULL', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from safety_checks to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'safety_checks' AND constraint_name = 'fk_safety_checks_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE safety_checks ADD CONSTRAINT fk_safety_checks_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from forum_posts to forum_categories
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'forum_posts' AND constraint_name = 'fk_forum_posts_category');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE forum_posts ADD CONSTRAINT fk_forum_posts_category FOREIGN KEY (category_id) REFERENCES forum_categories(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from forum_posts to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'forum_posts' AND constraint_name = 'fk_forum_posts_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE forum_posts ADD CONSTRAINT fk_forum_posts_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from forum_replies to forum_posts
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'forum_replies' AND constraint_name = 'fk_forum_replies_post');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_post FOREIGN KEY (post_id) REFERENCES forum_posts(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from forum_replies to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'forum_replies' AND constraint_name = 'fk_forum_replies_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE forum_replies ADD CONSTRAINT fk_forum_replies_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from health_goals to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'health_goals' AND constraint_name = 'fk_health_goals_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE health_goals ADD CONSTRAINT fk_health_goals_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from goal_achievements to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'goal_achievements' AND constraint_name = 'fk_goal_achievements_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE goal_achievements ADD CONSTRAINT fk_goal_achievements_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from goal_achievements to health_goals
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'goal_achievements' AND constraint_name = 'fk_goal_achievements_goal');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE goal_achievements ADD CONSTRAINT fk_goal_achievements_goal FOREIGN KEY (goal_id) REFERENCES health_goals(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from user_challenge_participations to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_challenge_participations' AND constraint_name = 'fk_challenge_participations_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE user_challenge_participations ADD CONSTRAINT fk_challenge_participations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from user_challenge_participations to weekly_challenges
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'user_challenge_participations' AND constraint_name = 'fk_challenge_participations_challenge');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE user_challenge_participations ADD CONSTRAINT fk_challenge_participations_challenge FOREIGN KEY (challenge_id) REFERENCES weekly_challenges(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from tele_consult_bookings to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'tele_consult_bookings' AND constraint_name = 'fk_tele_consult_bookings_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE tele_consult_bookings ADD CONSTRAINT fk_tele_consult_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from lab_results to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'lab_results' AND constraint_name = 'fk_lab_results_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE lab_results ADD CONSTRAINT fk_lab_results_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from symptoms to users
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'symptoms' AND constraint_name = 'fk_symptoms_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE symptoms ADD CONSTRAINT fk_symptoms_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Add FK from portion_guidelines to users (after adding the column)
SET @fk_exists = (SELECT COUNT(*) FROM information_schema.table_constraints WHERE table_schema = DATABASE() AND table_name = 'portion_guidelines' AND constraint_name = 'fk_portion_guidelines_user');
SET @sql = IF(@fk_exists = 0, 'ALTER TABLE portion_guidelines ADD CONSTRAINT fk_portion_guidelines_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE', 'SELECT ''FK already exists''');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;