import { usersTable } from '$lib/database/schema';
import { createInsertSchema } from 'drizzle-zod';

export const MIN_NAME_LENGTH = 2;
export const MAX_NAME_LENGTH = 50;
export const MIN_PASSWORD_LENGTH = 2;

export const RegisterUserZodSchema = createInsertSchema(usersTable, {
	name: (schema) =>
		schema.name
			.min(MIN_NAME_LENGTH, `Name must be at least ${MIN_NAME_LENGTH} characters long`)
			.max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters long`),

	email: (schema) => schema.email.email(),

	password: (schema) =>
		schema.password.min(
			MIN_PASSWORD_LENGTH,
			`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
		)
});
