
import { styles } from '@versatiles/style';
import { getLanguage } from './location.js';

export function getMapStyle() {
	const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
	return styles.colorful({
		baseUrl: 'https://tiles.versatiles.org',
		languageSuffix: getLanguage(),
		recolor: {
			invertBrightness: darkMode,
			gamma: darkMode ? 0.5 : 1,
		}
	});
}
