import { dev } from '$app/environment';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '$env/static/private';

import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { GitHub } from 'arctic';
import { Lucia } from 'lucia';

import { database } from './database.server';
import { usersSessionsTable, usersTable } from './schema';

const dbAdapter = new DrizzleSQLiteAdapter(database, usersSessionsTable, usersTable);

export const github = new GitHub(GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET);

export const lucia = new Lucia(dbAdapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},

	getUserAttributes: (attributes) => {
		return {
			name: attributes.name,
			githubId: attributes.github_id,
			username: attributes.username,
			email: attributes.email,
			isEmailVerified: attributes.isEmailVerified
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			name: string;
			github_id: number;
			username: string;
			email: string;
			isEmailVerified: boolean;
		};
	}
}
