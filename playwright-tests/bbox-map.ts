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
		'assets/glyphs/noto_sans_regular/1024-1279.pbf',
		'assets/glyphs/noto_sans_regular/256-511.pbf',
		'assets/glyphs/noto_sans_regular/512-767.pbf',
		'assets/glyphs/noto_sans_regular/8192-8447.pbf',
		'assets/sprites/base.json',
		'assets/sprites/base.png',
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
		'assets/glyphs/noto_sans_regular/256-511.pbf',
		'assets/sprites/base.json',
		'assets/sprites/base.png',
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
		'assets/glyphs/noto_sans_regular/1024-1279.pbf',
		'assets/glyphs/noto_sans_regular/256-511.pbf',
		'assets/glyphs/noto_sans_regular/512-767.pbf',
		'assets/glyphs/noto_sans_regular/8192-8447.pbf',
		'assets/sprites/base.json',
		'assets/sprites/base.png',
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

test('bbox is drawn even when the style loads slowly', async ({ page }) => {
	// The drawer is created from `onMapInit`, which runs synchronously after `new Map()`.
	// maplibre marks an inline style loaded one animation frame later, so whether
	// `await loadBBoxes()` or the style wins is a race — Safari loses it, Chrome and Firefox
	// do not. Holding back the first animation frames reproduces Safari's ordering here:
	// the drawer then calls `addSource()` while the style is still loading, and maplibre
	// throws "Style is not done loading.".
	await page.addInitScript(() => {
		const requestFrame = window.requestAnimationFrame.bind(window);
		const delayUntil = performance.now() + 500;
		window.requestAnimationFrame = (callback) => {
			if (performance.now() >= delayUntil) return requestFrame(callback);
			return setTimeout(() => callback(performance.now()), 500) as unknown as number;
		};
	});

	const errors: string[] = [];
	page.on('pageerror', (error) => errors.push(error.message));

	await page.goto('/bbox-map#5,47,15,55');
	await waitForMapIsReady(page);

	expect(errors).toStrictEqual([]);

	// the geojson source and both layers were added
	const layerIds = await page.evaluate(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const map = (window as any).__testMap;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		return map.getStyle().layers.map((layer: any) => layer.id as string);
	});
	expect(layerIds.filter((id: string) => /^bbox-line_/.test(id))).toHaveLength(1);
	expect(layerIds.filter((id: string) => /^bbox-fill_/.test(id))).toHaveLength(1);

	// zoom() ran, so the map is centred on the requested bbox
	const center = await page.evaluate(() => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { lng, lat } = (window as any).__testMap.getCenter();
		return { lng, lat };
	});
	expect(center.lng).toBeCloseTo(10, 1);
	// not exactly 51: the map has a 42px top padding, which shifts the centre north
	expect(center.lat).toBeGreaterThan(47);
	expect(center.lat).toBeLessThan(55);

	// the dragEnd listener was registered, so dragging still updates selectedBBox
	const hiddenResult = page.locator('p.hidden_result');
	expect(await hiddenResult.textContent()).toBe('[5,47,15,55]');
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
