import { describe, it, expect } from 'vitest';
import { loadBBoxes } from './BBoxMap.js';

describe('BBox Module', () => {
	describe('loadBBoxes', () => {
		it('should load bounding boxes from a JSON file', async () => {
			const bboxes = await loadBBoxes();
			expect(bboxes.length).toBeGreaterThan(2000);
		});
	});
});
