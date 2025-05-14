import { expect, test } from '@playwright/test';
import { checkScreenshot, trackServerRequests, waitForMapIsReady } from './lib/utils';

test.use({ viewport: { width: 903, height: 903 }, deviceScaleFactor: 1 });

test('works in iframe1', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/map-editor/iframe-test');
	await waitForMapIsReady(page, 3);
	await page.waitForTimeout(3000); // be more patient

	expect(tracker()).toStrictEqual([
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'assets/sprites/basics/sprites.png',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/12/2199/1343',
		'tiles/osm/12/2199/1343',
		'tiles/osm/12/2200/1343',
		'tiles/osm/12/2200/1343',
		'tiles/osm/13/4399/2686',
		'tiles/osm/13/4399/2687',
		'tiles/osm/13/4400/2686',
		'tiles/osm/13/4400/2687'
	]);

	await checkScreenshot(page, 'iframe1', 6e5);
});
