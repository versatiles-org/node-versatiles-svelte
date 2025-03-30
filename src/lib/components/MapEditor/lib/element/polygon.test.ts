import { describe, expect, it, beforeEach, vi } from 'vitest';
import { PolygonElement } from './polygon.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateElementPolygon } from '../state/types.js';
import type { ElementPath } from './types.js';
import { get } from 'svelte/store';

describe('PolygonElement', () => {
	let mockManager: GeometryManager;
	let element: PolygonElement;

	beforeEach(() => {
		mockManager = new MockGeometryManager() as unknown as GeometryManager;
		element = new PolygonElement(mockManager);
	});

	it('should initialize with a default polygon', () => {
		expect(element).toBeDefined();
		expect(element.path.length).toBe(3);
	});

	it('should initialize with a provided polygon', () => {
		const customPolygon: ElementPath = [
			[0, 0],
			[10, 10],
			[20, 20],
			[30, 30]
		];
		element = new PolygonElement(mockManager, customPolygon);
		expect(element.path).toEqual(customPolygon);
	});

	it('should set isSelected correctly', () => {
		element.select(true);
		expect(element.fillLayer.isSelected).toBe(true);
		expect(element.strokeLayer.isSelected).toBe(true);
	});

	it('should generate a valid GeoJSON feature', () => {
		const feature = element.getFeature();
		expect(feature.type).toBe('Feature');
		expect(feature.geometry.type).toBe('Polygon');
		expect(feature.geometry.coordinates[0]).toEqual([...element.path, element.path[0]]);
	});

	it('should call destroy correctly', () => {
		vi.spyOn(element.fillLayer, 'destroy');
		vi.spyOn(element.strokeLayer, 'destroy');
		vi.spyOn(mockManager.map, 'removeSource');

		element.destroy();

		expect(element.fillLayer.destroy).toHaveBeenCalled();
		expect(element.strokeLayer.destroy).toHaveBeenCalled();
		expect(mockManager.map.removeSource).toHaveBeenCalledWith(element.sourceId);
	});

	it('should return correct state object', () => {
		const state = element.getState();
		expect(state.type).toBe('polygon');
		expect(state.points).toEqual(element.path);
		expect(state.style).toEqual(element.fillLayer.getState());
		expect(state.strokeStyle).toEqual(element.strokeLayer.getState());
	});

	it('should restore from state correctly', () => {
		const state: StateElementPolygon = {
			type: 'polygon',
			points: [
				[0, 0],
				[10, 10],
				[20, 20]
			],
			style: { color: '#00ff00' },
			strokeStyle: { width: 2 }
		};
		const restoredElement = PolygonElement.fromState(mockManager, state);

		expect(restoredElement.path).toEqual(state.points);
		expect(get(restoredElement.fillLayer.color)).toBe('#00ff00');
		expect(get(restoredElement.strokeLayer.width)).toBe(2);
	});

	it('should restore from GeoJSON correctly', () => {
		const feature0: GeoJSON.Feature<GeoJSON.Polygon> = {
			type: 'Feature',
			properties: {
				'stroke-color': '#111111',
				'stroke-style': 'dashed',
				'stroke-width': 3,
				'stroke-visibility': true,
				'fill-color': '#222222',
				'fill-opacity': 0.3,
				'fill-pattern': 'diagonal'
			},
			geometry: {
				type: 'Polygon',
				coordinates: [
					[
						[0, 0],
						[10, 10],
						[20, 20],
						[0, 0]
					]
				]
			}
		};
		const restoredElement = PolygonElement.fromGeoJSON(mockManager, feature0);
		const feature1 = restoredElement.getFeature(true);

		expect(feature0).toStrictEqual(feature1);
	});
});
