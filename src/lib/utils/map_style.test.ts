import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMapStyle, isDarkMode } from './map_style.js';
import { styles } from '@versatiles/style';
import { getLanguage } from './location.js';

vi.mock('@versatiles/style', { spy: true });

vi.mock('./location.js', () => ({
	getLanguage: vi.fn()
}));

describe('src/lib/utils/map_style.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getMapStyle', () => {
		it('should call styles.colorful with dark mode options', () => {
			vi.mocked(getLanguage).mockReturnValue('en');
			getMapStyle({ darkMode: true });

			expect(styles.colorful).toHaveBeenCalledWith({
				baseUrl: 'https://tiles.versatiles.org',
				language: 'en',
				darkMode: true,
				recolor: {
					invertBrightness: true,
					gamma: 0.5
				}
			});
		});

		it('should call styles.colorful with light mode options', () => {
			vi.mocked(getLanguage).mockReturnValue('de');
			getMapStyle({ darkMode: false });
			expect(styles.colorful).toHaveBeenCalledWith({
				baseUrl: 'https://tiles.versatiles.org',
				language: 'de',
				darkMode: false,
				recolor: {
					invertBrightness: false,
					gamma: 1
				}
			});
		});

		it('should handle missing styleOptions gracefully', () => {
			vi.mocked(getLanguage).mockReturnValue(null);
			getMapStyle({ darkMode: true });
			expect(styles.colorful).toHaveBeenCalledWith({
				baseUrl: 'https://tiles.versatiles.org',
				language: null,
				darkMode: true,
				recolor: {
					invertBrightness: true,
					gamma: 0.5
				}
			});
		});
	});

	describe('isDarkMode', () => {
		const element = document.createElement('div');

		function mockComputedStyle(mode: string): void {
			vi.spyOn(window, 'getComputedStyle').mockReturnValue({
				getPropertyValue: vi.fn().mockReturnValue(mode)
			} as unknown as CSSStyleDeclaration);
		}

		function mockMatchMedia(cb: (query: string) => { matches?: boolean }): void {
			vi.spyOn(window, 'matchMedia').mockImplementation((query) => {
				const result = cb(query);
				return {
					matches: result.matches ?? false,
					media: query,
					addListener: vi.fn(),
					removeListener: vi.fn()
				} as unknown as MediaQueryList;
			});
		}

		it('should return true if element has dark mode color scheme', () => {
			mockComputedStyle('dark');
			expect(isDarkMode(element)).toBe(true);
		});

		it('should return false if element has light mode color scheme', () => {
			mockComputedStyle('light');
			expect(isDarkMode(element)).toBe(false);
		});

		it('should fallback to prefers-color-scheme media query if color scheme is not set', () => {
			mockComputedStyle('');
			mockMatchMedia((query) => ({ matches: query === '(prefers-color-scheme: dark)' }));
			expect(isDarkMode(element)).toBe(true);
		});

		it('should fallback to prefers-color-scheme media query if color scheme is not set', () => {
			mockComputedStyle('');
			mockMatchMedia((query) => ({ matches: query === '(prefers-color-scheme: light)' }));
			expect(isDarkMode(element)).toBe(false);
		});
	});
});
