import { describe, expect, it, beforeEach, vi } from 'vitest';
import type { Feature } from 'geojson';
import { AbstractElement } from './abstract.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';

class TestElement extends AbstractElement {
	constructor(manager: GeometryManager) {
		super(manager);
	}

	destroy(): void {
		// Mock destroy behavior
	}

	getFeature(): Feature {
		return { type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] }, properties: {} };
	}

	getSelectionNodes() {
		return [];
	}

	getSelectionNodeUpdater() {
		return undefined;
	}

	getState() {
		return {};
	}
}

describe('AbstractElement', () => {
	let mockManager: GeometryManager;

	beforeEach(() => {
		mockManager = new MockGeometryManager() as unknown as GeometryManager;
	});

	it('should initialize and create a GeoJSON source', () => {
		const element = new TestElement(mockManager);
		expect(mockManager.map.addSource).toHaveBeenCalledWith(
			expect.stringContaining('source_'),
			expect.objectContaining({ type: 'geojson' })
		);
		expect(element).toBeDefined();
	});

	it('should generate random positions', () => {
		const element = new TestElement(mockManager);
		const points = element['randomPositions'](3);
		expect(points).toHaveLength(3);
		expect(points[0]).toHaveLength(2);
	});

	it('should call destroy and delete itself', () => {
		const element = new TestElement(mockManager);
		vi.spyOn(element, 'destroy');
		vi.spyOn(mockManager, 'deleteElement');

		element.delete();

		expect(element.destroy).toHaveBeenCalled();
		expect(mockManager.deleteElement).toHaveBeenCalledWith(element);
	});
});
