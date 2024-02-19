import { RESEND_API_KEY } from '$env/static/private';
import type { Cookies } from '@sveltejs/kit';

import { eq } from 'drizzle-orm';
import { TimeSpan, generateId, type Lucia } from 'lucia';
import { createDate, isWithinExpirationDate } from 'oslo';
import { alphabet, generateRandomString } from 'oslo/crypto';
import { Resend } from 'resend';
import { RetryAfterRateLimiter } from 'sveltekit-rate-limiter/server';

import { route } from '$lib/ROUTES';
import { EMAIL_VERIFICATION_CODE_LENGTH } from '$validations/AuthZodSchemas';
import { database } from './database.server';
import { emailVerificationCodesTable, passwordResetTokensTable } from './schema';

const resend = new Resend(RESEND_API_KEY);

export const PENDING_USER_VERIFICATION_COOKIE_NAME = 'pendingUserVerification';
export type PendingVerificationUserDataType = {
	id: string;
	email: string;
};

function createRateLimiter(cookieName: string, cookieSecret: string) {
	return new RetryAfterRateLimiter({
		// A rate is defined as [number, unit]
		IP: [10, 'h'], // IP address limiter, allowing up to  10 requests per hour
		IPUA: [5, 'm'], // IP + User Agent limiter, allowing up to  5 requests per minute

		cookie: {
			/* Cookie limiter. This limits the number of requests from the same browser (identified by a unique cookie) to  2 per minute.

			It helps prevent a single browser session from making too many requests in a short time, providing an extra layer of protection against abuse.
		*/
			name: cookieName, // Unique cookie name for this limiter
			secret: cookieSecret,
			rate: [2, 'm'], // Allows up to  2 requests per minute from the same browser session
			preflight: true // Require preflight call (see load function)
		}
	});
}

export const verifyCodeRateLimiter = createRateLimiter(
	'verifyCodeRateLimiterCookieId',
	'verifyCodeRateLimiterCookieSecret'
);

export const sendCodeRateLimiter = createRateLimiter(
	'sendCodeRateLimiterCookieId',
	'sendCodeRateLimiterCookieSecret'
);

export const passwordResetRateLimiter = createRateLimiter(
	'passwordResetRateLimiterCookieId',
	'passwordResetRateLimiterCookieSecret'
);

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
	const code = generateRandomString(EMAIL_VERIFICATION_CODE_LENGTH, alphabet('0-9'));

	// This transaction block ensures atomicity and data integrity. If an error occurs while inserting the new code, the transaction will be rolled back, preventing the deletion of old verification codes. This maintains the state of the database.
	await database.transaction(async (trx) => {
		// Delete any existing verification codes for the user
		await trx
			.delete(emailVerificationCodesTable)
			.where(eq(emailVerificationCodesTable.userId, userId));

		// Insert the new verification code
		await trx.insert(emailVerificationCodesTable).values({
			userId,
			email,
			code,
			expiresAt: createDate(new TimeSpan(5, 'm')) // 5 minutes
		});
	});

	return code;
};

export const sendEmailVerificationCode = async (email: string, code: string) => {
	const { error } = await resend.emails.send({
		from: 'Lucia V3 example <onboarding@resend.dev>',
		to: [email],
		subject: 'Email Verification Code',
		html: `<p>Your email verification code is: <strong>${code}</strong></p>`
	});

	if (error) {
		console.error({ error });
		return { success: false, message: 'Failed to send email verification code.' };
	}

	return { success: true, message: 'Email verification code sent successfully.' };
};

export const verifyEmailVerificationCode = async (userId: string, code: string) => {
	const [verificationCode] = await database
		.select()
		.from(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// If there's no verification code for the user in the database
	if (!verificationCode) {
		return { success: false, message: 'Verification code not found.' };
	}

	// If the provided code doesn't match the one in the database
	if (verificationCode.code !== code) {
		return { success: false, message: 'The provided verification code is incorrect.' };
	}

	// If the verification code has expired
	if (!isWithinExpirationDate(verificationCode.expiresAt)) {
		return {
			success: false,
			message: 'The verification code has expired, please request a new one.'
		};
	}

	// If everything is okay, delete the verification code from the database
	await database
		.delete(emailVerificationCodesTable)
		.where(eq(emailVerificationCodesTable.userId, userId));

	// Return a success message
	return { success: true, message: 'Email verification successful!' };
};

export const createPasswordResetToken = async (userId: string) => {
	const tokenId = generateId(40);

	await database.transaction(async (trx) => {
		await trx.delete(passwordResetTokensTable).where(eq(passwordResetTokensTable.userId, userId));

		await trx.insert(passwordResetTokensTable).values({
			id: tokenId,
			userId,
			expiresAt: createDate(new TimeSpan(15, 'm')) // 15 minutes
		});
	});

	return tokenId;
};

export const sendPasswordResetEmail = async (email: string, resetToken: string) => {
	const { error } = await resend.emails.send({
		from: 'Lucia V3 example <onboarding@resend.dev>',
		to: [email],
		subject: 'Password Reset',
		html: `<p>Click <a href="http://localhost:5173${route('/auth/reset-password')}/${resetToken}">here</a> to reset your password.</p>`
	});

	if (error) {
		console.error({ error });
		return { success: false, message: 'Failed to send password reset email.' };
	}

	return {
		success: true,
		message: `An email has been sent to ${email} with instructions on how to reset your password.`
	};
};
