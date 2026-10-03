import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMapStyle, isDarkMode } from './map_style.js';
import { osm } from '@versatiles/style';
import { getLanguage } from './location.js';

vi.mock('@versatiles/style', { spy: true });

vi.mock('./location.js', () => ({
	getLanguage: vi.fn()
}));

const urls = {
	base: 'https://tiles.versatiles.org',
	osm: {
		tiles: ['https://tiles.versatiles.org/tiles/osm/{z}/{x}/{y}'],
		vector_layers: [],
		minzoom: 0,
		maxzoom: 14,
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
	}
};

describe('src/lib/utils/map_style.ts', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getMapStyle', () => {
		it('should call osm with dark mode options', () => {
			vi.mocked(getLanguage).mockReturnValue('en');
			getMapStyle({ darkMode: true });

			expect(osm).toHaveBeenCalledWith({
				projection: 'mercator',
				recolor: {
					invertBrightness: true,
					gamma: 0.5
				},
				urls,
				text: { language: 'en' }
			});
		});

		it('should call osm with light mode options', () => {
			vi.mocked(getLanguage).mockReturnValue('de');
			getMapStyle({ darkMode: false });
			expect(osm).toHaveBeenCalledWith({
				projection: 'mercator',
				recolor: {
					invertBrightness: false,
					gamma: 1
				},
				urls,
				text: { language: 'de' }
			});
		});

		it('should handle missing styleOptions gracefully', () => {
			vi.mocked(getLanguage).mockReturnValue(null);
			getMapStyle({ darkMode: true });
			expect(osm).toHaveBeenCalledWith({
				projection: 'mercator',
				recolor: {
					invertBrightness: true,
					gamma: 0.5
				},
				urls,
				text: { language: 'local' }
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
