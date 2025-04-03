import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GeometryManager, type ExtendedGeoJSON } from './geometry_manager.js';
import { MarkerElement } from './element/marker.js';
import { LineElement } from './element/line.js';
import { PolygonElement } from './element/polygon.js';
import { LngLat, MockMap, type MaplibreMap } from '../../../__mocks__/map.js';
import { get } from 'svelte/store';

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
		manager.removeElement(element);
		expect(manager.selectElement).toHaveBeenCalledWith(undefined);
	});

	describe('state', () => {
		it('should return correct state', async () => {
			expect(manager.getState()).toStrictEqual({
				elements: [],
				map: { center: [0, 0], zoom: 10 }
			});
			expect(manager.state.getHash()).toBe('KgAAAAAAA');

			const marker = manager.addNewMarker();
			marker.point = [12, 34];
			marker.layer.label.set('Test');
			expect(manager.getState()).toStrictEqual({
				elements: [
					{
						point: [12, 34],
						style: { label: 'Test' },
						type: 'marker'
					}
				],
				map: { center: [0, 0], zoom: 10 }
			});
			expect(manager.state.getHash()).toBe('KgAAAAAAAQMAAAiAADJHARwgA');
		});

		it('should restore from state correctly', async () => {
			manager.state.setHash('KgAAAAAAAQMAAAiAADJHARwgA');
			const elements = get(manager.elements);
			expect(elements.length).toBe(1);
			expect(elements[0].getState()).toStrictEqual({
				point: [12, 34],
				style: { label: 'Test' },
				type: 'marker'
			});
		});
	});

	describe('JSON', () => {
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

		it('should add GeoJSON with map properties', () => {
			const geojson: ExtendedGeoJSON = {
				type: 'FeatureCollection',
				map: {
					center: [10, 20],
					zoom: 5
				},
				features: []
			};

			manager.addGeoJSON(geojson);

			expect(mockMap.setCenter).toHaveBeenCalledWith({ lng: 10, lat: 20 });
			expect(mockMap.setZoom).toHaveBeenCalledWith(5);
		});

		it('should add GeoJSON with Point feature', () => {
			const geojson: ExtendedGeoJSON = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [10, 20] },
						properties: {}
					}
				]
			};

			const spy = vi
				.spyOn(MarkerElement, 'fromGeoJSON')
				.mockReturnValue(new MarkerElement(manager));

			manager.addGeoJSON(geojson);

			expect(spy).toHaveBeenCalled();
			expect(manager.elements).toBeDefined();
		});

		it('should add GeoJSON with LineString feature', () => {
			const geojson: ExtendedGeoJSON = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'LineString',
							coordinates: [
								[10, 20],
								[30, 40]
							]
						},
						properties: {}
					}
				]
			};

			const spy = vi.spyOn(LineElement, 'fromGeoJSON').mockReturnValue(new LineElement(manager));

			manager.addGeoJSON(geojson);

			expect(spy).toHaveBeenCalled();
			expect(manager.elements).toBeDefined();
		});

		it('should add GeoJSON with Polygon feature', () => {
			const geojson: ExtendedGeoJSON = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: {
							type: 'Polygon',
							coordinates: [
								[
									[10, 20],
									[30, 40],
									[50, 60],
									[10, 20]
								]
							]
						},
						properties: {}
					}
				]
			};

			const spy = vi
				.spyOn(PolygonElement, 'fromGeoJSON')
				.mockReturnValue(new PolygonElement(manager));

			manager.addGeoJSON(geojson);

			expect(spy).toHaveBeenCalled();
			expect(manager.elements).toBeDefined();
		});

		it('should throw an error for unknown geometry type', () => {
			const geojson = {
				type: 'FeatureCollection',
				features: [
					{
						type: 'Feature',
						geometry: { type: 'Unknown', coordinates: [] },
						properties: {}
					}
				]
			} as unknown as ExtendedGeoJSON;

			expect(() => manager.addGeoJSON(geojson)).toThrow('Unknown geometry type "Unknown"');
		});
	});
});
