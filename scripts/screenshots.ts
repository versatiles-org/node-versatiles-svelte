import { ChildProcess, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import type { Page } from 'playwright';

const path = resolve(import.meta.dirname, '../screenshots');
mkdirSync(path, { recursive: true });

(async () => {
	console.log('start server');
	const server = await npm_run_preview();

	const names = ['basic-map', 'bbox-map', 'locator-map'];

	const browser = await chromium.launch();
	const option = {
		colorScheme: 'light',
		deviceScaleFactor: 1,
		locale: 'de-DE',
		viewport: { width: 514, height: 514 },
		timezoneId: 'Europe/Berlin'
	};
	const contextLight = await browser.newContext({ ...option, colorScheme: 'light' });
	const contextDark = await browser.newContext({ ...option, colorScheme: 'dark' });

	const pageLight = await contextLight.newPage();
	const pageDark = await contextDark.newPage();

	for (const name of names) {
		await screenShot(pageLight, 'light');
		await screenShot(pageDark, 'dark');

		async function screenShot(page: Page, suffix: string) {
			console.log('generate screenshot: ' + name + ' - ' + suffix);
			await page.goto('http://localhost:4173/' + name, { waitUntil: 'networkidle' });
			await wait(5);

			const l = page.locator('.wrapper');
			const clip = await l.boundingBox();
			if (!clip) throw Error();

			clip.x += 1;
			clip.y += 1;
			clip.width -= 2;
			clip.height -= 2;

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
