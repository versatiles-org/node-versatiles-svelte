import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCountryName, getCountryCode, getLanguage } from './location.js';
import { timezone2countrycode } from './zones.js';

// Mock the `timezone2countrycode` function
vi.mock('./zones.js', { spy: true });

describe('location.ts', () => {
	function mockResolvedOptions(options: { timeZone?: string; locale?: string }): void {
		vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockReturnValue(
			options as Intl.ResolvedDateTimeFormatOptions
		);
	}

	function mockLanguage(value: string): void {
		Object.defineProperty(global.navigator, 'language', { value, configurable: true });
	}

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getCountryName', () => {
		it('should return the country name based on the timezone', () => {
			vi.mocked(timezone2countrycode).mockReturnValue('US');
			mockResolvedOptions({ timeZone: 'America/New_York' });

			expect(getCountryName()).toBe('United States');
			expect(timezone2countrycode).toHaveBeenCalledWith('America/New_York');
		});

		it('should return the country name based on the timezone (Nigeria)', () => {
			vi.mocked(timezone2countrycode).mockReturnValue('NG');
			mockResolvedOptions({ timeZone: 'Africa/Lagos' });

			expect(getCountryName()).toBe('Nigeria');
			expect(timezone2countrycode).toHaveBeenCalledWith('Africa/Lagos');
		});

		it('should fallback to navigator.language if timezone2countrycode returns undefined', () => {
			vi.mocked(timezone2countrycode).mockReturnValue(undefined);
			mockResolvedOptions({ timeZone: 'Unknown/TimeZone' });
			mockLanguage('en-GB');

			expect(getCountryName()).toBe('United Kingdom');
			expect(timezone2countrycode).toHaveBeenCalledWith('Unknown/TimeZone');
		});

		it('should return null if no valid country can be determined', () => {
			vi.mocked(timezone2countrycode).mockReturnValue(undefined);
			mockResolvedOptions({ timeZone: 'Invalid/TimeZone' });
			mockLanguage('unknown');

			expect(getCountryName()).toBeNull();
		});

		it('should handle errors gracefully and return null', () => {
			vi.mocked(timezone2countrycode).mockImplementation(() => {
				throw new Error('Test error');
			});

			expect(getCountryName()).toBeNull();
		});
	});

	describe('getCountryCode', () => {
		it('should return the country code based on the timezone', () => {
			vi.mocked(timezone2countrycode).mockReturnValue('US');
			mockResolvedOptions({ timeZone: 'America/New_York' });

			expect(getCountryCode()).toBe('US');
			expect(timezone2countrycode).toHaveBeenCalledWith('America/New_York');
		});

		it('should fallback to navigator.language if timezone2countrycode returns undefined', () => {
			vi.mocked(timezone2countrycode).mockReturnValue(undefined);
			mockResolvedOptions({ timeZone: 'Unknown/TimeZone' });
			mockLanguage('en-GB');

			expect(getCountryCode()).toBe('GB');
			expect(timezone2countrycode).toHaveBeenCalledWith('Unknown/TimeZone');
		});

		it('should return null if no valid country code can be determined', () => {
			vi.mocked(timezone2countrycode).mockReturnValue(undefined);
			mockResolvedOptions({ timeZone: 'Invalid/TimeZone' });
			mockLanguage('unknown');

			expect(getCountryCode()).toBeNull();
		});

		it('should handle errors gracefully and return null', () => {
			vi.mocked(timezone2countrycode).mockImplementation(() => {
				throw new Error('Test error');
			});

			expect(getCountryCode()).toBeNull();
		});
	});

	describe('getLanguage', () => {
		it('should return "en" for English locale (USA)', () => {
			mockResolvedOptions({ locale: 'en-US' });
			expect(getLanguage()).toBe('en');
		});

		it('should return "en" for English locale (UK)', () => {
			mockResolvedOptions({ locale: 'en-GB' });
			expect(getLanguage()).toBe('en');
		});

		it('should return "de" for German locale', () => {
			mockResolvedOptions({ locale: 'de-DE' });
			expect(getLanguage()).toBe('de');
		});

		it('should return null for unsupported locales', () => {
			mockResolvedOptions({ locale: 'fr-FR' });
			expect(getLanguage()).toBeNull();
		});

		it('should handle errors gracefully and return null', () => {
			vi.spyOn(Intl.DateTimeFormat.prototype, 'resolvedOptions').mockImplementation(() => {
				throw new Error('Test error');
			});
			expect(getLanguage()).toBeNull();
		});
	});
});
