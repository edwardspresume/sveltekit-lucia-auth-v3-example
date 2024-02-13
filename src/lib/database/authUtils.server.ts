import { RESEND_API_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { TimeSpan, type Lucia } from 'lucia';
import { createDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
import { Resend } from 'resend';

import { EMAIL_VERIFICATION_CODE_LENGTH } from '$validations/AuthZodSchemas';
import { database } from './database.server';
import { emailVerificationCodesTable } from './schema';

const resend = new Resend(RESEND_API_KEY);

export const createAndSetSession = async (lucia: Lucia, userId: string, cookies: Cookies) => {
	const session = await lucia.createSession(userId, {});
	const sessionCookie = lucia.createSessionCookie(session.id);

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

export const deleteSessionCookie = async (lucia: Lucia, cookies: Cookies) => {
	const sessionCookie = lucia.createBlankSessionCookie();

	cookies.set(sessionCookie.name, sessionCookie.value, {
		path: '.',
		...sessionCookie.attributes
	});
};

export const generateEmailVerificationCode = async (userId: string, email: string) => {
	await database
		.delete(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	const code = generateRandomString(EMAIL_VERIFICATION_CODE_LENGTH, alphabet('0-9'));

	await database.insert(emailVerificationCodesTable).values({
		userId: userId,
		email,
		code,
		expiresAt: createDate(new TimeSpan(0.2, 'm')) // 5 minutes
	});

	return code;
};
