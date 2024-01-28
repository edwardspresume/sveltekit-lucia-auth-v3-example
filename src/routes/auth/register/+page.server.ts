import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { message, setError, superValidate } from 'sveltekit-superforms/server';

import { lucia } from '$lib/database/auth.server';
import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';

import { checkIfEmailExists, insertNewUser } from '$lib/database/databaseUtils.server';
import type { AlertMessageType } from '$lib/types';
import { logError } from '$lib/utils';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { RegisterUserZodSchema } from '$validations/RegisterUserZodSchema';

export const load = (async () => {
	return {
		registerUserFormData: await superValidate(RegisterUserZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	registerUser: async ({ request, cookies }) => {
		const registerUserFormData = await superValidate<
			typeof RegisterUserZodSchema,
			AlertMessageType
		>(request, RegisterUserZodSchema);

		if (registerUserFormData.valid === false) {
			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'Please check your entries, the form contains invalid data'
			});
		}

		try {
			const isEmailAlreadyRegistered = await checkIfEmailExists(registerUserFormData.data.email);

			if (isEmailAlreadyRegistered === true) {
				return setError(registerUserFormData, 'email', 'Email already registered');
			}

			const userId = generateId(15);
			const hashedPassword = await new Argon2id().hash(registerUserFormData.data.password);

			await insertNewUser({
				id: userId,
				name: registerUserFormData.data.name,
				email: registerUserFormData.data.email,
				password: hashedPassword
			});

			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);

			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (error) {
			logError(error);

			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}

		throw redirect(303, DASHBOARD_ROUTE);
	}
};
