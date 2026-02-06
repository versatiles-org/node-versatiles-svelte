import { expect, test } from '@playwright/test';
import { checkScreenshot, trackServerRequests, waitForMapIsReady } from './lib/utils.js';

test('default', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/bbox-map');
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
		'tiles/osm/5/15/10',
		'tiles/osm/5/15/11',
		'tiles/osm/5/16/10',
		'tiles/osm/5/16/11',
		'tiles/osm/5/17/10',
		'tiles/osm/5/17/11',
		'tiles/osm/5/18/10',
		'tiles/osm/5/18/11'
	]);

	expect(await page.locator('.wrapper').ariaSnapshot()).toBe(`- textbox "Find country, region or city …": Germany
- button "Use visible area as bounding box":
  - img
- region "Map"
- group:
  - text: ©
  - link "OpenStreetMap":
    - /url: https://www.openstreetmap.org/copyright
  - text: contributors`);
	await checkScreenshot(page, 'default', 1e5);
});

test('initial state', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/bbox-map#2.52,49.495,6.38,51.497');
	await waitForMapIsReady(page);

	expect(tracker()).toStrictEqual([
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/7/64/42',
		'tiles/osm/7/64/43',
		'tiles/osm/7/65/42',
		'tiles/osm/7/65/43',
		'tiles/osm/7/66/42',
		'tiles/osm/7/66/43'
	]);
});

test('delayed state', async ({ page }) => {
	const tracker = await trackServerRequests(page);

	await page.goto('/bbox-map');
	await waitForMapIsReady(page);
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await page.waitForFunction(() => (window as any).setBBox([2.52, 49.495, 6.38, 51.497]));
	await page.waitForTimeout(3000); // wait for the bbox to be set

	expect(tracker()).toStrictEqual([
		'assets/glyphs/noto_sans_regular/0-255.pbf',
		'assets/glyphs/noto_sans_regular/256-511.pbf',
		'assets/glyphs/noto_sans_regular/512-767.pbf',
		'assets/sprites/basics/sprites.json',
		'assets/sprites/basics/sprites.png',
		'tiles/osm/5/15/10',
		'tiles/osm/5/15/11',
		'tiles/osm/5/16/10',
		'tiles/osm/5/16/11',
		'tiles/osm/5/17/10',
		'tiles/osm/5/17/11',
		'tiles/osm/5/18/10',
		'tiles/osm/5/18/11',
		'tiles/osm/7/64/42',
		'tiles/osm/7/64/43',
		'tiles/osm/7/65/42',
		'tiles/osm/7/65/43',
		'tiles/osm/7/66/42',
		'tiles/osm/7/66/43'
	]);
});

test('should get width and height from parent container', async ({ page }) => {
	await page.goto('/bbox-map');
	await waitForMapIsReady(page);

	// Set a custom size for the wrapper that differs from the viewport
	const customWidth = 800;
	const customHeight = 450;
	await page.evaluate(
		({ width, height }) => {
			const wrapper = document.querySelector('.wrapper') as HTMLElement;
			wrapper.style.width = `${width}px`;
			wrapper.style.height = `${height}px`;
		},
		{ width: customWidth, height: customHeight }
	);

	// Wait for the map to resize
	await page.waitForTimeout(100);

	const wrapper = page.locator('.wrapper');
	const container = page.locator('.wrapper > .container');
	const canvas = page.locator('.wrapper canvas');

	const wrapperBox = await wrapper.boundingBox();
	const containerBox = await container.boundingBox();
	const canvasBox = await canvas.boundingBox();

	expect(wrapperBox).not.toBeNull();
	expect(containerBox).not.toBeNull();
	expect(canvasBox).not.toBeNull();

	// Verify container fills the wrapper
	expect(containerBox!.width).toBe(customWidth);
	expect(containerBox!.height).toBe(customHeight);

	// Verify canvas also fills the wrapper
	expect(canvasBox!.width).toBe(customWidth);
	expect(canvasBox!.height).toBe(customHeight);
});

test('autocomplete search and selection', async ({ page }) => {
	await page.goto('/bbox-map');
	await waitForMapIsReady(page);

	const input = page.locator('input[type="text"]');
	const autocomplete = page.locator('div.autocomplete-results');
	const autocompleteResults = page.locator('div.autocomplete-results button');
	const hiddenResult = page.locator('p.hidden_result');

	// Select the text input and type "bra"
	await input.click();

	await input.fill('br');
	expect(await autocomplete.isVisible()).toBe(false);

	await input.fill('bra');
	expect(await autocomplete.isVisible()).toBe(true);
	expect(await autocompleteResults.first().textContent()).toBe('Brazil');
	expect(await autocompleteResults.nth(1).textContent()).toBe('Germany, Brandenburg');
	expect(await input.inputValue()).toBe('bra');

	// Press arrow down to move to second result (Germany, Brandenburg)
	await input.press('ArrowDown');
	expect(await input.inputValue()).toBe('bra');

	// Press Enter to select
	await input.press('Enter');
	expect(await input.inputValue()).toBe('Germany, Brandenburg');
	expect(await hiddenResult.textContent()).toBe('[11.26,51.36,14.77,53.559]');
});
