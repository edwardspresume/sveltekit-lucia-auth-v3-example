import type { RequestHandler } from './$types';

import { OAuth2RequestError } from 'arctic';
import { eq } from 'drizzle-orm';
import { generateId } from 'lucia';

import { route } from '$lib/ROUTES';
import {
	GITHUB_OAUTH_STATE_COOKIE_NAME,
	createAndSetSession,
	insertNewUser
} from '$lib/database/authUtils.server';
import { database } from '$lib/database/database.server';
import { githubOauth, lucia } from '$lib/database/luciaAuth.server';
import { usersTable } from '$lib/database/schema';

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
		const tokens = await githubOauth.validateAuthorizationCode(code);

		const githubUserResponse = await fetch('https://api.github.com/user', {
			headers: {
				Authorization: `Bearer ${tokens.accessToken}`
			}
		});

		const githubUser: GitHubUser = await githubUserResponse.json();

		const [existingUser] = await database
			.select()
			.from(usersTable)
			.where(eq(usersTable.githubId, githubUser.id));

		if (existingUser) {
			await createAndSetSession(lucia, existingUser.id, event.cookies);
		} else {
			const githubEmailResponse = await fetch('https://api.github.com/user/emails', {
				headers: {
					Authorization: `Bearer ${tokens.accessToken}`
				}
			});

			const githubEmail: GitHubEmail[] = await githubEmailResponse.json();

			const primaryEmail = githubEmail.find((email) => email.primary && email.verified);

			const userId = generateId(15);

			await insertNewUser({
				id: userId,
				githubId: githubUser.id,
				username: githubUser.login,
				name: githubUser.name,
				avatarUrl: githubUser.avatar_url,
				email: primaryEmail?.email ?? null
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
