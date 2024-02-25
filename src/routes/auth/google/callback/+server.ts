import type { RequestHandler } from './$types';

import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { route } from '$lib/ROUTES';
import {
	GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME,
	GOOGLE_OAUTH_STATE_COOKIE_NAME,
	createAndSetSession
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { googleOauth, lucia } from '$lib/database/luciaAuth.server';
import { oauthAccountsTable, usersTable } from '$lib/database/schema';

type GoogleUser = {
	sub: string;
	name: string;
	given_name: string;
	family_name: string;
	picture: string;
	email: string;
	email_verified: boolean;
	locale: string;
};

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');

	const storedState = event.cookies.get(GOOGLE_OAUTH_STATE_COOKIE_NAME);
	const storedCodeVerifier = event.cookies.get(GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME);

	// Validate OAuth state and code verifier
	if (!code || !state || !storedState || !storedCodeVerifier || state !== storedState) {
		return new Response('Invalid OAuth state or code verifier', {
			status: 400
		});
	}

	try {
		const tokens = await googleOauth.validateAuthorizationCode(code, storedCodeVerifier);

		const googleUserResponse = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const googleUser = (await googleUserResponse.json()) as GoogleUser;

		if (!googleUser.email) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		if (!googleUser.email_verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		// Check if the user already exists
		const [existingUser] = await database
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, googleUser.email));

		if (existingUser) {
			// Check if the user already has a Google OAuth account linked
			const [existingOauthAccount] = await database
				.select()
				.from(oauthAccountsTable)
				.where(
					and(
						eq(oauthAccountsTable.userId, existingUser.id),
						eq(oauthAccountsTable.providerId, 'google')
					)
				);

			if (!existingOauthAccount) {
				// Add the 'google' auth provider to the user's authMethods list
				const authMethods = existingUser.authMethods || [];
				authMethods.push('google');

				await database.transaction(async (trx) => {
					// Link the Google OAuth account to the existing user
					await trx.insert(oauthAccountsTable).values({
						userId: existingUser.id,
						providerId: 'google',
						providerUserId: googleUser.sub
					});

					// Update the user's authMethods list
					await trx
						.update(usersTable)
						.set({
							authMethods
						})
						.where(eq(usersTable.id, existingUser.id));
				});
			}

			await createAndSetSession(lucia, existingUser.id, event.cookies);
		} else {
			// Create a new user and their OAuth account
			const userId = generateId(15);

			await database.transaction(async (trx) => {
				await trx.insert(usersTable).values({
					id: userId,
					name: googleUser.name,
					avatarUrl: googleUser.picture,
					email: googleUser.email,
					isEmailVerified: true,
					authMethods: ['google']
				});

				await trx.insert(oauthAccountsTable).values({
					userId,
					providerId: 'google',
					providerUserId: googleUser.sub
				});
			});

			await createAndSetSession(lucia, userId, event.cookies);
		}

		return new Response(null, {
			status: 302,
			headers: {
				Location: route('/dashboard')
			}
		});
	} catch (error) {
		console.error(error);

		// the specific error message depends on the provider
		if (error instanceof OAuth2RequestError) {
			// invalid code
			return new Response(null, {
				status: 400
			});
		}

		return new Response(null, {
			status: 500
		});
	}
};
