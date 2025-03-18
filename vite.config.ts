import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	test: {
		include: ['{src,scripts}/**/*.{test,spec}.{js,ts}']
	},
	build: {
		target: 'esnext',
		chunkSizeWarningLimit: 1024,
		rollupOptions: {
			treeshake: 'smallest'
		}
	}
});
