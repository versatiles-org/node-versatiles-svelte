import type { GeoPath, GeoPoint } from './types.js';

export const EARTH_RADIUS = 6371008.8; // Radius of the Earth in meters

export function getMiddlePoint(p0: GeoPoint, p1: GeoPoint): GeoPoint {
	const y0 = lat2mercator(p0[1]);
	const y1 = lat2mercator(p1[1]);
	return [(p0[0] + p1[0]) / 2, mercator2lat((y0 + y1) / 2)];
}

export function lat2mercator(lat: number): number {
	return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
}

export function mercator2lat(y: number): number {
	return ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
}

export function distance(point1: GeoPoint, point2: GeoPoint): number {
	const lat1 = degreesToRadians(point1[1]);
	const lat2 = degreesToRadians(point2[1]);
	const deltaLat = degreesToRadians(point2[1] - point1[1]);
	const deltaLng = degreesToRadians(point2[0] - point1[0]);

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS * c; // Distance in meters
}

export function degreesToRadians(degrees: number): number {
	return ((degrees % 360) * Math.PI) / 180;
}

export function radiansToDegrees(radians: number): number {
	return ((radians / Math.PI) % 2) * 180;
}

export function circle(center: GeoPoint, radius: number, steps: number): GeoPath {
	const radians = radius / EARTH_RADIUS;
	const lng1 = degreesToRadians(center[0]);
	const lat1 = degreesToRadians(center[1]);

	const result: GeoPath = [];
	for (let i = 0; i < steps; i++) {
		const bearingRad = degreesToRadians((i * 360) / steps);
		const lat2 = Math.asin(
			Math.sin(lat1) * Math.cos(radians) + Math.cos(lat1) * Math.sin(radians) * Math.cos(bearingRad)
		);
		const lng2 =
			lng1 +
			Math.atan2(
				Math.sin(bearingRad) * Math.sin(radians) * Math.cos(lat1),
				Math.cos(radians) - Math.sin(lat1) * Math.sin(lat2)
			);
		result.push([radiansToDegrees(lng2), radiansToDegrees(lat2)]);
	}
	return result;
}
