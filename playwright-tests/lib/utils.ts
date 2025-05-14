import { expect, type TestInfo, type Page } from '@playwright/test';

export async function waitForMapIsReady(page: Page, testInfo?: TestInfo): Promise<void> {
	//if (testInfo) {
	//	console.log('annotations', testInfo.annotations);
	//	console.log('test info', testInfo);
	//	console.log('test title', testInfo.title);
	//	console.log('test title path', testInfo.titlePath);
	//	console.log('test file', testInfo.file);
	//	console.log('test tags', testInfo.tags);
	//}
	const testPath: string[] = [process.platform];
	if (testInfo) testPath.push(testInfo.project.name, ...testInfo.titlePath);
	const testId = testPath.join(' > ');

	if (testInfo) console.time(testId);
	await new Promise<void>((resolve) => {
		page.on('console', (msg) => {
			const text = msg.text();
			if (text == 'map_ready') return resolve();
			if (text.includes('[JavaScript Warning: "WebGL warning: texImage:')) return;
			if (text.includes('GPU stall due to ReadPixels')) return;
			console.log(testId + ': ' + text);
		});
	});
	if (testInfo) console.timeLog(testId, 'map ready');
	await new Promise((resolve) => setTimeout(resolve, 1000));
	if (testInfo) console.timeLog(testId, 'waited 1 second');
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
