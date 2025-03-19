import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		environment: 'happy-dom',
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'text'],
			include: ['scripts/**/*.ts', 'src/**/*.ts']
		},
		include: ['scripts/bboxes/**/*.test.ts', 'src/**/*.test.ts', '!.svelte-kit/**']
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	}
});
