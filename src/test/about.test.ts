// about.test.js
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';
import { render } from '@testing-library/svelte';

import About from '../routes/team/+page.svelte';

describe('About route', () => {
	it('renders the div with default value', () => {
		const { getByText } = render(About);

		expect(getByText('Hi bar!')).toBeInTheDocument();
	});

	it('renders the div with property value', () => {
		// const { getByText } = render(About, { foo: 'foo' });
		const { getByText } = render(About);

		expect(getByText('Hi foo!')).toBeInTheDocument();
	});
});

it('renders the div with input field', async () => {
	// const { getByText, getByRole } = render(About);
	const { getByText } = render(About);

	// const inputField = getByRole('textbox');
	// await fireEvent.input(inputField, { target: { value: 'foobar' } });

	expect(getByText('Hi foobar!')).toBeInTheDocument();
});
