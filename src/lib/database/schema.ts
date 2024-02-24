import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const usersTable = sqliteTable('users', {
	id: text('id').primaryKey().notNull(),

	name: text('name'),

	avatarUrl: text('avatar_url'),

	githubId: integer('github_id', { mode: 'number' }).unique(),

	username: text('username'),

	email: text('email').unique(),

	isEmailVerified: integer('is_email_verified', { mode: 'boolean' }).default(false),

	password: text('password'),

	createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
});

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
