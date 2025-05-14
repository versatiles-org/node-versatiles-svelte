import { expect, type Page } from '@playwright/test';

export async function waitForMapIsReady(page: Page, count: number = 1): Promise<void> {
	await new Promise<void>((resolve) => {
		page.on('console', (msg) => {
			const text = msg.text();
			if (text == 'map_ready') {
				count--;
				if (count < 1) return resolve();
			}
			if (text.includes('[JavaScript Warning: "WebGL warning: texImage:')) return;
			if (text.includes('GPU stall due to ReadPixels')) return;
			console.log(process.platform + ': ' + text);
		});
	});
	await new Promise((resolve) => setTimeout(resolve, 1000));
}

export async function checkScreenshot(page: Page, name: string, minFileSize: number = 7e4): Promise<void> {
	const screenshot = await page.screenshot();
	expect(screenshot).toMatchSnapshot(name + '.png');
	expect(screenshot).toBeInstanceOf(Buffer);
	expect(screenshot.length).toBeGreaterThan(minFileSize);
}

export async function trackServerRequests(page: Page): Promise<() => string[]> {
	const prefix = 'https://tiles.versatiles.org/';
	const tileServerRequests: string[] = [];
	await page.route(prefix + '**', (route) => {
		let url = route.request().url();
		url = url.replace(prefix, '');
		// ignore retina requests
		url = url.replace('sprites@2x.', 'sprites.');

		tileServerRequests.push(url);
		route.continue();
	});
	return () => tileServerRequests.sort();
}
