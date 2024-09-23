import { styles, type ColorfulOptions } from '@versatiles/style';
import { getLanguage } from './location.js';

export function getMapStyle(darkMode: boolean, styleOptions: ColorfulOptions = {}) {
	return styles.colorful({
		baseUrl: 'https://tiles.versatiles.org',
		languageSuffix: getLanguage(),
		recolor: {
			invertBrightness: darkMode,
			gamma: darkMode ? 0.5 : 1
		},
		...styleOptions
	});
}

export function isDarkMode(element: HTMLElement): boolean {
	const colorScheme = getComputedStyle(element).getPropertyValue('color-scheme');
	if (colorScheme.includes('dark')) return true;
	if (colorScheme.includes('light')) return false;

	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
