
import { ChildProcess, spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { webkit } from 'playwright';

const path = resolve(import.meta.dirname, '../screenshots');
mkdirSync(path, { recursive: true });

(async () => {
	console.log('start server');
	const server = await npm_run_preview();

	const names = ['bbox-map'];

	const browser = await webkit.launch();
	const context = await browser.newContext({
		colorScheme: 'light',
		deviceScaleFactor: 1,
		locale: 'de-DE',
		viewport: { width: 640, height: 640 },
		timezoneId: 'Europe/Berlin'
	});

	const page = await context.newPage();
	page.on('console', msg => console.log(msg.text()));

	for (const name of names) {
		console.log('generate screenshot: ' + name);
		await page.goto('http://localhost:4173/' + name, { waitUntil: 'networkidle' });

		await screenShot(1, 'light');
		await screenShot(2, 'dark');

		async function screenShot(index: number, suffix: string) {
			const l = page.locator(`.wrapper:nth-child(${index})`);
			const clip = await l.boundingBox();
			if (!clip) throw Error();
			clip.x += 2;
			clip.y += 2;
			clip.width -= 4;
			clip.height -= 4;
			await page.screenshot({
				path: resolve(path, `${name}-${suffix}.png`),
				clip,
				fullPage: true,
			});

		}
	}

	console.log('stop server');
	server.kill();

	process.exit(0);
})()

async function npm_run_preview(): Promise<ChildProcess> {
	const cp = spawn('npm', ['run', 'preview'], { stdio: 'pipe' });
	return new Promise<ChildProcess>(r => setTimeout(() => r(cp), 1500));
}
