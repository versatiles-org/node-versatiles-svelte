import type { ElementPoint } from './element/types.js';

export function getMiddlePoint(p0: ElementPoint, p1: ElementPoint): ElementPoint {
	const y0 = lat2mercator(p0[1]);
	const y1 = lat2mercator(p1[1]);
	return [(p0[0] + p1[0]) / 2, mercator2lat((y0 + y1) / 2)];
}

function lat2mercator(lat: number): number {
	return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
}

function mercator2lat(y: number): number {
	return ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
}
