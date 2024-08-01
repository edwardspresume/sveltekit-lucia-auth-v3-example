import type { ParamMatcher } from '@sveltejs/kit';

export const match: ParamMatcher = (param) => /^[a-z0-9-]+$/.test(param);
