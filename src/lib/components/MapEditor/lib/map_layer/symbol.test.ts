import { describe, expect, it, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { MapLayerSymbol } from './symbol.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';

describe('MapLayerSymbol', () => {
	let mockManager: MockGeometryManager;
	let layer: MapLayerSymbol;

	beforeEach(() => {
		mockManager = new MockGeometryManager();
		layer = new MapLayerSymbol(mockManager as unknown as GeometryManager, 'test-layer', 'source');
	});

	it('should initialize layer with default values', () => {
		expect(layer).toBeDefined();
		expect(get(layer.color)).toBe('#ff0000');
		expect(get(layer.rotate)).toBe(0);
		expect(get(layer.size)).toBe(1);
		expect(get(layer.halo)).toBe(1);
		expect(get(layer.symbolIndex)).toBe(38);
		expect(get(layer.label)).toBe('');
	});

	it('should add a symbol layer on initialization', () => {
		expect(mockManager.map.addLayer).toHaveBeenCalledWith(
			{
				id: 'test-layer',
				layout: {
					'icon-allow-overlap': true,
					'icon-image': 'basics:icon-embassy',
					'icon-offset': [0, 0],
					'icon-rotate': 0,
					'icon-size': 1,
					'text-field': '',
					'text-font': ['noto_sans_regular'],
					'text-justify': 'left',
					'text-overlap': 'always',
					'text-radial-offset': 0.7,
					'text-size': 16,
					'text-variable-anchor': ['left', 'right', 'top', 'bottom']
				},
				paint: {
					'icon-color': 'rgb(255,0,0)',
					'icon-halo-blur': 0,
					'icon-halo-color': '#FFFFFF',
					'icon-halo-width': 1,
					'icon-opacity': 1,
					'text-halo-blur': 0,
					'text-halo-color': '#FFFFFF',
					'text-halo-width': 1
				},
				source: 'source',
				type: 'symbol'
			},
			'selection_nodes'
		);
	});

	it('should update symbol color correctly', () => {
		layer.color.set('#00ff00');
		expect(mockManager.map.setPaintProperty).toHaveBeenCalledWith(
			'test-layer',
			'icon-color',
			'rgb(0,255,0)'
		);
	});

	it('should update symbol size correctly', () => {
		layer.size.set(2);
		expect(mockManager.map.setLayoutProperty).toHaveBeenCalledWith('test-layer', 'icon-size', 2);
		expect(mockManager.map.setLayoutProperty).toHaveBeenCalledWith('test-layer', 'text-size', 32);
	});

	it('should update symbol index correctly', () => {
		layer.symbolIndex.set(1);
		expect(mockManager.map.setLayoutProperty).toHaveBeenCalledWith(
			'test-layer',
			'icon-image',
			'basics:icon-airfield'
		);
	});

	it('should return correct state object', () => {
		layer.color.set('#00ff00');
		layer.rotate.set(45);
		layer.size.set(2);
		layer.halo.set(3);
		layer.symbolIndex.set(1);
		layer.label.set('Test Label');
		layer.labelAlign.set(2);

		expect(layer.getState()).toEqual({
			color: '#00ff00',
			rotate: 45,
			size: 2,
			halo: 3,
			pattern: 1,
			label: 'Test Label',
			align: 2
		});
	});

	it('should restore state correctly', () => {
		layer.setState({
			color: '#0000ff',
			rotate: 90,
			size: 3,
			halo: 2,
			pattern: 5,
			label: 'New Label',
			align: 2
		});

		expect(get(layer.color)).toBe('#0000ff');
		expect(get(layer.rotate)).toBe(90);
		expect(get(layer.size)).toBe(3);
		expect(get(layer.halo)).toBe(2);
		expect(get(layer.symbolIndex)).toBe(5);
		expect(get(layer.label)).toBe('New Label');
		expect(get(layer.labelAlign)).toBe(2);
	});
});
