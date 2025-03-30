import { describe, it, expect } from 'vitest';
import { getMiddlePoint, lat2mercator, mercator2lat } from './utils.js';
import type { ElementPoint } from './element/types.js';

describe('Coordinate Conversion Utils', () => {
	it('should convert latitude to Mercator projection correctly', () => {
		expect(lat2mercator(0)).toBeCloseTo(0); // Equator should map to 0
		expect(lat2mercator(85.051128)).toBeCloseTo(Math.PI);
		expect(lat2mercator(-85.051128)).toBeCloseTo(-Math.PI);
	});

	it('should convert Mercator projection back to latitude correctly', () => {
		expect(mercator2lat(0)).toBeCloseTo(0);
		expect(mercator2lat(lat2mercator(45))).toBeCloseTo(45, 5);
		expect(mercator2lat(lat2mercator(-30))).toBeCloseTo(-30, 5);
	});

	it('should get the middle point correctly', () => {
		const p0: ElementPoint = [0, 0];
		const p1: ElementPoint = [10, 10];
		const middle = getMiddlePoint(p0, p1);

		expect(middle[0]).toBeCloseTo(5);
		expect(middle[1]).toBeCloseTo(mercator2lat((lat2mercator(0) + lat2mercator(10)) / 2));
	});
});
