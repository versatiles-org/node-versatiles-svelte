import { describe, expect, it, beforeEach, vi } from 'vitest';
import { CircleElement } from './circle.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateElementCircle } from '../state/types.js';
import type { GeoPoint } from '../utils/types.js';
import type { Point } from 'geojson';

describe('CircleElement', () => {
	let manager: GeometryManager;
	let circleElement: CircleElement;

	beforeEach(() => {
		manager = new MockGeometryManager() as unknown as GeometryManager;
		circleElement = new CircleElement(manager, [10, 20], 300000);
		circleElement.fillLayer.color.set('#00ff00');
		circleElement.strokeLayer.color.set('#0000ff');
	});

	it('should initialize with given point and radius', () => {
		expect(circleElement.point).toEqual([10, 20]);
		expect(circleElement.radius).toBe(300000);
	});

	it('should generate selection nodes', () => {
		const nodes = circleElement.getSelectionNodes();
		expect(nodes).toHaveLength(5); // 1 center + 4 around the circle
		expect(nodes[0].coordinates).toEqual([10, 20]);
	});

	describe('getSelectionNodeUpdater', () => {
		it('should update point when selection node updater is used for center', () => {
			const updater = circleElement.getSelectionNodeUpdater({ index: 0 });
			expect(updater).toBeDefined();

			updater?.update(15, 25);
			expect(circleElement.point).toEqual([15, 25]);
			expect(circleElement.radius).toBe(300000);
		});

		it('should update radius when selection node updater is used for edge', () => {
			expect(circleElement.radius).toBe(300000);
			expect(circleElement.getSelectionNodes()[1].coordinates).toStrictEqual([10, expect.closeTo(22.7)]);

			const updater = circleElement.getSelectionNodeUpdater({ index: 1 });
			expect(updater).toBeDefined();

			updater?.update(15, 20);
			expect(Math.round(circleElement.radius)).toBe(522427);
		});
	});

	describe('GeoJSON', () => {
		it('should return GeoJSON feature with properties', () => {
			const feature = circleElement.getFeature(true);
			expect(feature.type).toBe('Feature');
			expect(feature.geometry.type).toBe('Polygon');
			expect(feature.properties).toHaveProperty('circle-center-x', 10);
			expect(feature.properties).toHaveProperty('circle-center-y', 20);
			expect(feature.properties).toHaveProperty('circle-radius', 300000);
		});

		it('should return GeoJSON representation', () => {
			const geoJSON = circleElement.getGeoJSON();
			expect(geoJSON.type).toBe('Feature');
			expect(geoJSON.geometry.type).toBe('Point');
			expect(geoJSON.geometry.coordinates).toEqual([10, 20]);
			expect(geoJSON.properties).toHaveProperty('radius', 300000);
		});
	});

	it('should destroy layers and source on destroy', () => {
		const fillLayerDestroySpy = vi.spyOn(circleElement.fillLayer, 'destroy');
		const strokeLayerDestroySpy = vi.spyOn(circleElement.strokeLayer, 'destroy');
		const mapRemoveSourceSpy = vi.spyOn(manager.map, 'removeSource');

		circleElement.destroy();

		expect(fillLayerDestroySpy).toHaveBeenCalled();
		expect(strokeLayerDestroySpy).toHaveBeenCalled();
		expect(mapRemoveSourceSpy).toHaveBeenCalledWith(circleElement.sourceId);
	});

	it('should return state representation', () => {
		const state = circleElement.getState();
		expect(state.type).toStrictEqual('circle');
		expect(state.point).toStrictEqual([10, 20]);
		expect(state.radius).toStrictEqual(300000);
		expect(state.style).toStrictEqual({ color: '#00ff00' });
		expect(state.strokeStyle).toStrictEqual({ color: '#0000ff' });
	});

	it('should create CircleElement from state', () => {
		const state: StateElementCircle = {
			type: 'circle',
			point: [30, 40] as GeoPoint,
			radius: 10,
			style: {},
			strokeStyle: {}
		};
		const element = CircleElement.fromState(manager, state);
		expect(element.point).toEqual([30, 40]);
		expect(element.radius).toBe(10);
	});

	it('should create CircleElement from GeoJSON', () => {
		const feature: GeoJSON.Feature<Point, { radius: number }> = {
			type: 'Feature',
			properties: { radius: 15 },
			geometry: { type: 'Point', coordinates: [50, 60] }
		};
		const element = CircleElement.fromGeoJSON(manager, feature);
		expect(element.point).toEqual([50, 60]);
		expect(element.radius).toBe(15);
	});
});
