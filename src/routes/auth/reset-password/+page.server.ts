import { error } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms/server';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

import {
	createAndSetSession,
	isSameAsOldPassword,
	passwordResetActionRateLimiter,
	verifyPasswordResetToken
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { lucia } from '$lib/database/luciaAuth.server';
import { passwordResetTokensTable, usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { PasswordResetZodSchema } from '$validations/AuthZodSchemas';

export const load = (async (event) => {
	await passwordResetActionRateLimiter.cookieLimiter?.preflight(event);

	const passwordResetToken = event.url.searchParams.get('token');

	if (!passwordResetToken) {
		error(400, 'Password reset token is missing from the request.');
	}

	const { success, message } = await verifyPasswordResetToken(passwordResetToken);

	return {
		passwordResetTokenStatus: {
			isValid: success,
			message
		},

		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async (event) => {
		const formData = await event.request.formData();
		const passwordResetToken = formData.get('passwordResetToken');

		const passwordResetFormData = await superValidate<
			typeof PasswordResetZodSchema,
			AlertMessageType
		>(formData, PasswordResetZodSchema);

		if (passwordResetFormData.valid === false) {
			return message(passwordResetFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		try {
			// Check if the rate limit for password reset action has been exceeded
			const passwordResetActionRateLimiterResult =
				await passwordResetActionRateLimiter.check(event);

			// If the rate limit has been exceeded, return an error message
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

			if (typeof passwordResetToken !== 'string') {
				throw new Error('Password reset token is not a string.');
			}

			const verifyPasswordResetTokenResult = await verifyPasswordResetToken(passwordResetToken);

			if (verifyPasswordResetTokenResult.success === false) {
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

			const userId = verifyPasswordResetTokenResult.userId;

			if (userId) {
				const isSamePassword = await isSameAsOldPassword(
					userId,
					passwordResetFormData.data.newPassword
				);

				if (isSamePassword) {
					return message(
						passwordResetFormData,
						{
							alertType: 'error',
							alertText: 'Your new password cannot be the same as your old password.'
						},
						{
							status: 400
						}
					);
				}
				// Hash the new password
				const hashedPassword = await new Argon2id().hash(passwordResetFormData.data.newPassword);

				// Invalidate all user sessions before updating the password for security reasons
				await lucia.invalidateUserSessions(userId);

				await database.transaction(async (trx) => {
					// Delete the password reset token from the database
					await trx
						.delete(passwordResetTokensTable)
						.where(eq(passwordResetTokensTable.id, passwordResetToken));

					// Update the user's password in the database
					await trx
						.update(usersTable)
						.set({ password: hashedPassword })
						.where(eq(usersTable.id, userId));
				});

				await createAndSetSession(lucia, userId, event.cookies);
			}
		} catch (error) {
			console.error('Error in resetPassword action:', error);
			return message(
				passwordResetFormData,
				{
					alertType: 'error',
					alertText: 'There was a problem with your submission.'
				},
				{
					status: 500
				}
			);
		}

		throw redirect(
			DASHBOARD_ROUTE,
			{
				type: 'success',
				message: 'Your password has been reset. You are now logged in.'
			},
			event.cookies
		);
	}
};
