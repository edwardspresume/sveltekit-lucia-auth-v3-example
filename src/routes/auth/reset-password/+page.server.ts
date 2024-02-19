import type { Actions, PageServerLoad } from './$types';

import { superValidate } from 'sveltekit-superforms/server';

import { PasswordResetZodSchema } from '$validations/AuthZodSchemas';

export const load = (async () => {
	return {
		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async () => {}
};
