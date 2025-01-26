import type { BBox, Feature, MultiPolygon, Polygon } from 'geojson';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';
import * as turf from '@turf/turf';
import { bboxOverlap } from './bboxes.js';

export class GuessPopulation {
	private popBuffer: Buffer;
	constructor() {
		this.popBuffer = brotliDecompressSync(
			readFileSync(resolve(import.meta.dirname, 'population.raw.br'))
		);
	}

	guess(feature: Feature<Polygon | MultiPolygon>): number {
		const popBuffer = this.popBuffer;
		let sum = 0;

		// Flatten the geometry and estimate population for each part
		turf.flattenEach(feature, (f) => {
			const bbox = turf.bbox(f);
			if (bbox[2] < bbox[0] || bbox[3] < bbox[1]) return;

			sum += rec(f, bbox, 0, 0, 4320, 4320);
			sum += rec(f, bbox, 4320, 0, 8640, 4320);
		});

		return sum;

		/**
		 * Recursively estimates the population for a bounding box.
		 * @param feature - The feature to process.
		 * @param bboxF - The bounding box of the feature.
		 * @param x0 - The starting x-coordinate.
		 * @param y0 - The starting y-coordinate.
		 * @param x1 - The ending x-coordinate.
		 * @param y1 - The ending y-coordinate.
		 * @returns The estimated population within the given bounding box.
		 */
		function rec(
			feature: Feature<Polygon | MultiPolygon>,
			bboxF: BBox,
			x0: number,
			y0: number,
			x1: number,
			y1: number
		): number {
			if (!feature) return 0;
			if (x0 >= x1 || y0 >= y1) return 0;

			// Calculate the bounding box for this subdivision
			const bbox: BBox = [x0 / 24 - 180, y0 / 24 - 90, x1 / 24 - 180, y1 / 24 - 90];

			// Check if the subdivision overlaps with the feature's bounding box
			if (!bboxOverlap(bbox, bboxF)) return 0;

			// Create a polygon from the bounding box and calculate the intersection
			const bboxPolygon = turf.bboxPolygon(bbox);
			const intersection = turf.intersect(turf.featureCollection([feature, bboxPolygon]));
			if (!intersection) return 0;

			const areaFull = turf.area(bboxPolygon);
			const areaIntersected = turf.area(intersection);

			// If the subdivision is minimal, calculate the population directly
			if (x1 - x0 === 1 && y1 - y0 === 1) {
				const populationDensity = Math.pow(2, popBuffer[y0 * 8640 + x0] / 10);
				return (populationDensity * areaIntersected) / areaFull;
			}

			if (areaFull <= areaIntersected) {
				let sum = 0;
				for (let y = y0; y < y1; y++) {
					for (let x = x0; x < x1; x++) {
						sum += Math.pow(2, popBuffer[y * 8640 + x] / 10);
					}
				}
				return sum;
			}

			// Recursively subdivide the bounding box and sum the population estimates
			bboxF = turf.bbox(intersection);
			const xn = Math.round((x0 + x1) / 2);
			const yn = Math.round((y0 + y1) / 2);
			let sum = 0;
			sum += rec(intersection, bboxF, x0, y0, xn, yn);
			sum += rec(intersection, bboxF, xn, y0, x1, yn);
			sum += rec(intersection, bboxF, x0, yn, xn, y1);
			sum += rec(intersection, bboxF, xn, yn, x1, y1);
			return sum;
		}
	}
}
