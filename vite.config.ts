import { enhancedImages } from '@sveltejs/enhanced-img';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { kitRoutes } from 'vite-plugin-kit-routes';
import sveltekitApiGenerator from 'vite-plugin-sveltekit-api-generator';

export default defineConfig({
	plugins: [enhancedImages(), sveltekit(), kitRoutes(), sveltekitApiGenerator()]
});
