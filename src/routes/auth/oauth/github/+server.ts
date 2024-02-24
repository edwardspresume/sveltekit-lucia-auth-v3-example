import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { generateState } from 'arctic';

import { GITHUB_OAUTH_STATE_COOKIE_NAME } from '$lib/database/authUtils.server';
import { githubOauth } from '$lib/database/luciaAuth.server';

export const GET: RequestHandler = async ({ cookies }) => {
	const state = generateState();
	const url = await githubOauth.createAuthorizationURL(state);

	cookies.set(GITHUB_OAUTH_STATE_COOKIE_NAME, state, {
		path: '/',
		secure: import.meta.env.PROD,
		httpOnly: true,
		maxAge: 60 * 10, // 10 minutes
		sameSite: 'lax'
	});

	redirect(302, url);
};
