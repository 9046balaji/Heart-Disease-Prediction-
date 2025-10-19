CREATE TABLE `clinical_entries` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`timestamp` datetime NOT NULL,
	`age` int NOT NULL,
	`sex` int NOT NULL,
	`cp` int NOT NULL,
	`trestbps` int NOT NULL,
	`chol` int NOT NULL,
	`fbs` int NOT NULL,
	`restecg` int NOT NULL,
	`thalach` int NOT NULL,
	`exang` int NOT NULL,
	`oldpeak` int NOT NULL,
	`slope` int NOT NULL,
	`ca` int NOT NULL,
	`thal` int NOT NULL,
	`height` int,
	`weight` int,
	`smoking_status` enum('never','former','current'),
	CONSTRAINT `clinical_entries_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `exercise_plans` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`level` enum('beginner','intermediate','advanced') NOT NULL,
	`duration` int NOT NULL,
	`weekly_goal` text NOT NULL,
	`exercises` json NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `exercise_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_categories` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`post_count` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	CONSTRAINT `forum_categories_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_posts` (
	`id` varchar(36) NOT NULL,
	`category_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`reply_count` int NOT NULL DEFAULT 0,
	`view_count` int NOT NULL DEFAULT 0,
	`is_pinned` boolean NOT NULL DEFAULT false,
	`is_locked` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `forum_posts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `forum_replies` (
	`id` varchar(36) NOT NULL,
	`post_id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`content` text NOT NULL,
	`is_accepted_answer` boolean NOT NULL DEFAULT false,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `forum_replies_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `goal_achievements` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`goal_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`badge_icon` text,
	`awarded_date` datetime NOT NULL,
	CONSTRAINT `goal_achievements_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `health_goals` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`category` enum('diet','exercise','medication','sleep','stress','other') NOT NULL,
	`target_value` int NOT NULL,
	`current_value` int NOT NULL DEFAULT 0,
	`unit` text NOT NULL,
	`deadline` datetime,
	`is_completed` boolean NOT NULL DEFAULT false,
	`completion_date` datetime,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `health_goals_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `lab_results` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`type` enum('bloodPressure','cholesterol','hba1c') NOT NULL,
	`systolic` int,
	`diastolic` int,
	`total_cholesterol` int,
	`ldl` int,
	`hdl` int,
	`triglycerides` int,
	`hba1c` int,
	`date` datetime NOT NULL,
	`notes` text,
	`created_at` datetime NOT NULL,
	CONSTRAINT `lab_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `meal_plans` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`calories` int NOT NULL,
	`tags` json NOT NULL,
	`meals` json NOT NULL,
	`created_at` datetime NOT NULL,
	CONSTRAINT `meal_plans_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `medications` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`dosage` text NOT NULL,
	`frequency` text NOT NULL,
	`time` text NOT NULL,
	`start_date` datetime NOT NULL,
	`end_date` datetime,
	`taken` boolean NOT NULL DEFAULT false,
	`taken_history` json NOT NULL,
	CONSTRAINT `medications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`clinical_entry_id` varchar(36) NOT NULL,
	`timestamp` datetime NOT NULL,
	`score` int NOT NULL,
	`label` enum('low','medium','high') NOT NULL,
	`model_version` varchar(20) NOT NULL,
	`shap_top_features` json NOT NULL,
	CONSTRAINT `predictions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `tele_consult_bookings` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`doctor_name` text NOT NULL,
	`doctor_specialty` text NOT NULL,
	`appointment_date` datetime NOT NULL,
	`appointment_time` text NOT NULL,
	`status` enum('scheduled','completed','cancelled') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`created_at` datetime NOT NULL,
	`updated_at` datetime NOT NULL,
	CONSTRAINT `tele_consult_bookings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_challenge_participations` (
	`id` varchar(36) NOT NULL,
	`user_id` varchar(36) NOT NULL,
	`challenge_id` varchar(36) NOT NULL,
	`start_date` datetime NOT NULL,
	`completion_date` datetime,
	`is_completed` boolean NOT NULL DEFAULT false,
	`progress` int NOT NULL DEFAULT 0,
	`earned_points` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	CONSTRAINT `user_challenge_participations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(36) NOT NULL,
	`username` text NOT NULL,
	`password` text NOT NULL,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_username_unique` UNIQUE(`username`)
);
--> statement-breakpoint
CREATE TABLE `weekly_challenges` (
	`id` varchar(36) NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` enum('diet','exercise','medication','sleep','stress','other') NOT NULL,
	`difficulty` enum('beginner','intermediate','advanced') NOT NULL,
	`points` int NOT NULL,
	`duration_days` int NOT NULL,
	`start_date` datetime NOT NULL,
	`end_date` datetime NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`created_at` datetime NOT NULL,
	CONSTRAINT `weekly_challenges_id` PRIMARY KEY(`id`)
);
