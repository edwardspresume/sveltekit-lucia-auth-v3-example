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
	const storedState = event.cookies.get(GITHUB_OAUTH_STATE_COOKIE_NAME) ?? null;

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

		const githubUser = (await githubUserResponse.json()) as GitHubUser;

		const [existingUser] = await database
			.select()
			.from(oauthAccountsTable)
			.where(
				and(
					eq(oauthAccountsTable.providerId, 'github'),
					eq(oauthAccountsTable.providerUserId, githubUser.id.toString())
				)
			);

		// If the user exists, create and set a new session
		if (existingUser) {
			await createAndSetSession(lucia, existingUser.userId, event.cookies);
		} else {
			// If the user doesn't exist, fetch the user's emails from GitHub
			const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`
				}
			});

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

			const userId = generateId(15);

			// Start a new transaction to insert the new user and their OAuth account into the database
			await database.transaction(async (trx) => {
				await trx.insert(usersTable).values({
					id: userId,
					username: githubUser.login,
					name: githubUser.name,
					avatarUrl: githubUser.avatar_url,
					email: primaryEmail.email,
					isEmailVerified: true
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