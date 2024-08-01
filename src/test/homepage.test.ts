// home.test.js
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';

import Home from '../routes/+page.svelte';

describe('Home route', () => {
	it('renders the div with default value', () => {
		const result = render(Home);

		const headerText = result.getByText('Welcome to SvelteKit');

		expect(headerText).toBeInTheDocument();
	});
});
