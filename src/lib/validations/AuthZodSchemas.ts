import { createInsertSchema } from 'drizzle-zod';

import { usersTable } from '$lib/database/schema';

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;
export const NAME_MIN_ERROR_MESSAGE = `Name must be at least ${MIN_NAME_LENGTH} characters long`;
export const NAME_MAX_ERROR_MESSAGE = `Name must be less than ${MAX_NAME_LENGTH} characters long`;

export const MAX_EMAIL_LENGTH = 254;
export const EMAIL_MAX_ERROR_MESSAGE = `Email must be less than ${MAX_EMAIL_LENGTH} characters long`;

export const MIN_PASSWORD_LENGTH = 2;
export const MAX_PASSWORD_LENGTH = 128;
export const PASSWORD_MIN_ERROR_MESSAGE = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`;
export const PASSWORD_MAX_ERROR_MESSAGE = `Password must be less than ${MAX_PASSWORD_LENGTH} characters long`;

export const RegisterUserZodSchema = createInsertSchema(usersTable, {
	name: (schema) =>
		schema.name
			.min(MIN_NAME_LENGTH, NAME_MIN_ERROR_MESSAGE)
			.max(MAX_NAME_LENGTH, NAME_MAX_ERROR_MESSAGE),

	email: (schema) => schema.email.email().max(MAX_EMAIL_LENGTH, EMAIL_MAX_ERROR_MESSAGE),

	password: (schema) =>
		schema.password
			.min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_ERROR_MESSAGE)
			.max(MAX_PASSWORD_LENGTH, PASSWORD_MAX_ERROR_MESSAGE)
});

export const UserLoginZodSchema = RegisterUserZodSchema.pick({ email: true, password: true });
