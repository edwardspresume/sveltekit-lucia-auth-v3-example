CREATE TABLE `oauth_accounts` (
	`user_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`provider_user_id` text NOT NULL,
	PRIMARY KEY(`provider_id`, `provider_user_id`),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `auth_provider`;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `oauth_provider_user_id`;