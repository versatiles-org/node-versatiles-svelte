import { describe, it, expect } from 'vitest';
import { roundBBox, bboxOverlap } from './bboxes.js';
import type { BBox } from 'geojson';

describe('bboxes.ts', () => {
	describe('roundBBox', () => {
		it('should round values of a large bounding box with no significant rounding', () => {
			const bbox: BBox = [-200, -100, 200, 100];
			const result = roundBBox(bbox);
			expect(result).toEqual([-200, -100, 200, 100]); // No rounding expected
		});

		it('should round values of a medium bounding box with precision to the nearest 0.1', () => {
			const bbox: BBox = [10.1234, 20.5678, 30.9876, 40.5432];
			const result = roundBBox(bbox);
			expect(result).toEqual([10.12, 20.56, 30.99, 40.55]); // Rounded to nearest 0.01
		});

		it('should round values of a small bounding box with precision to the nearest 0.01', () => {
			const bbox: BBox = [0.12345, 0.56789, 1.23456, 1.98765];
			const result = roundBBox(bbox);
			expect(result).toEqual([0.123, 0.567, 1.235, 1.988]); // Rounded to nearest 0.001
		});

		it('should round values of a very small bounding box with precision to the nearest 0.001', () => {
			const bbox: BBox = [0.001234, 0.005678, 0.012345, 0.019876];
			const result = roundBBox(bbox);
			expect(result).toEqual([0.001, 0.005, 0.013, 0.02]); // Rounded to nearest 0.001
		});

		it('should handle bounding boxes with zero size', () => {
			const bbox: BBox = [10, 20, 10, 20];
			const result = roundBBox(bbox);
			expect(result).toEqual([10, 20, 10, 20]); // No change expected
		});
	});

	describe('bboxOverlap', () => {
		it('should return true for overlapping bounding boxes', () => {
			const bbox1: BBox = [-10, -10, 10, 10];
			const bbox2: BBox = [0, 0, 20, 20];
			expect(bboxOverlap(bbox1, bbox2)).toBe(true);
		});

		it('should return false for non-overlapping bounding boxes', () => {
			const bbox1: BBox = [-10, -10, -5, -5];
			const bbox2: BBox = [5, 5, 10, 10];
			expect(bboxOverlap(bbox1, bbox2)).toBe(false);
		});

		it('should return true for touching bounding boxes', () => {
			const bbox1: BBox = [-10, -10, 0, 0];
			const bbox2: BBox = [0, 0, 10, 10];
			expect(bboxOverlap(bbox1, bbox2)).toBe(true); // Touching counts as overlap
		});

		it('should return false for bounding boxes with no area', () => {
			const bbox1: BBox = [10, 10, 10, 10]; // Zero-area box
			const bbox2: BBox = [20, 20, 30, 30];
			expect(bboxOverlap(bbox1, bbox2)).toBe(false);
		});

		it('should return true when one bounding box completely contains another', () => {
			const bbox1: BBox = [-10, -10, 10, 10];
			const bbox2: BBox = [-5, -5, 5, 5];
			expect(bboxOverlap(bbox1, bbox2)).toBe(true); // Containment counts as overlap
		});
	});
});