import { expect, test } from './lib/test.js';
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

test('select visible area button', async ({ page }) => {
	await page.goto('/bbox-map');
	await waitForMapIsReady(page);

	const hiddenResult = page.locator('p.hidden_result');
	const button = page.locator('button.select-visible');

	// Click the "select visible area" button on the default view
	await button.click();
	await page.waitForTimeout(500);

	// The bbox should now be set (was undefined before)
	const bboxText = await hiddenResult.textContent();
	const bbox = JSON.parse(bboxText!);
	expect(bbox).toHaveLength(4);
	// west < east, south < north
	expect(bbox[0]).toBeLessThan(bbox[2]);
	expect(bbox[1]).toBeLessThan(bbox[3]);
	// Values should be rounded to 3 decimal places
	for (const v of bbox) {
		expect(Math.round(v * 1e3)).toBe(v * 1e3);
	}
});

test('select visible area round-trip stability', async ({ page }) => {
	await page.goto('/bbox-map');
	await waitForMapIsReady(page);

	const hiddenResult = page.locator('p.hidden_result');
	const button = page.locator('button.select-visible');

	// Set a specific bbox and wait for zoom
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	await page.waitForFunction(() => (window as any).setBBox([8, 48, 12, 52]));
	await page.waitForTimeout(3000);

	// Click the button to select the visible area
	await button.click();
	await page.waitForTimeout(500);

	const bboxFirst = JSON.parse((await hiddenResult.textContent())!);

	// Click again — the bbox should remain stable (round-trip is lossless)
	await button.click();
	await page.waitForTimeout(500);

	const bboxSecond = JSON.parse((await hiddenResult.textContent())!);

	expect(bboxSecond[0]).toBeCloseTo(bboxFirst[0], 2);
	expect(bboxSecond[1]).toBeCloseTo(bboxFirst[1], 2);
	expect(bboxSecond[2]).toBeCloseTo(bboxFirst[2], 2);
	expect(bboxSecond[3]).toBeCloseTo(bboxFirst[3], 2);
});

test('bbox drag updates selectedBBox', async ({ page }) => {
	await page.goto('/bbox-map#5,47,15,55');
	await waitForMapIsReady(page);

	const hiddenResult = page.locator('p.hidden_result');
	const canvas = page.locator('.maplibregl-canvas');

	const bboxBefore = await hiddenResult.textContent();
	expect(bboxBefore).toBe('[5,47,15,55]');

	const canvasBox = await canvas.boundingBox();
	expect(canvasBox).not.toBeNull();

	// Use map.project() to get the actual pixel position of the east edge,
	// since cameraForBounds may not fill the full viewport width.
	const eastEdgePixel = await page.evaluate(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const map = (window as any).__testMap;
		const p = map.project([15, 51]); // east lon, center lat of bbox
		return { x: p.x, y: p.y };
	});

	const eastEdgeX = canvasBox!.x + eastEdgePixel.x;
	const centerY = canvasBox!.y + eastEdgePixel.y;
	const dragTargetX = eastEdgeX - 100;

	await page.mouse.move(eastEdgeX, centerY);
	await page.mouse.down();
	await page.mouse.move(dragTargetX, centerY, { steps: 10 });
	await page.mouse.up();
	await page.waitForTimeout(500);

	// The bbox should have changed
	const bboxAfter = await hiddenResult.textContent();
	expect(bboxAfter).not.toBe(bboxBefore);

	const bbox = JSON.parse(bboxAfter!);
	expect(bbox).toHaveLength(4);
	expect(bbox[0]).toBeLessThan(bbox[2]);
	expect(bbox[1]).toBeLessThan(bbox[3]);
	// The east edge should have moved west (smaller longitude)
	expect(bbox[2]).toBeLessThan(15);
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
