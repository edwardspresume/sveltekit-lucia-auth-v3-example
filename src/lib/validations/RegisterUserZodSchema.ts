import { usersTable } from '$lib/database/schema';
import { createInsertSchema } from 'drizzle-zod';

export const MAX_NAME_LENGTH = 50;

export const RegisterUserZodSchema = createInsertSchema(usersTable, {
	name: (schema) =>
		schema.name
			.min(2, 'Name must be at least 2 characters long')
			.max(MAX_NAME_LENGTH, `Name must be less than ${MAX_NAME_LENGTH} characters long`),
	email: (schema) => schema.email.email(),
	password: (schema) => schema.password.min(2, 'Password must be at least 2 characters long')
});
