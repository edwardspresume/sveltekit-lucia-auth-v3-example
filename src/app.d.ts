// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces

import type { MetaTagsProps } from 'svelte-meta-tags';
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		interface PageData {
			pageMetaTags?: MetaTagsProps;
			session: string | undefined;
			flash?: { type: 'success' | 'error'; message: string };
		}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
