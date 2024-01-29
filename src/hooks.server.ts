import { redirect, type Handle } from '@sveltejs/kit';

import { lucia } from '$lib/database/auth.server';
import { DASHBOARD_ROUTE } from '$lib/utils/navLinks';

export const handle: Handle = async ({ event, resolve }) => {
	// Get the session ID from the cookies
	const sessionId = event.cookies.get(lucia.sessionCookieName);

	// If there's no session ID, set user and session to null and resolve the request
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	// If there's a session ID, validate it
	const { session, user } = await lucia.validateSession(sessionId);

	// If the session is fresh (just created due to session expiration extending), create a new session cookie
	if (session?.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);

		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	// If the session is not valid, create a blank session cookie to delete a session cookie from the browser
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}

	// Redirect to the dashboard only if the session is valid and the request isn't for the dashboard or the home page
	if (event.url.pathname !== DASHBOARD_ROUTE && event.url.pathname !== '/') {
		throw redirect(303, DASHBOARD_ROUTE);
	}

	// Store the user and session in event.locals, so they can be accessed in endpoints and pages
	event.locals.user = user;
	event.locals.session = session;

	return resolve(event);
};
