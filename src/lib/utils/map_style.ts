import { osm, type OsmOptions } from '@versatiles/style';
import { getLanguage } from './location.js';

export function getMapStyle(
	styleOptions: OsmOptions & {
		darkMode?: boolean;
		transitionDuration?: number;
	} = {}
) {
	const { darkMode = isDarkMode(), transitionDuration, ...options } = styleOptions;
	const base = options.urls?.base ?? 'https://tiles.versatiles.org';
	const style = osm({
		projection: 'mercator',
		recolor: {
			invertBrightness: darkMode,
			gamma: darkMode ? 0.5 : 1
		},
		...options,
		urls: {
			base,
			// The tile server's TileJSON lists relative tile URLs, which MapLibre resolves
			// against the page instead of the tile server. So define the source inline.
			osm: {
				tiles: [base + '/tiles/osm/{z}/{x}/{y}'],
				vector_layers: [],
				minzoom: 0,
				maxzoom: 14,
				attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
			},
			...options.urls
		},
		text: { language: getLanguage() ?? 'local', ...options.text }
	});
	if (transitionDuration != null) {
		style.transition = { duration: transitionDuration, delay: 0 };
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
