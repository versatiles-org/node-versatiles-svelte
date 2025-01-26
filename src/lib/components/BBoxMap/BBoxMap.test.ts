import { describe, it, expect } from 'vitest';
import { getBBoxDrag, dragBBox, getCursor, getBBoxGeometry, loadBBoxes, BBoxPixel } from './BBoxMap.js';
import type { BBoxDrag } from './BBoxMap.js';
import { LngLat, Point } from 'maplibre-gl';
import type { BBox } from 'geojson';

describe('BBox Module', () => {
	describe('getBBoxDrag', () => {
		it('should return the correct drag handle for a point near the top-left corner', () => {
			const point = new Point(103, 103);
			const bboxPixel = new BBoxPixel(100, 100, 200, 200);
			const drag = getBBoxDrag(point, bboxPixel);
			expect(drag).toBe('00');
		});

		it('should return false for a point far outside the bounding box', () => {
			const point = new Point(50, 50);
			const bboxPixel = new BBoxPixel(100, 100, 200, 200);
			const drag = getBBoxDrag(point, bboxPixel);
			expect(drag).toBe(false);
		});

		it('should prioritize closer handles when near both edges', () => {
			const point = new Point(103, 197);
			const bboxPixel = new BBoxPixel(100, 100, 200, 200);
			const drag = getBBoxDrag(point, bboxPixel);
			expect(drag).toBe('01');
		});
	});

	describe('dragBBox', () => {
		it('should adjust the bounding box when dragging the top-left corner', () => {
			const bbox: BBox = [100, 100, 200, 200];
			const drag: BBoxDrag = '00';
			const lngLat = new LngLat(90, 90);
			const result = dragBBox(bbox, drag, lngLat);
			expect(result.bbox).toEqual([90, 90, 200, 200]);
			expect(result.drag).toBe('00');
		});

		it('should flip the bounding box if the drag results in inverted coordinates', () => {
			const bbox: BBox = [100, 100, 200, 200];
			const drag: BBoxDrag = '10';
			const lngLat = new LngLat(90, 90);
			const result = dragBBox(bbox, drag, lngLat);
			expect(result.bbox).toEqual([90, 90, 100, 200]);
			expect(result.drag).toBe('00');
		});

		it('should not modify the bounding box for an invalid drag handle', () => {
			const bbox: BBox = [0, 0, 100, 100];
			const drag: BBoxDrag = false;
			const lngLat = new LngLat(50, 50);
			const result = dragBBox(bbox, drag, lngLat);
			expect(result.bbox).toEqual([0, 0, 100, 100]);
			expect(result.drag).toBe(false);
		});
	});

	describe('getCursor', () => {
		it('should return the correct cursor for a drag handle', () => {
			expect(getCursor('00')).toBe('nwse-resize');
			expect(getCursor('10')).toBe('nesw-resize');
			expect(getCursor('0_')).toBe('ew-resize');
			expect(getCursor('_0')).toBe('ns-resize');
		});

		it('should return false for an invalid drag handle', () => {
			expect(getCursor(false)).toBe(false);
		});
	});

	describe('getBBoxGeometry', () => {
		it('should return valid GeoJSON geometry for a bounding box', () => {
			const bbox: BBox = [100, 100, 200, 200];
			const geometry = getBBoxGeometry(bbox);

			expect(geometry.type).toBe('FeatureCollection');
			expect(geometry.features).toHaveLength(2);

			const [polygon, lineString] = geometry.features;
			expect(polygon.geometry.type).toBe('Polygon');
			expect(lineString.geometry.type).toBe('LineString');
		});
	});

	describe('loadBBoxes', () => {
		it('should load bounding boxes from a JSON file', async () => {
			const bboxes = await loadBBoxes();
			expect(bboxes.length).toBeGreaterThan(2000);
		});
	});
});