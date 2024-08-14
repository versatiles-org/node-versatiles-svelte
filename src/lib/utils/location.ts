import type { LanguageSuffix } from '@versatiles/style/dist/style_builder/types.js';
import { timezone2countrycode } from './zones.js';

export function getCountry() {
	try {
		const options = Intl.DateTimeFormat().resolvedOptions();
		let countryCode = timezone2countrycode(options.timeZone);
		if (!countryCode) countryCode = options.locale.split('-')[1];
		const region = new Intl.DisplayNames([options.locale], { type: 'region' });
		const country = region.of(countryCode);
		return country || '';
	} catch (error) {
		console.error('Could not determine country from timezone:', error);
		return ''; // Fallback if no country can be determined
	}
}

export function getLanguage(): LanguageSuffix {
	try {
		const language = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
		switch (language) {
			case 'en':
			case 'de':
				return language;
		}
		return undefined;
	} catch (error) {
		console.error('Could not determine country from timezone:', error);
		return undefined; // Fallback if no country can be determined
	}
}
