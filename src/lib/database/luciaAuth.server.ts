import { dev } from '$app/environment';
import {
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET
} from '$env/static/private';

import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub, Google } from 'arctic';
import { Lucia } from 'lucia';

import { database } from './database.server';
import { usersSessionsTable, usersTable } from './schema';

const dbAdapter = new DrizzleSQLiteAdapter(database, usersSessionsTable, usersTable);

const googleRedirectUrl = `http://localhost:5173/auth/google/callback`;

export const githubOauth = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);
export const googleOauth = new Google(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, googleRedirectUrl);

export const lucia = new Lucia(dbAdapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},

	getUserAttributes: (attributes) => {
		return {
			name: attributes.name,
			email: attributes.email,
			isEmailVerified: attributes.isEmailVerified,
			authProviders: attributes.authProviders,
			avatarUrl: attributes.avatarUrl
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			name: string;
			email: string;
			isEmailVerified: boolean;
			authProviders: string[];
			avatarUrl: string;
		};
	}
}
