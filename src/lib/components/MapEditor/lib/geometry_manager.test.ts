import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GeometryManager, type ExtendedGeoJSON } from './geometry_manager.js';
import { MarkerElement } from './element/marker.js';
import { LineElement } from './element/line.js';
import { PolygonElement } from './element/polygon.js';
import { LngLat, MockMap, type MaplibreMap } from '../../../__mocks__/map.js';
import { get } from 'svelte/store';
import type { ElementPath, ElementPoint } from './element/types.js';

describe('GeometryManager', () => {
	let mockMap: MockMap;
	let manager: GeometryManager;

	beforeEach(() => {
		mockMap = new MockMap();
		manager = new GeometryManager(mockMap as unknown as MaplibreMap, true);
	});

	it('should initialize correctly', () => {
		expect(manager).toBeDefined();
		expect(mockMap.getCanvasContainer).toHaveBeenCalled();
		expect(mockMap.setStyle).toHaveBeenCalled();
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
		it('should create and restore empty map', async () => {
			expect(manager.getState()).toStrictEqual({
				elements: [],
				map: { center: [1, 2], radius: 312696.8037113758 }
			});
			expect(manager.state.getHash()).toBe('G2haCUQg');

			manager.map.setCenter({ lng: 12, lat: 34 });
			manager.map.setZoom(5);

			expect(manager.getState()).toStrictEqual({
				elements: [],
				map: { center: [12, 34], radius: 215179.62743964553 }
			});

			const hash = manager.state.getHash();
			expect(hash).toBe('GxYdVMa_A');

			manager.state.setHash(hash);
			expect(get(manager.elements).length).toBe(0);
			const center = manager.map.getCenter();
			expect(center).toStrictEqual({ lng: 12, lat: 34 });
			expect(manager.map.getZoom()).toStrictEqual(5);
		});
	});

	describe('elements', () => {
		it('should create and restore marker', async () => {
			const element = {
				point: [12, 34] as ElementPoint,
				style: { label: 'Test' },
				type: 'marker'
			};

			const marker = manager.addNewMarker();
			marker.point = element.point;
			marker.layer.label.set(element.style.label);

			expect(manager.getState().elements).toStrictEqual([element]);

			const hash = manager.state.getHash();
			expect(hash).toBe('G2haCUQgg4npiA0wvmZI4COEA');

			manager.state.setHash(hash);
			const elements = get(manager.elements);
			expect(elements.length).toBe(1);
			expect(elements[0].getState()).toStrictEqual(element);
		});

		it('should create and restore line', async () => {
			const element = {
				points: [
					[1, 2],
					[3, 4]
				] as ElementPath,
				style: { color: '#ABCDEF' },
				type: 'line'
			};

			const line = manager.addNewLine();
			line.path = element.points;
			line.layer.color.set(element.style.color);

			expect(manager.getState().elements).toStrictEqual([element]);

			const hash = manager.state.getHash();
			expect(hash).toBe('G2haCUQhCAqjmA0msA0msA0msYq83vA');

			manager.state.setHash(hash);
			const elements = get(manager.elements);
			expect(elements.length).toBe(1);
			expect(elements[0].getState()).toStrictEqual(element);
		});

		it('should create and restore polygon', async () => {
			const element = {
				points: [
					[1, 2],
					[3, 4]
				] as ElementPath,
				style: { color: '#ABCDEF' },
				strokeStyle: { color: '#123456' },
				type: 'polygon'
			};

			const polygon = manager.addNewPolygon();
			polygon.path = element.points;
			polygon.fillLayer.color.set(element.style.color);
			polygon.strokeLayer.color.set(element.strokeStyle.color);

			expect(manager.getState().elements).toStrictEqual([element]);

			const hash = manager.state.getHash();
			expect(hash).toBe('G2haCUQhiAqjmA0msA0msA0msYq83vBgSNFYA');

			manager.state.setHash(hash);
			const elements = get(manager.elements);
			expect(elements.length).toBe(1);
			expect(elements[0].getState()).toStrictEqual(element);
		});
	});

	describe('GeoJSON', () => {
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

			const spy = vi.spyOn(MarkerElement, 'fromGeoJSON').mockReturnValue(new MarkerElement(manager));

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

			const spy = vi.spyOn(PolygonElement, 'fromGeoJSON').mockReturnValue(new PolygonElement(manager));

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
