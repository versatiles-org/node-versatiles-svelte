import { ChildProcess, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import type { Page } from 'playwright';

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
			hash: '#45L70LWY8VJzI6vPDCYGERYjRnneZXMWM85kuirjXDiZMVFcK6jsFGNdU08j61SW54x2eozmzu6qopfZ1rNwa6xiYPA2YmAwYpA79ncR476fDaxgMRtm17wUsPCkOYsZ9/Q0QoVZg0sSi0oYGIyY5FnOLVjMyN7PXL+su5G1hYmhlQmsxD3Fg4mBB2wuFwMDAwA='
		}
	];

	const browser = await chromium.launch();
	const option = {
		colorScheme: 'light',
		deviceScaleFactor: 1,
		locale: 'de-DE',
		viewport: { width: width + 2, height: height + 2 },
		timezoneId: 'Europe/Berlin'
	};
	const contextLight = await browser.newContext({ ...option, colorScheme: 'light' });
	const contextDark = await browser.newContext({ ...option, colorScheme: 'dark' });

	const pageLight = await contextLight.newPage();
	const pageDark = await contextDark.newPage();

	for (const { name, hash } of sites) {
		await screenShot(pageLight, 'light');
		await screenShot(pageDark, 'dark');

		async function screenShot(page: Page, suffix: string) {
			console.log('generate screenshot: ' + name + ' - ' + suffix);
			await page.goto('http://localhost:4173/' + name + (hash ?? ''), { waitUntil: 'networkidle' });
			await wait(5);

			const l = page.locator('.wrapper');
			const clip = await l.boundingBox();
			if (!clip) throw Error();

			clip.x += 1;
			clip.y += 1;
			clip.width = width;
			clip.height = height;

			await page.screenshot({
				path: resolve(path, `${name}-${suffix}.png`),
				clip,
				fullPage: true
			});
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
