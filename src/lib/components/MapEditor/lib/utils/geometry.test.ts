import { describe, it, expect } from 'vitest';
import { circle, distance, flatten, getMiddlePoint, lat2mercator, mercator2lat } from './geometry.js';
import type { GeoPoint } from './types.js';
import { degreesToRadians, radiansToDegrees } from './geometry.js';
import type { Feature } from 'maplibre-gl';

describe('Geometry Utils', () => {
	it('should convert latitude to Mercator projection correctly', () => {
		expect(lat2mercator(0)).toBeCloseTo(0); // Equator should map to 0
		expect(lat2mercator(85.051128)).toBeCloseTo(Math.PI);
		expect(lat2mercator(-85.051128)).toBeCloseTo(-Math.PI);
	});

	it('should convert Mercator projection back to latitude correctly', () => {
		expect(mercator2lat(0)).toBeCloseTo(0);
		expect(mercator2lat(lat2mercator(45))).toBeCloseTo(45, 5);
		expect(mercator2lat(lat2mercator(-30))).toBeCloseTo(-30, 5);
	});

	it('should get the middle point correctly', () => {
		const p0: GeoPoint = [0, 0];
		const p1: GeoPoint = [10, 10];
		const middle = getMiddlePoint(p0, p1);

		expect(middle[0]).toBeCloseTo(5);
		expect(middle[1]).toBeCloseTo(mercator2lat((lat2mercator(0) + lat2mercator(10)) / 2));
	});

	it('should calculate distance between two points correctly', () => {
		const berlin: GeoPoint = [13.405, 52.52];
		const paris: GeoPoint = [2.3522, 48.8566];
		const d = distance(berlin, paris);
		expect(d).toBeCloseTo(877464.54);
	});

	it('should convert degrees to radians and back', () => {
		expect(degreesToRadians(180)).toBeCloseTo(Math.PI);
		expect(degreesToRadians(90)).toBeCloseTo(Math.PI / 2);
		expect(radiansToDegrees(Math.PI)).toBeCloseTo(180);
		expect(radiansToDegrees(Math.PI / 2)).toBeCloseTo(90);
	});

	it('should generate a circle with correct number of steps', () => {
		const center: GeoPoint = [0, 0];
		const radius = 1000; // meters
		const steps = 36;
		const points = circle(center, radius, steps);
		expect(points.length).toBe(steps);
		points.forEach((pt) => {
			expect(Array.isArray(pt)).toBe(true);
			expect(pt.length).toBe(2);
		});
	});

	it('should flatten simple and complex GeoJSON features', () => {
		const point = (n: number): GeoPoint => [n, n + 1];
		const path = (n: number): [GeoPoint, GeoPoint] => [
			[n, n + 1],
			[n + 2, n + 3]
		];

		function feature<T extends GeoJSON.Geometry>(type: T['type'], index: number, name?: string): GeoJSON.Feature<T> {
			let coordinates;
			switch (type) {
				case 'Point':
					coordinates = point(index);
					name ??= 'point';
					break;
				case 'LineString':
					coordinates = path(index);
					name ??= 'linestring';
					break;
				case 'Polygon':
					coordinates = [path(index), path(index + 1000)];
					name ??= 'polygon';
					break;
				case 'MultiPoint':
					coordinates = [point(index), point(index + 1000)];
					name ??= 'point';
					break;
				case 'MultiLineString':
					coordinates = [path(index), path(index + 1000)];
					name ??= 'linestring';
					break;
				case 'MultiPolygon':
					coordinates = [
						[path(index), path(index + 1000)],
						[path(index + 2000), path(index + 3000)]
					];
					name ??= 'polygon';
					break;
			}
			return {
				type: 'Feature',
				properties: { name },
				geometry: { type, coordinates }
			} as unknown as GeoJSON.Feature<T>;
		}

		const features: GeoJSON.Feature[] = [
			feature('Point', 1),
			feature('MultiPoint', 2),
			{
				type: 'Feature',
				properties: { name: 'geometrycollection' },
				geometry: {
					type: 'GeometryCollection',
					geometries: [
						{ type: 'Point', coordinates: point(3) },
						{ type: 'LineString', coordinates: path(4) }
					]
				}
			},
			feature('MultiLineString', 5),
			feature('MultiPolygon', 6),
			feature('Polygon', 7),
			feature('LineString', 8)
		];
		const flat = flatten(features);
		expect(flat).toStrictEqual([
			feature('Point', 1),
			feature('Point', 2),
			feature('Point', 1002),
			feature('Point', 3, 'geometrycollection'),
			feature('LineString', 4, 'geometrycollection'),
			feature('LineString', 5),
			feature('LineString', 1005),
			feature('Polygon', 6),
			feature('Polygon', 2006),
			feature('Polygon', 7),
			feature('LineString', 8)
		]);
	});

	it('should throw on unknown geometry type in flatten', () => {
		const badFeature: GeoJSON.Feature = {
			type: 'Feature',
			properties: {},
			geometry: { type: 'UnknownType', coordinates: [] } as any
		};
		expect(() => flatten([badFeature])).toThrow(/Unknown geometry type/);
	});
});
