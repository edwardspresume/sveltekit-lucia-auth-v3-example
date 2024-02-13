import { redirect, type Actions, type Cookies } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

import { message, superValidate } from 'sveltekit-superforms/client';

import { route } from '$lib/ROUTES';
import {
	PENDING_USER_VERIFICATION_COOKIE_NAME,
	createAndSetSession,
	generateEmailVerificationCode,
	sendEmailVerificationCode,
	verifyEmailVerificationCode,
	type PendingVerificationUserDataType
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { lucia } from '$lib/database/luciaAuth.server';
import { usersTable } from '$lib/database/schema';
import type { AlertMessageType } from '$lib/types';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';
import { EmailVerificationCodeZodSchema } from '$validations/AuthZodSchemas';
import { eq } from 'drizzle-orm';

// Function to parse user data from cookie
const getUserDataFromCookie = (cookies: Cookies) => {
	const cookieData = cookies.get(PENDING_USER_VERIFICATION_COOKIE_NAME);

	if (!cookieData) return null;

	return JSON.parse(cookieData) as PendingVerificationUserDataType;
};

export const load = (async ({ cookies }) => {
	// Parse the user data from the cookie
	const userData = getUserDataFromCookie(cookies);

	if (!userData) return redirect(303, route('/auth/register'));

	return {
		pendingUserEmail: userData.email,
		emailVerificationCodeFormData: await superValidate(EmailVerificationCodeZodSchema)
	};
}) satisfies PageServerLoad;

export const actions: Actions = {
	verifyCode: async ({ request, cookies }) => {
		const userData = getUserDataFromCookie(cookies);

		if (!userData) return redirect(303, route('/auth/register'));

		const emailVerificationCodeFormData = await superValidate<
			typeof EmailVerificationCodeZodSchema,
			AlertMessageType
		>(request, EmailVerificationCodeZodSchema);

		if (emailVerificationCodeFormData.valid === false) {
			return message(emailVerificationCodeFormData, {
				alertType: 'error',
				alertText: 'Invalid verification code, please try again'
			});
		}

		const isVerificationCodeValid = await verifyEmailVerificationCode(
			userData.id,
			emailVerificationCodeFormData.data.verificationCode
		);

		if (isVerificationCodeValid.success === false) {
			return message(emailVerificationCodeFormData, {
				alertType: 'error',
				alertText: isVerificationCodeValid.message
			});
		}

		cookies.set(PENDING_USER_VERIFICATION_COOKIE_NAME, '', {
			maxAge: 0,
			path: route('/auth/email-verification')
		});

		await database
			.update(usersTable)
			.set({ isEmailVerified: true })
			.where(eq(usersTable.email, userData.email));

		await createAndSetSession(lucia, userData.id, cookies);

		throw redirect(303, DASHBOARD_ROUTE);
	},

	sendNewCode: async ({ cookies }) => {
		const userData = getUserDataFromCookie(cookies);

		if (!userData) return redirect(303, route('/auth/register'));

		const emailVerificationCode = await generateEmailVerificationCode(userData.id, userData.email);

		await sendEmailVerificationCode(userData.email, emailVerificationCode);

		return {
			message: 'A new verification code has been sent to your email'
		};
	}
};
