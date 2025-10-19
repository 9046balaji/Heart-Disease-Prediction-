CREATE TABLE `forum_categories` (
	`id` varchar(36) NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text,
	`post_count` int NOT NULL DEFAULT 0,
	`created_at` datetime NOT NULL,
	CONSTRAINT `forum_categories_id` PRIMARY KEY(`id`)
);

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