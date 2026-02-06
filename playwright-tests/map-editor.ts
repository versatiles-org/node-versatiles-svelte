import { expect, test } from './lib/test.js';
import { checkScreenshot, trackServerRequests, waitForMapIsReady } from './lib/utils';

const mapUrl =
	'/map-editor#Fk2UZ1xMayU0hNExzxiEwxgqXoVwXyjHnBichRjOhTkBBjXhZBiMhJiSiDhYjZImR6ejPxWlCiqAAAAm2vxielvgqXEiqAABIz4RCgDLDPGJ7HGCpcSKoAAElbCDICAZDotMYhLcYKhyKDbAAZB6ExIqgAABZSKoAAAA';

const ariaResult = `- region "Map"
- group:
  - text: ©
  - link "OpenStreetMap":
    - /url: https://www.openstreetmap.org/copyright
  - text: contributors
- button "Undo ✓" [disabled]
- button "Redo ✓" [disabled]
- separator
- button "Map":
  - text: Map
  - img
- button "New ✓"
- button "Open… ✓"
- button "Download ✓"
- button "Share/Embed ✓"
- separator
- button "Import/Export":
  - text: Import/Export
  - img
- text: "GeoJSON:"
- 'button "GeoJSON: Export ✓"': Import ✓
- button "Export ✓"
- separator
- button "Add new":
  - text: Add new
  - img
- button "Marker ✓"
- button "Line ✓"
- button "Polygon ✓"
- button "Circle ✓"
- separator
- button "Style":
  - text: Style
  - img
- separator
- button "Actions":
  - text: Actions
  - img
- separator
- button "Help":
  - text: Help
  - img
- paragraph:
  - text: Submit bugs and feature requests as
  - link "Repository on GitHub":
    - /url: https://github.com/versatiles-org/node-versatiles-svelte/issues
    - text: GitHub Issues`;

test('empty map', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/map-editor');
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
		'assets/glyphs/noto_sans_regular/256-511.pbf',
		'assets/glyphs/noto_sans_regular/512-767.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/5/16/10',
		'tiles/osm/5/16/11',
		'tiles/osm/5/17/10',
		'tiles/osm/5/17/11',
		'tiles/osm/5/18/10',
		'tiles/osm/5/18/11'
	]);

	expect(await page.locator('.wrapper').ariaSnapshot()).toBe(ariaResult);
	await checkScreenshot(page, 'empty', 3.7e5);
});

test('filled map', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto(mapUrl);
	await waitForMapIsReady(page);

	expect(tracker()).toStrictEqual([
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/13/4399/2686',
		'tiles/osm/13/4399/2687',
		'tiles/osm/13/4400/2686',
		'tiles/osm/13/4400/2687'
	]);

	expect(await page.locator('.wrapper').ariaSnapshot()).toBe(ariaResult);
	await checkScreenshot(page, 'loaded', 4.9e5);

	/*
	const [download] = await Promise.all([page.waitForEvent('download'), page.getByTestId('btnExportGeoJSON').click()]);
	const content = JSON.parse(readFileSync(await download.path(), 'utf-8'));
	expect(content).toStrictEqual({
		type: 'FeatureCollection'
	});
	*/
});
