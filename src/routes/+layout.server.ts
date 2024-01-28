import type { LayoutServerLoad } from './$types';

import { loadFlash } from 'sveltekit-flash-message/server';

import { SESSION_COOKIE_NAME } from '$lib/constants';
import { createBaseMetaTags } from '$lib/utils/metaTags';

export const load = loadFlash(async ({ url, cookies }) => {
	const baseMetaTags = createBaseMetaTags(url);

	const session = cookies.get(SESSION_COOKIE_NAME);

	return {
		session,
		baseMetaTags: Object.freeze(baseMetaTags)
	};
}) satisfies LayoutServerLoad;
