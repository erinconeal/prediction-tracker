CREATE TABLE `prediction_topics` (
	`prediction_id` text NOT NULL,
	`topic_id` text NOT NULL,
	PRIMARY KEY(`prediction_id`, `topic_id`),
	FOREIGN KEY (`prediction_id`) REFERENCES `predictions`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `prediction_topics_topic_idx` ON `prediction_topics` (`topic_id`);--> statement-breakpoint
CREATE TABLE `predictions` (
	`id` text PRIMARY KEY NOT NULL,
	`source_id` text NOT NULL,
	`text` text NOT NULL,
	`created_at` text NOT NULL,
	`finished_at` text,
	`target_date` text,
	`outcome` text DEFAULT 'still_open' NOT NULL,
	`evidence_url` text,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `predictions_source_idx` ON `predictions` (`source_id`);--> statement-breakpoint
CREATE INDEX `predictions_outcome_idx` ON `predictions` (`outcome`);--> statement-breakpoint
CREATE INDEX `predictions_created_at_idx` ON `predictions` (`created_at`);--> statement-breakpoint
CREATE TABLE `sources` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`display_name` text NOT NULL,
	`profile_url` text,
	`active` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sources_slug_unique` ON `sources` (`slug`);--> statement-breakpoint
CREATE TABLE `topic_parents` (
	`topic_id` text NOT NULL,
	`parent_topic_id` text NOT NULL,
	PRIMARY KEY(`topic_id`, `parent_topic_id`),
	FOREIGN KEY (`topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`parent_topic_id`) REFERENCES `topics`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `topic_parents_parent_idx` ON `topic_parents` (`parent_topic_id`);--> statement-breakpoint
CREATE TABLE `topics` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`kind` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `topics_slug_unique` ON `topics` (`slug`);