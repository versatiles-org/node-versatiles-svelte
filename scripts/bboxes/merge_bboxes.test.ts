import { describe, expect, it } from 'vitest';
import { mergeBBoxes } from './merge_bboxes.js';

describe('scripts/bboxes/merge_bboxes.ts', () => {
	it('should merge bounding boxes', async () => {
		const result = mergeBBoxes();
		const lines = result.split('\n');
		for (const line of lines) {
			const coords = line.replace(/.*?",/, '');
			if (coords.length > 32) {
				console.log({ line, coords, coordsLength: coords.length });
				expect(coords.length).lessThanOrEqual(32);
			}
		}
		const data = JSON.parse(result);
		expect(data.length).toBeGreaterThan(2000);
		expect(data[0]).toStrictEqual(['World', -180, -90, 360, 180]);
	});
});
