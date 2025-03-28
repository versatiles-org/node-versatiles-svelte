import { expect, test } from '@playwright/test';

test('site has expected .wrapper', async ({ page }) => {
	await page.goto('/locator-map');
	expect(await page.locator('.wrapper').count()).toBe(1);
	expect(await page.locator('.wrapper').boundingBox()).toStrictEqual({
		x: 0,
		y: 0,
		width: 1024,
		height: 768
	});
});
