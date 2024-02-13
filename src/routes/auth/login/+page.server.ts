import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { eq } from 'drizzle-orm';
import { Argon2id } from 'oslo/password';
import { message, setError, superValidate } from 'sveltekit-superforms/server';

import { createAndSetSession } from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { lucia } from '$lib/database/luciaAuth.server';
import { usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { UserLoginZodSchema } from '$validations/AuthZodSchemas';

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

		await createAndSetSession(lucia, existingUser.id, cookies);

		throw redirect(303, DASHBOARD_ROUTE);
	}
};
