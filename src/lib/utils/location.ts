import type { Language } from '@versatiles/style';
import { timezone2countrycode } from './zones.js';

export function getCountry() {
	try {
		const options = Intl.DateTimeFormat().resolvedOptions();
		let countryCode = timezone2countrycode(options.timeZone);
		if (!countryCode) countryCode = navigator.language.split('-')[1];
		const region = new Intl.DisplayNames(['en-GB'], { type: 'region' });
		const country = region.of(countryCode);
		return country || '';
	} catch (error) {
		console.error('Could not determine country from timezone:', error);
		return ''; // Fallback if no country can be determined
	}
}

export function getLanguage(): Language {
	try {
		const language = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0];
		switch (language) {
			case 'en':
			case 'de':
				return language;
		}
		return null;
	} catch (error) {
		console.error('Could not determine country from timezone:', error);
		return null; // Fallback if no country can be determined
	}
}
