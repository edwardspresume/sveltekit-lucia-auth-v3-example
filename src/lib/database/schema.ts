import { sql } from 'drizzle-orm';
import { integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
	id: text('id').primaryKey().notNull(),

	name: text('name'),

	avatarUrl: text('avatar_url'),

	email: text('email').unique().notNull(),

	isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).default(false),

	password: text('password'),

	authProviders: text('auth_providers', { mode: 'json' }).$type<string[]>().notNull(),

	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

export const oauthAccountsTable = sqliteTable(
	'oauth_accounts',
	{
		userId: text('user_id')
			.notNull()
			.references(() => usersTable.id),

		providerId: text('provider_id').notNull(),

		providerUserId: text('provider_user_id').notNull()
	},
	(t) => ({
		pk: primaryKey({ columns: [t.providerId, t.providerUserId] })
	})
);

export const emailVerificationCodesTable = sqliteTable('email_verification_codes', {
	id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),

	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),

	code: text('code').notNull(),

	email: text('email').notNull(),

	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export const usersSessionsTable = sqliteTable('users_sessions', {
	id: text('id').primaryKey().notNull(),

	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),

	expiresAt: integer('expires_at').notNull()
});

export const passwordResetTokensTable = sqliteTable('password_reset_tokens', {
	id: text('id').primaryKey().notNull().unique(),

	userId: text('user_id')
		.notNull()
		.references(() => usersTable.id),

	expiresAt: integer('expires_at', { mode: 'timestamp' }).notNull()
});

export type UserInsertSchema = typeof usersTable.$inferInsert;
