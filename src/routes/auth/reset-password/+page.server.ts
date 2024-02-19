import type { Actions, PageServerLoad } from './$types';

import { superValidate } from 'sveltekit-superforms/server';

import { verifyPasswordResetToken } from '$lib/database/authUtils.server';
import { PasswordResetZodSchema } from '$validations/AuthZodSchemas';

export const load = (async ({ url }) => {
	const passwordResetToken = url.searchParams.get('token') as string;

	return {
		verifyPasswordResetTokenResult: await verifyPasswordResetToken(passwordResetToken),
		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async () => {}
};
