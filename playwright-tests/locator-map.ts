import { expect, test } from '@playwright/test';
import { checkScreenshot, trackServerRequests, waitForMapIsReady } from './lib/utils';

test('default', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/locator-map');
	await waitForMapIsReady(page);

	expect(await page.locator('.wrapper').count()).toBe(1);
	expect(await page.locator('.wrapper').boundingBox()).toStrictEqual({
		x: 0,
		y: 0,
		width: 1280,
		height: 720
	});

	expect(tracker()).toStrictEqual([
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/1/0/0',
		'tiles/osm/1/0/1',
		'tiles/osm/1/1/0',
		'tiles/osm/1/1/1'
	]);

	expect(await page.locator('.wrapper').ariaSnapshot()).toBe(`- region "Map"
- group:
  - text: ©
  - link "OpenStreetMap":
    - /url: https://www.openstreetmap.org/copyright
  - text: contributors`);
	await checkScreenshot(page, 'default', 5e4);
});
