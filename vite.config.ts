import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		environment: 'happy-dom',
		include: ['{src,scripts}/**/*.{test,spec}.{js,ts}'],
		coverage: {
			provider: 'v8',
			reporter: ['lcov', 'text']
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
