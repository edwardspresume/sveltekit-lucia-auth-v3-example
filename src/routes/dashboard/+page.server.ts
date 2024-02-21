import type { Actions, PageServerLoad } from './$types';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { redirect } from 'sveltekit-flash-message/server';
import { message, superValidate } from 'sveltekit-superforms/client';

import { route } from '$lib/ROUTES';
import {
	deleteAllUsers,
	deleteSessionCookie,
	getAllUsers,
	isSameAsOldPassword,
	passwordResetDashboardPageActionRateLimiter
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { lucia } from '$lib/database/luciaAuth.server';
import { usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { LOGIN_ROUTE } from '$lib/utils/navLinks';
import { PasswordResetZodSchema } from '$validations/AuthZodSchemas';

export const load = (async (event) => {
	const { cookies, locals } = event;

	if (!locals.user) {
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'You must be logged in to view the dashboard.'
			},
			cookies
		);
	}

	await passwordResetDashboardPageActionRateLimiter.cookieLimiter?.preflight(event);

	return {
		loggedInUserName: locals.user.name,
		allUsers: await getAllUsers(),
		passwordResetFormData: await superValidate(PasswordResetZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ cookies, locals }) => {
		if (!locals.session?.id) return;

		await lucia.invalidateSession(locals.session.id);

		await deleteSessionCookie(lucia, cookies);

		throw redirect(303, LOGIN_ROUTE);
	},

	resetPassword: async (event) => {
		const userId = event.locals.user?.id;
		const currentSessionId = event.locals.session?.id;

		if (!userId) return;

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

		try {
			// Check if the rate limit for password reset action has been exceeded
			const passwordResetActionRateLimiterResult =
				await passwordResetDashboardPageActionRateLimiter.check(event);

			// If the rate limit has been exceeded, return an error message
			if (passwordResetActionRateLimiterResult.limited) {
				return message(
					passwordResetFormData,
					{
						alertType: 'error',
						alertText: `You have made too many requests and exceeded the rate limit. Please try again after ${passwordResetActionRateLimiterResult.retryAfter} seconds.`
					},
					{
						status: 429 // Too Many Requests
					}
				);
			}

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
						status: 400 // This status code indicates that the server could not understand the request due to invalid syntax (new password is the same as the old password).
					}
				);
			}

			const allUserSessions = await lucia.getUserSessions(userId);

			// Invalidate all user sessions except the current session for security reasons
			for (const session of allUserSessions) {
				if (session.id === currentSessionId) continue;

				await lucia.invalidateSession(session.id);
			}

			// Hash the new password
			const hashedPassword = await new Argon2id().hash(passwordResetFormData.data.newPassword);

			await database
				.update(usersTable)
				.set({ password: hashedPassword })
				.where(eq(usersTable.id, userId));
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

		return message(passwordResetFormData, {
			alertType: 'success',
			alertText: 'Your password has been reset successfully.'
		});
	},

	deleteAllUsers: async ({ cookies }) => {
		const allUsers = await getAllUsers();

		for (const user of allUsers) {
			await lucia.invalidateUserSessions(user.id);
		}

		await deleteSessionCookie(lucia, cookies);

		await deleteAllUsers();

		throw redirect(303, route('/auth/register'));
	}
};
