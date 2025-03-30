import { describe, expect, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { MapLayerLine } from './line.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';

describe('MapLayerLine', () => {
	let mockManager: MockGeometryManager;
	let layer: MapLayerLine;

	beforeEach(() => {
		mockManager = new MockGeometryManager();
		layer = new MapLayerLine(mockManager as unknown as GeometryManager, 'test-layer', 'source');
	});

	it('should initialize layer with default values', () => {
		expect(layer).toBeDefined();
		expect(get(layer.color)).toBe('#ff0000');
		expect(get(layer.dashed)).toBe(0);
		expect(get(layer.visible)).toBe(true);
		expect(get(layer.width)).toBe(2);
	});

	it('should add a line layer on initialization', () => {
		expect(mockManager.map.addLayer).toHaveBeenCalledWith(
			{
				id: 'test-layer',
				source: 'source',
				type: 'line',
				layout: {
					'line-cap': 'round',
					'line-join': 'round',
					visibility: 'visible'
				},
				paint: {
					'line-color': 'rgb(255,0,0)',
					'line-dasharray': [100],
					'line-width': 2
				}
			},
			'selection_nodes'
		);
	});

	it('should update line color correctly', () => {
		layer.color.set('#00ff00');
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith(
			'test-layer',
			'line-color',
			'rgb(0,255,0)'
		);
	});

	it('should update line width correctly', () => {
		layer.width.set(4);
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith('test-layer', 'line-width', 4);
	});

	it('should update line visibility correctly', () => {
		layer.visible.set(false);
		expect(mockManager.map.setLayoutProperty).toHaveBeenCalledWith(
			'test-layer',
			'visibility',
			'none'
		);
	});

	it('should update line dash pattern correctly', () => {
		layer.dashed.set(1);
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith(
			'test-layer',
			'line-dasharray',
			[2, 4]
		);
	});

	it('should return correct state object', () => {
		layer.color.set('#00ff00');
		layer.dashed.set(1);
		layer.visible.set(false);
		layer.width.set(4);

		expect(layer.getState()).toEqual({ color: '#00ff00', pattern: 1, visible: false, width: 4 });
	});

	it('should restore state correctly', () => {
		layer.setState({ color: '#0000ff', pattern: 2, width: 3 });

		expect(get(layer.color)).toBe('#0000ff');
		expect(get(layer.dashed)).toBe(2);
		expect(get(layer.width)).toBe(3);
	});
});
