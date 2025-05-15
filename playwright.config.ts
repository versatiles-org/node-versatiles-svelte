import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'playwright-tests',
	testMatch: /\.ts$/,
	testIgnore: ['**/lib/**'],
	expect: {
		toMatchSnapshot: {
			maxDiffPixelRatio: 1e-5,
			threshold: 0.01
		}
	},
	use: {
		ignoreHTTPSErrors: true,
		viewport: { width: 1280, height: 720 },
		deviceScaleFactor: 1,
		timezoneId: 'Europe/Berlin'
	},
	snapshotDir: 'playwright-tests/__snapshots__',
	projects: [
		{
			name: 'chromium',
			use: { ...devices['Desktop Chrome'], launchOptions: { args: ['--enable-unsafe-swiftshader'] } }
		},
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] }
		}
	]
});
