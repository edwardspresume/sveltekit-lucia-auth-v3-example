import type { Actions, PageServerLoad } from './$types';

import { redirect } from 'sveltekit-flash-message/server';

import { route } from '$lib/ROUTES';
import { lucia } from '$lib/database/auth.server';
import { deleteAllUsers, getAllUsers } from '$lib/database/databaseUtils.server';

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

		const sessionCookie = lucia.createBlankSessionCookie();

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(303, route('/auth/login'));
	},

	deleteAllUsers: async ({ locals, cookies }) => {
		if (!locals.session?.id) return;

		await lucia.invalidateSession(locals.session.id);

		await lucia.invalidateUserSessions(locals.session.userId);

		const sessionCookie = lucia.createBlankSessionCookie();

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		await deleteAllUsers();

		throw redirect(303, route('/auth/login'));
	}
};
