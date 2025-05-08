import { describe, it, expect } from 'vitest';
import { GuessPopulation } from './guess_population.js';
import * as turf from '@turf/turf';
import type { Feature, MultiPolygon } from 'geojson';

describe('scripts/bboxes/lib/guess_population.ts', () => {
	const guessPopulation = new GuessPopulation();

	describe('guess', () => {
		it('should estimate population for a simple polygon', () => {
			const polygon = turf.polygon([
				[
					[-10, -10],
					[-10, 10],
					[10, 10],
					[10, -10],
					[-10, -10]
				]
			]);

			const population = guessPopulation.guess(polygon);
			expect(population).toBe(220698576.62801403); // Population should be estimated
		});

		it('should return 0 for a polygon with no overlap in bounding boxes', () => {
			const polygon = turf.polygon([
				[
					[100, 100],
					[100, 110],
					[110, 110],
					[110, 100],
					[100, 100]
				]
			]);

			const population = guessPopulation.guess(polygon);
			expect(population).toBe(0); // No overlap, population should be zero
		});

		it('should handle multi-polygons and calculate population for all parts', () => {
			const polygonA = turf.polygon([
				[
					[9, 9],
					[9, 10],
					[10, 10],
					[10, 9],
					[9, 9]
				]
			]);
			const polygonB = turf.polygon([
				[
					[20, 20],
					[20, 21],
					[21, 21],
					[21, 20],
					[20, 20]
				]
			]);
			const multiPolygon = turf.union(turf.featureCollection([polygonA, polygonB])) as Feature<MultiPolygon>;

			const populationA = guessPopulation.guess(polygonA);
			const populationB = guessPopulation.guess(polygonB);
			const populationAB = guessPopulation.guess(multiPolygon);
			expect(populationA).toBe(2135743.3417579005);
			expect(populationB).toBe(4689.739920382195);
			expect(populationAB).toBe(populationA + populationB);
		});

		it('should estimate population correctly for minimal subdivisions', () => {
			const smallPolygon = turf.polygon([
				[
					[9, 9],
					[9, 9.001],
					[9.001, 9.001],
					[9.001, 9],
					[9, 9]
				]
			]);

			const population = guessPopulation.guess(smallPolygon);
			expect(population).toBe(2.2014249366742815); // Small polygon population should be estimated
		});
	});

	describe('edge cases', () => {
		it('should return 0 for an empty polygon', () => {
			const emptyPolygon = turf.polygon([]);
			const population = guessPopulation.guess(emptyPolygon);
			expect(population).toBe(0); // No area, no population
		});

		it('should handle a zero-area bounding box gracefully', () => {
			const zeroAreaPolygon = turf.polygon([
				[
					[10, 10],
					[10, 10],
					[10, 10],
					[10, 10],
					[10, 10]
				]
			]);

			const population = guessPopulation.guess(zeroAreaPolygon);
			expect(population).toBe(0); // Zero area, no population
		});
	});
});
