import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BBoxDrawer } from './bbox.js';
import type { BBox, DragPoint } from './bbox.js';
import { get } from 'svelte/store';
import { LngLat, MockMap, Point, type MaplibreMap } from '../../../__mocks__/map.js';

describe('BBoxDrawer', () => {
	const initialBBox: BBox = [-20, -10, 10, 20];
	const map = new MockMap();
	const bboxDrawer = new BBoxDrawer(map as unknown as MaplibreMap, initialBBox, '#ff0000');

	beforeEach(() => {
		bboxDrawer.setGeometry(initialBBox);
	});

	it('should initialize with the correct bbox', () => {
		expect(get(bboxDrawer.bbox)).toEqual(initialBBox);
	});

	it('should update the bbox geometry', () => {
		const newBBox: BBox = [-30, -20, 20, 30];
		bboxDrawer.setGeometry(newBBox);
		expect(get(bboxDrawer.bbox)).toEqual(newBBox);
	});

	it('should return the correct bounds', () => {
		const bounds = bboxDrawer.getBounds();
		expect(bounds.getWest()).toBeCloseTo(initialBBox[0]);
		expect(bounds.getSouth()).toBeCloseTo(initialBBox[1]);
		expect(bounds.getEast()).toBeCloseTo(initialBBox[2]);
		expect(bounds.getNorth()).toBeCloseTo(initialBBox[3]);
	});

	it('should update the cursor style on drag point change', () => {
		const canvasStyleSpy = vi.spyOn(bboxDrawer['canvas'].style, 'cursor', 'set');
		bboxDrawer['updateDragPoint']('n');
		expect(canvasStyleSpy).toHaveBeenCalledWith('ns-resize');
	});

	it('should handle dragging correctly', () => {
		const lngLat = new maplibregl.LngLat(15, 15);
		bboxDrawer['dragPoint'] = 'se';
		bboxDrawer['doDrag'](lngLat);
		expect(get(bboxDrawer.bbox)).toEqual([-10, 10, 15, 15]);
	});

	it('should flip bbox correctly when dragging past boundaries', () => {
		const lngLat = new maplibregl.LngLat(-15, -15);
		bboxDrawer['dragPoint'] = 'nw';
		bboxDrawer['doDrag'](lngLat);
		expect(get(bboxDrawer.bbox)).toEqual([-15, -15, 15, 15]);
	});
});
