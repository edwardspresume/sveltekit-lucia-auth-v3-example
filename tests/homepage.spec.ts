import { test, expect } from '@playwright/test';

test('Home page displays a header: Home page', async ({ page }) => {
	await page.goto('/');

	// We check that the page has a table with at least 59 rows.
	// We expect the table to have at least 59 rows because the default region is Africa for which
	// the API returns 59 countries.
	const text = 'Home page';
	await expect(page.locator('h1')).toHaveText(text);
});
