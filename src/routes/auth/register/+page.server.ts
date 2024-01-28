import type { Actions, PageServerLoad } from './$types';

import { message, setError, superValidate } from 'sveltekit-superforms/server';

import {
	checkIfEmailExists,
	deleteAllUsers,
	getAllUsers,
	insertNewUser
} from '$lib/database/databaseUtils.server';
import type { AlertMessageType } from '$lib/types';
import { logError } from '$lib/utils';
import { RegisterUserZodSchema } from '$validations/RegisterUserZodSchema';
import { SESSION_COOKIE_NAME } from '$lib/constants';

export const load = (async () => {
	return {
		registerUserFormData: await superValidate(RegisterUserZodSchema),

		allUsers: await getAllUsers()
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	deleteAllUsers: async ({ cookies }) => {
		await deleteAllUsers();

		cookies.delete(SESSION_COOKIE_NAME, {
			path: '/'
		});
	},

	registerUser: async ({ request }) => {
		const registerUserFormData = await superValidate<
			typeof RegisterUserZodSchema,
			AlertMessageType
		>(request, RegisterUserZodSchema);

		if (registerUserFormData.valid === false) {
			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'There was a problem with your submission.'
			});
		}

		try {
			const isEmailAlreadyRegistered = await checkIfEmailExists(registerUserFormData.data.email);

			if (isEmailAlreadyRegistered === true) {
				return setError(registerUserFormData, 'email', 'Email already registered');
			}

			await insertNewUser({
				name: registerUserFormData.data.name,
				email: registerUserFormData.data.email,
				password: registerUserFormData.data.password
			});

			return message(registerUserFormData, {
				alertType: 'success',
				alertText: 'User registered successfully.'
			});
		} catch (error) {
			logError(error);

			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'There was an error with your submission'
			});
		}
	}
};
