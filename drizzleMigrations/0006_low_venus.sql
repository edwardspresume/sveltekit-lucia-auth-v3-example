DROP TABLE `oauth_accounts`;--> statement-breakpoint
ALTER TABLE users ADD `auth_provider` text NOT NULL;--> statement-breakpoint
ALTER TABLE users ADD `oauth_provider_user_id` text;--> statement-breakpoint
ALTER TABLE `users` DROP COLUMN `username`;