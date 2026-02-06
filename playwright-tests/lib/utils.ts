import { expect, type Page } from '@playwright/test';
import { createHash } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const CACHE_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', '.request-cache');

export async function waitForMapIsReady(page: Page, count: number = 1): Promise<void> {
	await new Promise<void>((resolve) => {
		page.on('console', (msg) => {
			const text = msg.text();
			if (text == 'map_ready') {
				count--;
				if (count < 1) setTimeout(resolve, 100);
				return;
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
	expect(screenshot).toMatchSnapshot(name + '.png', { maxDiffPixelRatio: 0.02 });
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
		route.fallback();
	});
	return () => tileServerRequests.sort();
}

export async function setupRequestCache(page: Page): Promise<void> {
	if (!existsSync(CACHE_DIR)) {
		mkdirSync(CACHE_DIR, { recursive: true });
	}

	await page.route('**', async (route) => {
		const url = route.request().url();
		const { hostname } = new URL(url);

		if (hostname === 'localhost' || hostname === '127.0.0.1') {
			return route.continue();
		}

		const hash = createHash('sha256').update(url).digest('hex').slice(0, 16);
		const metaPath = join(CACHE_DIR, hash + '.meta.json');
		const bodyPath = join(CACHE_DIR, hash + '.body');

		if (existsSync(metaPath) && existsSync(bodyPath)) {
			const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
			const body = readFileSync(bodyPath);
			return route.fulfill({ status: meta.status, headers: meta.headers, body });
		}

		try {
			const response = await route.fetch();
			const body = await response.body();
			const headers = response.headers();
			// route.fetch() decompresses the body, so these headers no longer apply
			delete headers['content-encoding'];
			delete headers['content-length'];
			const meta = { status: response.status(), headers, url };

			writeFileSync(metaPath, JSON.stringify(meta, null, '\t'));
			writeFileSync(bodyPath, body);

			return route.fulfill({ status: meta.status, headers, body });
		} catch {
			// Page may have been closed while request was in flight
		}
	});
}
