import { expect, test, } from '@playwright/test';

test('home page has expected h1', async ({ page }) => {
	await page.goto('/');
	expect(await page.locator('h1').innerText()).toBe('Welcome to VersaTiles Svelte library project');
});
