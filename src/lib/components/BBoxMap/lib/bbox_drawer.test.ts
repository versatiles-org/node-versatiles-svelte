import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BBoxDrawer } from './bbox_drawer.js';
import type { BBox, DragPoint } from './bbox_drawer.js';
import { LngLat, MockMap, Point, type MaplibreMap } from '../../../__mocks__/map.js';

describe('BBoxDrawer', () => {
	const initialBBox: BBox = [-20, -10, 10, 20];
	const map = new MockMap();
	let bboxDrawer: BBoxDrawer;

	beforeEach(() => {
		bboxDrawer = new BBoxDrawer(map as unknown as MaplibreMap, initialBBox, '#ff0000');
	});

	it('should initialize with the correct bbox', () => {
		expect(bboxDrawer.bbox).toEqual(initialBBox);
	});

	it('should update the bbox geometry', () => {
		const newBBox: BBox = [-30, -20, 20, 30];
		bboxDrawer.bbox = newBBox;
		expect(bboxDrawer.bbox).toEqual(newBBox);
	});

	it('should update the cursor style on drag point change', () => {
		const canvasStyleSpy = vi.spyOn(bboxDrawer['canvas'].style, 'cursor', 'set');
		bboxDrawer['updateDragPoint']('n');
		expect(canvasStyleSpy).toHaveBeenCalledWith('ns-resize');
	});

	describe('should handle dragging correctly', () => {
		function testDrag(dragPoint: DragPoint): BBox {
			bboxDrawer.bbox = initialBBox;
			const lngLat = new LngLat(0, 0);
			bboxDrawer['dragPoint'] = dragPoint;
			bboxDrawer['doDrag'](lngLat);
			return bboxDrawer.bbox;
		}

		it('ne', () => expect(testDrag('ne')).toEqual([-20, -10, 0, 0]));
		it('se', () => expect(testDrag('se')).toEqual([-20, 0, 0, 20]));
		it('nw', () => expect(testDrag('nw')).toEqual([0, -10, 10, 0]));
		it('sw', () => expect(testDrag('sw')).toEqual([0, 0, 10, 20]));
		it('n', () => expect(testDrag('n')).toEqual([-20, -10, 10, 0]));
		it('s', () => expect(testDrag('s')).toEqual([-20, 0, 10, 20]));
		it('w', () => expect(testDrag('w')).toEqual([0, -10, 10, 20]));
		it('e', () => expect(testDrag('e')).toEqual([-20, -10, 0, 20]));
		it('false', () => expect(testDrag(false)).toEqual([-20, -10, 10, 20]));
	});

	it('should flip bbox correctly when dragging past boundaries', () => {
		const lngLat = new LngLat(-15, -15);
		bboxDrawer['dragPoint'] = 'nw';
		bboxDrawer['doDrag'](lngLat);
		expect(bboxDrawer.bbox).toEqual([-15, -15, 10, -10]);
	});

	it('should redraw the bbox', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const redrawSpy = vi.spyOn(bboxDrawer, 'redraw' as any);
		bboxDrawer.bbox = [-30, -20, 20, 30];
		expect(redrawSpy).toHaveBeenCalled();
	});

	it('should check drag point at given point', () => {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const updateDragPointSpy = vi.spyOn(bboxDrawer, 'updateDragPoint' as any);
		const point = new Point(0, 0);
		bboxDrawer['checkDragPointAt'](point);
		expect(updateDragPointSpy).toHaveBeenCalled();
	});

	it('should get the correct cursor for drag point', () => {
		expect(bboxDrawer['getCursor']('n')).toEqual('ns-resize');
		expect(bboxDrawer['getCursor']('ne')).toEqual('nesw-resize');
		expect(bboxDrawer['getCursor']('e')).toEqual('ew-resize');
		expect(bboxDrawer['getCursor']('se')).toEqual('nwse-resize');
		expect(bboxDrawer['getCursor']('s')).toEqual('ns-resize');
		expect(bboxDrawer['getCursor']('sw')).toEqual('nesw-resize');
		expect(bboxDrawer['getCursor']('w')).toEqual('ew-resize');
		expect(bboxDrawer['getCursor']('nw')).toEqual('nwse-resize');
		expect(bboxDrawer['getCursor'](false)).toEqual('default');
	});
});
