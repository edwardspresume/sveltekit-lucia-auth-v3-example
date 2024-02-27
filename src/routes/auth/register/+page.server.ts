import { redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

import { message, superValidate } from 'sveltekit-superforms/server';

import { generateId } from 'lucia';
import { Argon2id } from 'oslo/password';

import { route } from '$lib/ROUTES';
import {
	PENDING_USER_VERIFICATION_COOKIE_NAME,
	checkIfUserExists,
	generateEmailVerificationCode,
	insertNewUser,
	sendEmailVerificationCode
} from '$lib/database/authUtils.server';
import type { AlertMessageType } from '$lib/types';
import { logError } from '$lib/utils';
import { RegisterUserZodSchema } from '$validations/AuthZodSchemas';

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
			const userEmail = registerUserFormData.data.email;
			const existingUser = await checkIfUserExists(userEmail);

			// If there is a user and they're using email auth, we don't want to create a new user
			if (existingUser && existingUser.authMethods.includes('email')) {
				return message(registerUserFormData, {
					alertType: 'error',
					alertText: 'This email is already in use. Please use a different email address.'
				});
			}

			let userId = existingUser?.id ?? generateId(15);

			// if theres no user with the email, create a new user
			if (!existingUser) {
				userId = generateId(15);
				const hashedPassword = await new Argon2id().hash(registerUserFormData.data.password);

				await insertNewUser({
					id: userId,
					name: registerUserFormData.data.name,
					email: userEmail,
					isEmailVerified: false,
					password: hashedPassword,
					authMethods: ['email']
				});
			}

			const emailVerificationCode = await generateEmailVerificationCode(userId, userEmail);

			const sendEmailVerificationCodeResult = await sendEmailVerificationCode(
				userEmail,
				emailVerificationCode
			);

			if (!sendEmailVerificationCodeResult.success) {
				return message(registerUserFormData, {
					alertType: 'error',
					alertText: sendEmailVerificationCodeResult.message
				});
			}

			const pendingVerificationUserData = JSON.stringify({ id: userId, email: userEmail });

			cookies.set(PENDING_USER_VERIFICATION_COOKIE_NAME, pendingVerificationUserData, {
				path: route('/auth/email-verification')
			});
		} catch (error) {
			logError(error);

			return message(registerUserFormData, {
				alertType: 'error',
				alertText: 'An error occurred while processing your request. Please try again.'
			});
		}

		throw redirect(303, route('/auth/email-verification'));
	}
};
