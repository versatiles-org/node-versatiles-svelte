import type { Language } from '@versatiles/style';
import { timezone2countrycode } from './zones.js';

export function getCountryName(): string | null {
	try {
		const countryCode = getCountryCode();
		if (!countryCode) return null;
		const region = new Intl.DisplayNames(['en-GB'], { type: 'region' });
		const country = region.of(countryCode);
		return country || null;
	} catch {
		return null;
	}
}

export function getCountryCode(): string | null {
	try {
		const options = Intl.DateTimeFormat().resolvedOptions();
		let countryCode = timezone2countrycode(options.timeZone);
		if (!countryCode) countryCode = navigator.language.split('-')[1];
		return countryCode || null;
	} catch {
		return null;
	}
}

export function getLanguage(): Language {
	try {
		const language = Intl.DateTimeFormat().resolvedOptions().locale.split('-')[0].toLowerCase();
		switch (language) {
			case 'en':
			case 'de':
				return language;
		}
		return null;
	} catch {
		return null; // Fallback if no country can be determined
	}
}
