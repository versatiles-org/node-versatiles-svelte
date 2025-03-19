import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GeometryManager } from './geometry_manager.js';
import { MarkerElement } from './element/marker.js';
import { LineElement } from './element/line.js';
import { PolygonElement } from './element/polygon.js';
import type { StateObject } from './state/types.js';
import { LngLat, MockMap, type MaplibreMap } from '../../../__mocks__/map.js';
import { StateWriter } from './state/writer.js';

describe('GeometryManager', () => {
	let mockMap: MockMap;
	let manager: GeometryManager;

	beforeEach(() => {
		mockMap = new MockMap();
		manager = new GeometryManager(mockMap as unknown as MaplibreMap);
	});

	it('should initialize correctly', () => {
		expect(manager).toBeDefined();
		expect(mockMap.addSource).toHaveBeenCalled();
		expect(mockMap.addLayer).toHaveBeenCalled();
	});

	it('should add a new marker', () => {
		const element = manager.addNewMarker();
		expect(element).toBeInstanceOf(MarkerElement);
		expect(manager.elements).toBeDefined();
	});

	it('should add a new line', () => {
		const element = manager.addNewLine();
		expect(element).toBeInstanceOf(LineElement);
		expect(manager.elements).toBeDefined();
	});

	it('should add a new polygon', () => {
		const element = manager.addNewPolygon();
		expect(element).toBeInstanceOf(PolygonElement);
		expect(manager.elements).toBeDefined();
	});

	it('should delete an element', () => {
		const element = manager.addNewMarker();
		manager.selectElement(element);
		vi.spyOn(manager, 'selectElement');
		manager.deleteElement(element);
		expect(manager.selectElement).toHaveBeenCalledWith(undefined);
	});

	it('should return correct state', () => {
		const state = manager.getState();
		expect(state.map).toBeDefined();
		expect(state.elements).toBeDefined();
	});

	it('should restore from state correctly', async () => {
		const state: StateObject = {
			map: { point: [0, 0], zoom: 10 },
			elements: [{ type: 'marker', point: [10, 20], style: { color: '#00ff00' } }]
		};
		const writer = new StateWriter();
		writer.writeObject(state);
		const hash = await writer.getBase64compressed();
		vi.spyOn(manager, 'loadState');
		await manager.loadState(hash);
		expect(manager.loadState).toHaveBeenCalled();
	});

	describe('JSON', () => {
		it('should return correct state', () => {
			const state = manager.getState();
			expect(state.map).toBeDefined();
			expect(state.elements).toBeDefined();
		});

		it('should restore from state correctly', async () => {
			const state: StateObject = {
				map: { point: [0, 0], zoom: 10 },
				elements: [{ type: 'marker', point: [10, 20], style: { color: '#00ff00' } }]
			};
			const writer = new StateWriter();
			writer.writeObject(state);
			const hash = await writer.getBase64compressed();
			vi.spyOn(manager, 'loadState');
			await manager.loadState(hash);
			expect(manager.loadState).toHaveBeenCalled();
		});

		it('should return correct GeoJSON', () => {
			const center = new LngLat(10, 20);
			vi.spyOn(mockMap, 'getCenter').mockReturnValue(center);
			vi.spyOn(mockMap, 'getZoom').mockReturnValue(5);

			const marker = manager.addNewMarker();
			vi.spyOn(marker, 'getFeature').mockReturnValue({
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [10, 20] },
				properties: {}
			});

			const geojson = manager.getGeoJSON();
			expect(geojson).toEqual({
				type: 'FeatureCollection',
				map: {
					center: [center.lng, center.lat],
					zoom: 5
				},
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [10, 20] },
						properties: {}
					}
				]
			});
		});
	});
});
