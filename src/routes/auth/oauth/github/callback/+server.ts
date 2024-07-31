import type { RequestHandler } from './$types';

import { OAuth2RequestError } from 'arctic';
import { and, eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { route } from '$lib/ROUTES';
import {
	GITHUB_OAUTH_STATE_COOKIE_NAME,
	createAndSetSession
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { githubOauth, lucia } from '$lib/database/luciaAuth.server';
import { oauthAccountsTable, usersTable } from '$lib/database/schema';

type GitHubUser = {
	id: number;
	login: string;
	avatar_url: string;
	name: string;
};

type GitHubEmail = {
	email: string;
	primary: boolean;
	verified: boolean;
	visibility: string | null;
};

export const GET: RequestHandler = async (event) => {
	const code = event.url.searchParams.get('code');
	const state = event.url.searchParams.get('state');
	const storedState = event.cookies.get(GITHUB_OAUTH_STATE_COOKIE_NAME);

	if (!code || !state || !storedState || state !== storedState) {
		return new Response(null, {
			status: 400
		});
	}

	try {
		// Validate the authorization code and retrieve the tokens
		const tokens = await githubOauth.validateAuthorizationCode(code);

		// Fetch the GitHub user associated with the access token
		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		// Fetch the primary email address of the GitHub user
		const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser = (await githubUserResponse.json()) as GitHubUser;
		const githubEmail = (await githubEmailResponse.json()) as GitHubEmail[];

		const primaryEmail = githubEmail.find((email) => email.primary) ?? null;

		if (!primaryEmail) {
			return new Response('No primary email address', {
				status: 400
			});
		}

		if (!primaryEmail.verified) {
			return new Response('Unverified email', {
				status: 400
			});
		}

		// Check if the user already exists
		const [existingUser] = await database
			.select()
			.from(usersTable)
			.where(eq(usersTable.email, primaryEmail.email));

		if (existingUser) {
			// Check if the user already has a GitHub OAuth account linked
			const [existingOauthAccount] = await database
				.select()
				.from(oauthAccountsTable)
				.where(
					and(
						eq(oauthAccountsTable.providerId, 'github'),
						eq(oauthAccountsTable.providerUserId, githubUser.id.toString())
					)
				);

			if (!existingOauthAccount) {
				// Add the 'github' auth provider to the user's authMethods list
				const authMethods = existingUser.authMethods || [];
				authMethods.push('github');

				await database.transaction(async (trx) => {
					// Link the GitHub OAuth account to the existing user
					await trx.insert(oauthAccountsTable).values({
						userId: existingUser.id,
						providerId: 'github',
						providerUserId: githubUser.id.toString()
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
			// Create a new user and link the GitHub OAuth account
			const userId = generateId(15);

			await database.transaction(async (trx) => {
				await trx.insert(usersTable).values({
					id: userId,
					name: githubUser.name,
					avatarUrl: githubUser.avatar_url,
					email: primaryEmail.email,
					isEmailVerified: true,
					authMethods: ['github']
				});

				await trx.insert(oauthAccountsTable).values({
					userId,
					providerId: 'github',
					providerUserId: githubUser.id.toString()
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
