import { expect, test } from './lib/test.js';
import { checkScreenshot, trackServerRequests, waitForMapIsReady } from './lib/utils.js';

test('default', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/basic-map');
	await waitForMapIsReady(page);

	expect(await page.locator('.wrapper').count()).toBe(1);
	expect(await page.locator('.wrapper').boundingBox()).toStrictEqual({
		x: 0,
		y: 0,
		width: 1280,
		height: 720
	});

	expect(tracker()).toStrictEqual([
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/2/1/1',
		'tiles/osm/2/1/2',
		'tiles/osm/2/2/1',
		'tiles/osm/2/2/2',
		'tiles/osm/2/3/1',
		'tiles/osm/2/3/2'
	]);

	expect(await page.locator('.wrapper').ariaSnapshot()).toBe(`- region "Map"
- group:
  - text: ©
  - link "OpenStreetMap":
    - /url: https://www.openstreetmap.org/copyright
  - text: contributors`);
	await checkScreenshot(page, 'default', 5e4);
});
