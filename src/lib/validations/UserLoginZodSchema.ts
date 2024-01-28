import { z } from 'zod';

import { MIN_PASSWORD_LENGTH, PASSWORD_ERROR_MESSAGE } from './validationConstants';

export const UserLoginZodSchema = z.object({
	email: z.string().email(),
	password: z.string().min(MIN_PASSWORD_LENGTH, PASSWORD_ERROR_MESSAGE)
});
