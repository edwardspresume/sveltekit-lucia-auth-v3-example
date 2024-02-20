import { error, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { message, superValidate } from 'sveltekit-superforms/server';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';

import {
	createAndSetSession,
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

	return {
		verifyPasswordResetTokenResult: await verifyPasswordResetToken(passwordResetToken),
		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	resetPassword: async (event) => {
		const formData = await event.request.formData();
		const passwordResetToken = formData.get('passwordResetToken') as string;

		if (!passwordResetToken) {
			error(400, 'Password reset token is missing from the request.');
		}

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
			const passwordResetActionRateLimiterResult =
				await passwordResetActionRateLimiter.check(event);

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

			const userId = verifyPasswordResetTokenResult.userId;

			if (userId) {
				const hashedPassword = await new Argon2id().hash(passwordResetFormData.data.newPassword);

				await database.transaction(async (trx) => {
					await trx
						.delete(passwordResetTokensTable)
						.where(eq(passwordResetTokensTable.id, passwordResetToken));

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

		throw redirect(303, DASHBOARD_ROUTE);
	}
};
