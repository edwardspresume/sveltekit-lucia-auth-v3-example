import { z } from 'zod';

export const UserLoginZodSchema = z.object({
	email: z.string().email(),
	password: z.string().min(2).max(100)
});
