import { styles, type StyleBuilderOptions } from '@versatiles/style';
import { getLanguage } from './location.js';

export function getMapStyle(
	darkMode: boolean,
	styleOptions: StyleBuilderOptions & {
		transitionDuration?: number;
		disableDarkMode?: boolean;
	} = {}
) {
	darkMode = darkMode && !styleOptions.disableDarkMode;
	const style = styles.colorful({
		baseUrl: 'https://tiles.versatiles.org',
		language: getLanguage(),
		recolor: {
			invertBrightness: darkMode,
			gamma: darkMode ? 0.5 : 1
		},
		...styleOptions
	});
	if (styleOptions.transitionDuration != null) {
		style.transition = { duration: styleOptions.transitionDuration, delay: 0 };
	}
	return style;
}

export function isDarkMode(element?: HTMLElement): boolean {
	if (element != null) {
		const colorScheme = getComputedStyle(element).getPropertyValue('color-scheme');
		if (colorScheme.includes('dark')) return true;
		if (colorScheme.includes('light')) return false;
	}

	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}
