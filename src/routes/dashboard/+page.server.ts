import type { Actions, PageServerLoad } from './$types';

import { redirect } from 'sveltekit-flash-message/server';

import { SESSION_COOKIE_NAME } from '$lib/constants';
import { getUserName } from '$lib/database/databaseUtils.server';
import { route } from '$lib/ROUTES';

export const load = (async ({ cookies }) => {
	const userId = cookies.get(SESSION_COOKIE_NAME);

	if (!userId) {
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
		loggedOnUserName: await getUserName(userId)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	default: async ({ cookies }) => {
		cookies.delete(SESSION_COOKIE_NAME, {
			path: route('/')
		});

		throw redirect(303, route('/auth/login'));
	}
};
