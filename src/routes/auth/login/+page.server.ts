import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { redirect as flashMessageRedirect } from 'sveltekit-flash-message/server';

import { Argon2id } from 'oslo/password';
import { message, setError, superValidate } from 'sveltekit-superforms/server';

import { route } from '$lib/ROUTES';
import {
	createAndSetSession,
	createPasswordResetToken,
	passwordResetEmailRateLimiter,
	sendPasswordResetEmail
} from '$lib/database/authUtils.server';
import { checkIfUserExists } from '$lib/database/databaseUtils.server';
import { lucia } from '$lib/database/luciaAuth.server';
import type { AlertMessageType } from '$lib/types';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { UserLoginZodSchema, passwordResetEmailZodSchema } from '$validations/AuthZodSchemas';

export const load = (async (event) => {
	await passwordResetEmailRateLimiter.cookieLimiter?.preflight(event);

	return {
		userLoginFormData: await superValidate(UserLoginZodSchema),
		passwordResetEmailFormData: await superValidate(passwordResetEmailZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logInUser: async ({ request, cookies }) => {
		const userLoginFormData = await superValidate<typeof UserLoginZodSchema, AlertMessageType>(
			request,
			UserLoginZodSchema
		);

		if (userLoginFormData.valid === false) {
			return message(userLoginFormData, {
				alertType: 'error',

				alertText: 'There was a problem with your submission.'
			});
		}

		const existingUser = await checkIfUserExists(userLoginFormData.data.email);

		if (!existingUser) {
			return setError(
				userLoginFormData,
				'email',
				"No account registered with this email. Please ensure you've entered the correct email."
			);
		}

		const isPasswordValid = await new Argon2id().verify(
			existingUser.password,
			userLoginFormData.data.password
		);

		if (!isPasswordValid) {
			return setError(userLoginFormData, 'password', 'Incorrect password');
		}

		if (!existingUser.isEmailVerified) {
			throw flashMessageRedirect(
				route('/auth/email-verification'),
				{
					type: 'error',
					message: 'You must verify your email before logging in.'
				},
				cookies
			);
		}

		await createAndSetSession(lucia, existingUser.id, cookies);

		throw redirect(303, DASHBOARD_ROUTE);
	},

	sendPasswordResetEmail: async (event) => {
		const passwordResetEmailFormData = await superValidate<
			typeof passwordResetEmailZodSchema,
			AlertMessageType
		>(event.request, passwordResetEmailZodSchema);

		if (passwordResetEmailFormData.valid === false) {
			return message(passwordResetEmailFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		const passwordResetRateLimiterResult = await passwordResetEmailRateLimiter.check(event);

		if (passwordResetRateLimiterResult.limited) {
			return message(
				passwordResetEmailFormData,
				{
					alertType: 'error',
					alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${passwordResetRateLimiterResult.retryAfter} seconds.`
				},
				{
					status: 429
				}
			);
		}

		try {
			const existingUser = await checkIfUserExists(passwordResetEmailFormData.data.email);

			if (!existingUser) {
				return setError(
					passwordResetEmailFormData,
					'email',
					'The email you entered is not associated with any registered account.'
				);
			}

			if (!existingUser.isEmailVerified) {
				return message(passwordResetEmailFormData, {
					alertType: 'error',
					alertText: 'You must verify your email before resetting your password.'
				});
			}

			const resetToken = await createPasswordResetToken(existingUser.id);

			const sendPasswordResetEmailResult = await sendPasswordResetEmail(
				existingUser.email,
				resetToken
			);

			if (!sendPasswordResetEmailResult.success) {
				return message(passwordResetEmailFormData, {
					alertType: 'error',
					alertText: sendPasswordResetEmailResult.message
				});
			}

			return message(passwordResetEmailFormData, {
				alertType: 'success',
				alertText: sendPasswordResetEmailResult.message
			});
		} catch (error) {
			return message(passwordResetEmailFormData, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}
	}
};
