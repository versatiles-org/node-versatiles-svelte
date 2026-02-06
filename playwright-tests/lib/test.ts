import { test as base } from '@playwright/test';
import { setupRequestCache } from './utils.js';

export const test = base.extend({
	page: async ({ page }, use) => {
		await setupRequestCache(page);
		await use(page);
		await page.unrouteAll({ behavior: 'ignoreErrors' });
	}
});

export { expect } from '@playwright/test';
