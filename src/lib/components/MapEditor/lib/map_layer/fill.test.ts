import { describe, expect, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { MapLayerFill } from './fill.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';

describe('MapLayerFill', () => {
	let mockManager: MockGeometryManager;
	let layer: MapLayerFill;

	beforeEach(() => {
		mockManager = new MockGeometryManager();
		layer = new MapLayerFill(mockManager as unknown as GeometryManager, 'test-layer', 'source');
	});

	it('should have the correct keys in default style', () => {
		const keys = Object.keys(MapLayerFill.defaultStyle).sort();
		expect(keys).toStrictEqual(['color', 'opacity', 'pattern']);
	});

	it('should initialize layer with default values', () => {
		expect(layer).toBeDefined();
		expect(get(layer.color)).toBe('#ff0000');
		expect(get(layer.opacity)).toBe(1);
		expect(get(layer.pattern)).toBe(0);
	});

	it('should add a fill layer on initialization', () => {
		expect(mockManager.map.addLayer).toHaveBeenCalledWith(
			expect.objectContaining({
				id: 'test-layer',
				source: 'source',
				type: 'fill',
				layout: {},
				paint: {
					'fill-color': 'rgb(255,0,0)',
					'fill-opacity': 1
				}
			}),
			'selection_nodes'
		);
	});

	it('should update fill color correctly', () => {
		layer.color.set('#00ff00');
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith('test-layer', 'fill-color', 'rgb(0,255,0)');
	});

	it('should update opacity correctly', () => {
		layer.opacity.set(0.5);
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith('test-layer', 'fill-opacity', 0.5);
	});

	it('should update fill pattern correctly', () => {
		layer.pattern.set(1);
	});

	it('should remove and add new fill pattern image when pattern changes', () => {
		mockManager.map.hasImage.mockReturnValue(true);
		layer.pattern.set(1);

		expect(mockManager.map.removeImage).toHaveBeenCalledWith('fill-pattern-test-layer');
		expect(mockManager.map.addImage).toHaveBeenCalled();
	});

	it('should return correct state object', () => {
		layer.color.set('#00ff00');
		layer.opacity.set(0.5);
		layer.pattern.set(1);

		expect(layer.getState()).toEqual({ color: '#00ff00', opacity: 0.5, pattern: 1 });
	});

	it('should restore state correctly', () => {
		layer.setState({ color: '#0000ff', opacity: 0.8, pattern: 2 });

		expect(get(layer.color)).toBe('#0000ff');
		expect(get(layer.opacity)).toBe(0.8);
		expect(get(layer.pattern)).toBe(2);
	});
});
