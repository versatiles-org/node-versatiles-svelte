import { describe, it, expect, beforeEach, vi } from 'vitest';
import maplibregl from 'maplibre-gl';
import { BBoxDrawer, type BBox } from './bbox.js';
import { get } from 'svelte/store';
import { MockMap } from '../../../__mocks__/map.js';

describe('BBoxDrawer', () => {
	let map: maplibregl.Map;
	let bboxDrawer: BBoxDrawer;
	const initialBBox: BBox = [-10, -10, 10, 10];

	beforeEach(() => {
		map = new MockMap() as unknown as maplibregl.Map;
		bboxDrawer = new BBoxDrawer(map, initialBBox, '#ff0000');
	});

	it('should initialize with the correct bbox', () => {
		expect(get(bboxDrawer.bbox)).toEqual(initialBBox);
	});

	it('should update the bbox geometry', () => {
		const newBBox: BBox = [-20, -20, 20, 20];
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
