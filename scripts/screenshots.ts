import { ChildProcess, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { firefox } from 'playwright';
import type { BrowserContext, Page } from 'playwright';

const path = resolve(import.meta.dirname, '../screenshots');
mkdirSync(path, { recursive: true });

(async () => {
	const width = 1024;
	const height = 768;

	console.log('start server');
	const server = await npm_run_preview();

	const sites = [
		{ name: 'basic-map' },
		{ name: 'bbox-map' },
		{ name: 'locator-map', hash: '#14.89/13.408956/52.519744' },
		{
			name: 'map-editor',
			hash: '#Fk2UZ1xMayU0hNExzxiEwxgqXoVwXyjHnBichRjOhTkBBjXhZBiMhJiSiDhYjZImR6ejPxWlCiqAAAAm2vxielvgqXEiqAABIz4RCgDLDPGJ7HGCpcSKoAAElbCDICAZDotMYhLcYKhyKDbAAZB6ExIqgAABZSKoAAAA'
		}
	];

	const browser = await firefox.launch();
	const option = {
		colorScheme: 'light',
		deviceScaleFactor: 1,
		locale: 'de-DE',
		viewport: { width: width + 2, height: height + 2 },
		timezoneId: 'Europe/Berlin'
	};
	const contextLight = await browser.newContext({ ...option, colorScheme: 'light' });
	const contextDark = await browser.newContext({ ...option, colorScheme: 'dark' });

	logContext(contextLight);
	logContext(contextDark);

	const pageLight = await contextLight.newPage();
	const pageDark = await contextDark.newPage();

	logPage(pageLight);
	logPage(pageDark);

	for (const { name, hash } of sites) {
		await screenShot(pageLight, 'light');
		await screenShot(pageDark, 'dark');

		async function screenShot(page: Page, suffix: string) {
			console.log(`screenshot: ${name} - ${suffix}`);

			console.log(`  - loading`);
			await page.goto('http://localhost:4173/' + name + (hash ?? ''), { waitUntil: 'networkidle' });
			await wait(3);

			console.log(`  - capturing`);
			const l = page.locator('.wrapper');
			const count = await l.count();
			if (count !== 1) {
				console.log('locator count', count);
				console.log(await page.innerHTML('html'));
			}
			const clip = await l.boundingBox();
			if (!clip) throw Error();

			clip.x += 1;
			clip.y += 1;
			clip.width -= 2;
			clip.height -= 2;

			if (clip.width != width || clip.height != height || clip.x != 1 || clip.y != 1) {
				console.log('clip', clip);
				console.log('viewport', page.viewportSize());
				console.log('html', await page.innerHTML('html'));
				throw Error('wrong bounding box');
			}

			const filename = resolve(path, `${name}-${suffix}.png`);
			const buffer = await page.screenshot({ path: filename, clip });

			console.log(`  - saved in ${Math.round(buffer.length / 1024)} KB`);
		}
	}

	console.log('stop server');
	server.kill();

	process.exit(0);
})();

async function npm_run_preview(): Promise<ChildProcess> {
	const cp = spawn('npm', ['run', 'preview'], { stdio: 'pipe' });
	await wait(5);
	return cp;
}

function wait(seconds: number): Promise<void> {
	return new Promise<void>((r) => setTimeout(() => r(), seconds * 1500));
}

function logContext(context: BrowserContext) {
	context.on('weberror', (webError) => console.log(`Uncaught exception: "${webError.error()}"`));
}

function logPage(page: Page) {
	page.on('console', (msg) => {
		const text = msg.text();
		if (text.includes('Alpha-premult and y-flip are deprecated')) return;
		console.log(`console.${msg.type()}: ${text}`);
	});
	page.on('requestfailed', (request) => console.log(`url: ${request.url()}, error: ${request.failure()?.errorText}`));
}
