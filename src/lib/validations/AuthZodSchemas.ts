import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

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

export const EMAIL_VERIFICATION_CODE_LENGTH = 8;

const passwordSchema = z
	.string()
	.min(MIN_PASSWORD_LENGTH, PASSWORD_MIN_ERROR_MESSAGE)
	.max(MAX_PASSWORD_LENGTH, PASSWORD_MAX_ERROR_MESSAGE)
	.refine((password) => /[a-z]/.test(password), {
		message: ' Requires a lowercase letter'
	})
	.refine((password) => /[A-Z]/.test(password), {
		message: ' Requires an uppercase letter'
	})
	.refine((password) => /\d/.test(password), {
		message: ' Requires a number'
	})
	.refine((password) => /[@$!%*?&]/.test(password), {
		message: ' Requires a special character'
	});

export const RegisterUserZodSchema = createInsertSchema(usersTable, {
	name: (schema) =>
		schema.name
			.min(MIN_NAME_LENGTH, NAME_MIN_ERROR_MESSAGE)
			.max(MAX_NAME_LENGTH, NAME_MAX_ERROR_MESSAGE),

	email: (schema) => schema.email.email().max(MAX_EMAIL_LENGTH, EMAIL_MAX_ERROR_MESSAGE),

	password: passwordSchema
});

export const UserLoginZodSchema = RegisterUserZodSchema.pick({ email: true, password: true });

export const EmailVerificationCodeZodSchema = z.object({
	verificationCode: z.string().length(EMAIL_VERIFICATION_CODE_LENGTH)
});

export const PasswordResetZodSchema = z
	.object({
		password: passwordSchema,
		confirmPassword: passwordSchema
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: " Passwords don't match",
		path: ['confirmPassword']
	});
