import { defineConfig, devices } from '@playwright/test';

const viewport = { width: 1024, height: 768 };

export default defineConfig({
	webServer: {
		command: 'npm run build && npm run preview',
		port: 4173
	},
	testDir: 'tests',
	testMatch: /\.ts$/,
	projects: [
		{
			name: 'chromium',
			use: {
				...devices['Desktop Chrome'],
				viewport,
				headless: false,
			}
		}
		/*
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'], viewport }
		}
		{
		  name: 'webkit',
		  use: { ...devices['Desktop Safari'] },
		},
		// Test against mobile viewports.
		{
		  name: 'Mobile Chrome',
		  use: { ...devices['Pixel 5'] },
		},
		{
		  name: 'Mobile Safari',
		  use: { ...devices['iPhone 12'] },
		},
		// Test against branded browsers.
		{
		  name: 'Google Chrome',
		  use: { ...devices['Desktop Chrome'], channel: 'chrome' }, // or 'chrome-beta'
		},
		{
		  name: 'Microsoft Edge',
		  use: { ...devices['Desktop Edge'], channel: 'msedge' }, // or 'msedge-dev'
		},
		*/
	]
});
