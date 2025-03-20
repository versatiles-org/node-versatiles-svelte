import { describe, expect, it, beforeEach, vi } from 'vitest';
import { AbstractPathElement } from './abstract_path.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';
import { getMiddlePoint } from '../utils.js';
import type { SelectionNode } from './types.js';
import type { StateObject } from '../state/types.js';

class TestPathElement extends AbstractPathElement {
	constructor(manager: GeometryManager, isLine: boolean) {
		super(manager, isLine);
	}
	isActive = true;

	isSelected = true;

	getFeature(): GeoJSON.Feature {
		return {
			type: 'Feature',
			geometry: { type: 'LineString', coordinates: this.path },
			properties: {}
		};
	}
	getState(): StateObject {
		return {
			points: [
				[100, -81],
				[102, -83]
			]
		};
	}

	public handleDrag(e: maplibregl.MapMouseEvent): void {
		super.handleDrag(e);
	}

	destroy() {}
}

describe('AbstractPathElement', () => {
	let mockManager: MockGeometryManager;
	let manager: GeometryManager;

	beforeEach(() => {
		mockManager = new MockGeometryManager();
		manager = mockManager as unknown as GeometryManager;
	});

	it('should initialize with empty path', () => {
		const element = new TestPathElement(manager, true);
		expect(element).toBeDefined();
		expect(element['path']).toEqual([]);
	});

	it('should generate selection nodes correctly', () => {
		const element = new TestPathElement(manager, true);
		element['path'] = [
			[0, 0],
			[10, 10]
		];
		const nodes: SelectionNode[] = element.getSelectionNodes();

		expect(nodes.length).toBe(3);
		expect(nodes[0]).toEqual({ index: 0, coordinates: [0, 0] });
		expect(nodes[1]).toEqual({
			index: 0.5,
			transparent: true,
			coordinates: getMiddlePoint([0, 0], [10, 10])
		});
		expect(nodes[2]).toEqual({ index: 1, coordinates: [10, 10] });
	});

	it('should update selection node correctly', () => {
		const element = new TestPathElement(manager, true);
		element['path'] = [
			[0, 0],
			[10, 10]
		];
		const updater = element.getSelectionNodeUpdater({ index: 1 });
		if (updater) {
			updater.update(5, 5);
			expect(element['path'][1]).toEqual([5, 5]);
		}
	});

	it('should delete selection node correctly', () => {
		const element = new TestPathElement(manager, true);
		element['path'] = [
			[0, 0],
			[10, 10],
			[20, 20]
		];
		const updater = element.getSelectionNodeUpdater({ index: 1 });
		if (updater) {
			updater.delete();
			expect(element['path'].length).toBe(2);
		}
	});

	it('should handle drag correctly', () => {
		const element = new TestPathElement(manager, true);
		element['path'] = [
			[0, 0],
			[10, 10]
		];
		const mockEvent = {
			lngLat: { lng: 5, lat: 5 },
			preventDefault: vi.fn()
		} as unknown as maplibregl.MapMouseEvent;

		const mockMoveEvent = {
			lngLat: { lng: 15, lat: 15 },
			preventDefault: vi.fn()
		} as unknown as maplibregl.MapMouseEvent;

		element.handleDrag(mockEvent);

		expect(mockManager.map.on).toHaveBeenCalledWith('mousemove', expect.any(Function));
		expect(mockManager.map.once).toHaveBeenCalledWith('mouseup', expect.any(Function));
		expect(mockEvent.preventDefault).toHaveBeenCalled();

		const moveHandler = mockManager.map.on.mock.calls[0][1];
		moveHandler(mockMoveEvent);

		expect(element['path']).toEqual([
			[10, 10.115029793656424],
			[20, 19.812100256379562]
		]);
		expect(mockMoveEvent.preventDefault).toHaveBeenCalled();
	});
});
