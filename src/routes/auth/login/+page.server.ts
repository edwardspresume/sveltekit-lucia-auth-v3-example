import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { message, setError, superValidate } from 'sveltekit-superforms/server';

import { lucia } from '$lib/database/auth.server';
import { database } from '$lib/database/database.server';
import { usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { UserLoginZodSchema } from '$validations/UserLoginZodSchema';

export const load = (async () => {
	return {
		userLoginFormData: await superValidate(UserLoginZodSchema)
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

		const [existingUser] = await database
			.select({
				id: usersTable.id,
				password: usersTable.password
			})
			.from(usersTable)
			.where(eq(usersTable.email, userLoginFormData.data.email));

		if (existingUser === undefined) {
			return setError(userLoginFormData, 'email', 'Email not registered');
		}

		const validPassword = await new Argon2id().verify(
			existingUser.password,
			userLoginFormData.data.password
		);

		if (!validPassword) {
			return setError(userLoginFormData, 'password', 'Incorrect password');
		}

		const session = await lucia.createSession(existingUser.id, {});
		const sessionCookie = lucia.createSessionCookie(session.id);

		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		throw redirect(307, DASHBOARD_ROUTE);
	}
};
