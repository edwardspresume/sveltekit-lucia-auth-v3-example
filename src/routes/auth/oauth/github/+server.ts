import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

import { generateState } from 'arctic';

import { GITHUB_OAUTH_STATE_COOKIE_NAME } from '$lib/database/authUtils.server';
import { githubOauth } from '$lib/database/luciaAuth.server';

export const GET: RequestHandler = async ({ cookies }) => {
	// Generate a unique state value for the OAuth  process
	const state = generateState();

	// Create the GitHub OAuth authorization URL using the state value
	const url = await githubOauth.createAuthorizationURL(state);

	// Set a cookie with the state value, to be used for CSRF protection
	cookies.set(GITHUB_OAUTH_STATE_COOKIE_NAME, state, {
		path: '/', // The cookie will be accessible on all paths
		secure: import.meta.env.PROD, // The cookie will be sent over HTTPS if in production
		httpOnly: true, // The cookie cannot be accessed through client-side script
		maxAge: 60 * 10, // The cookie will expire after 10 minutes
		sameSite: 'lax' // The cookie will only be sent with same-site requests or top-level navigations
	});

	// Redirect the user to the GitHub OAuth authorization URL
	redirect(302, url);
};
