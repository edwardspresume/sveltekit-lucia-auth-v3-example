import type { Actions, PageServerLoad } from './$types';

import { redirect } from 'sveltekit-flash-message/server';

import { route } from '$lib/ROUTES';
import { lucia } from '$lib/database/auth.server';
import { deleteSessionCookie } from '$lib/database/authUtils.server';
import { deleteAllUsers, getAllUsers } from '$lib/database/databaseUtils.server';
import { LOGIN_ROUTE } from '$lib/utils/navLinks';

export const load = (async ({ locals: { user }, cookies }) => {
	if (!user) {
		throw redirect(
			route('/auth/login'),
			{
				type: 'error',
				message: 'You must be logged in to view the dashboard.'
			},
			cookies
		);
	}

	return {
		loggedInUserName: user.name,
		allUsers: await getAllUsers()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	logout: async ({ cookies, locals }) => {
		if (!locals.session?.id) return;

		await lucia.invalidateSession(locals.session.id);

		await deleteSessionCookie(lucia, cookies);

		throw redirect(303, LOGIN_ROUTE);
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
