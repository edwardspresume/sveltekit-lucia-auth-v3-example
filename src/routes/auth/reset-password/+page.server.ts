import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { message, superValidate } from 'sveltekit-superforms/server';

import {
	passwordResetActionRateLimiter,
	verifyPasswordResetToken
} from '$lib/database/authUtils.server';
import type { AlertMessageType } from '$lib/types';
import { PasswordResetZodSchema } from '$validations/AuthZodSchemas';

export const load = (async (event) => {
	await passwordResetActionRateLimiter.cookieLimiter?.preflight(event);

	const passwordResetToken = event.url.searchParams.get('token');

	if (!passwordResetToken) {
		error(400, 'Password reset token is missing from the request.');
	}

	return {
		verifyPasswordResetTokenResult: await verifyPasswordResetToken(passwordResetToken),
		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async (event) => {
		const passwordResetToken = event.url.searchParams.get('token');

		if (!passwordResetToken) return;

		const passwordResetFormData = await superValidate<
			typeof PasswordResetZodSchema,
			AlertMessageType
		>(event.request, PasswordResetZodSchema);

		if (passwordResetFormData.valid === false) {
			return message(passwordResetFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		const passwordResetActionRateLimiterResult = await passwordResetActionRateLimiter.check(event);

		if (passwordResetActionRateLimiterResult.limited) {
			return message(
				passwordResetFormData,
				{
					alertType: 'error',
					alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${passwordResetActionRateLimiterResult.retryAfter} seconds.`
				},
				{
					status: 429
				}
			);
		}

		const verifyPasswordResetTokenResult = await verifyPasswordResetToken(passwordResetToken);

		if (!verifyPasswordResetTokenResult.success) {
			return message(
				passwordResetFormData,
				{
					alertType: 'error',
					alertText: verifyPasswordResetTokenResult.message
				},
				{
					status: 400
				}
			);
		}

		console.log('Password reset form data:', passwordResetFormData);
	}
};
