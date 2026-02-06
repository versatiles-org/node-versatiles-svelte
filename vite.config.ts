import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'happy-dom',
		include: ['scripts/**/*.test.ts', 'src/**/*.test.ts'],
		exclude: ['node_modules/**', '.svelte-kit/**'],
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'text']
		}
	},
	esbuild: {
		supported: {
			'top-level-await': true
		}
	},
	build: {
		target: 'esnext',
		chunkSizeWarningLimit: 1500,
		rollupOptions: {
			treeshake: true
		}
	}
});
