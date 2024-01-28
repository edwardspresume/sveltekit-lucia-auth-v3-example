import type { PageServerLoad } from './$types';

import { createPageMetaTags } from '$lib/utils/metaTags';

export const load: PageServerLoad = async () => {
	const pageMetaTags = createPageMetaTags({
		title: 'Home page',
		description: 'Home page description'
	});

	return {
		pageMetaTags: Object.freeze(pageMetaTags)
	};
};
