#!/usr/bin/env npx tsx

import type { BBox, Feature, MultiPolygon, Polygon } from 'geojson';
import { createReadStream, readFileSync, writeFileSync } from 'node:fs';
import { brotliDecompressSync, createBrotliDecompress, createGunzip } from 'node:zlib';
import { basename, resolve } from 'node:path';
import type { Stream } from 'node:stream';
import * as turf from '@turf/turf';
import split from 'split2';

// Buffer to hold decompressed population data
let popBuffer: Buffer;

// Parse command-line arguments
let input = process.argv[2];
const labelTemplate = process.argv[3];
const populationKey = process.argv[4];

// Validate command-line arguments
if (!input || !labelTemplate) {
	[
		'Expected: ./geojson2bboxes.ts <FILENAME> <LABEL_TEMPLATE> [POPULATION_KEY]',
		'where:',
		'<FILENAME>: The name of the input GeoJSON or GeoJSONL file. The file can be optionally compressed with .br (Brotli) or .gz (Gzip).',
		'<LABEL_TEMPLATE>: A template string used to generate labels for each feature. The template can include placeholders in the form {propertyName} which will be replaced by the corresponding property value from each feature.',
		'[POPULATION_KEY]: (Optional) The key in the feature\'s properties that contains the population value. If not provided, the script will attempt to estimate the population using a predefined algorithm.'
	].forEach(m => console.error(m));
	process.exit(1);
}

// Determine the input stream, handling compressed files
let stream: Stream = createReadStream(input);
input = basename(input);

if (input.endsWith('.br')) {
	stream = stream.pipe(createBrotliDecompress());
	input = basename(input, '.br');
} else if (input.endsWith('.gz')) {
	stream = stream.pipe(createGunzip());
	input = basename(input, '.gz');
}

// Define the structure of the output entries
type Entry = { label: string; population: number; bbox: BBox };

// Initialize the result array
let result: Entry[] = [];

if (input.endsWith('.geojson')) {
	// If the input is a GeoJSON file, process it directly
	result = JSON.parse(await streamToString(stream)).features.map(processFeature);
} else if (input.endsWith('.geojsonl')) {
	// If the input is a GeoJSONL file, process it line by line
	result = await mapJSONStream(stream.pipe(split()), processFeature);
}

// Write the results to a JSONL file
writeFileSync(
	input + '.jsonl',
	result
		.map((f) => JSON.stringify(f))
		.sort() // Sort the results before writing
		.join('\n')
);

/**
 * Processes a GeoJSON feature to extract the label, population, and bounding box (BBox).
 * @param feature - The GeoJSON feature to process.
 * @returns An object containing the label, population, and bounding box.
 */
function processFeature(feature: Feature): Entry {
	if ((feature.geometry.type !== 'Polygon') && (feature.geometry.type !== 'MultiPolygon')) {
		throw new Error('Feature must be Polygon or MultiPolygon');
	}
	const polygon = feature as Feature<Polygon | MultiPolygon>;

	const { properties } = polygon;
	if (!properties) throw new Error('Feature has no properties');

	// Compute the bounding box using Turf.js
	const bbox = turf.bbox(polygon);

	// Generate the label using the provided template
	const label = labelTemplate.replace(/{(.*?)}/g, (text, key) => {
		const value = properties[key];
		if (value === undefined) console.error(`key "${key}" not found in feature properties`);
		return value;
	});

	// Determine the population
	let population: number;
	if (populationKey) {
		population = properties[populationKey];
	} else {
		console.log(`Guessing population for "${label}"`);
		population = guessPopulation(polygon);
	}

	return { label, population, bbox };
}

/**
 * Converts a stream to a string by accumulating its chunks.
 * @param stream - The stream to convert.
 * @returns A promise that resolves to the string representation of the stream's content.
 */
function streamToString(stream: Stream): Promise<string> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}

/**
 * Maps each feature in a JSONL stream to an entry using a provided callback function.
 * @param stream - The stream of JSONL data.
 * @param cb - The callback function to process each feature.
 * @returns A promise that resolves to an array of entries.
 */
function mapJSONStream(stream: NodeJS.WritableStream, cb: (f: Feature) => Entry): Promise<Entry[]> {
	const result: Entry[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => result.push(cb(JSON.parse(chunk))));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(result));
	});
}

/**
 * Estimates the population for a given feature by recursively subdividing its bounding box.
 * @param feature - The GeoJSON feature for which to estimate population.
 * @returns The estimated population.
 */
function guessPopulation(feature: Feature<Polygon | MultiPolygon>): number {
	if (!popBuffer) {
		// Load and decompress the population density data if not already loaded
		popBuffer = brotliDecompressSync(
			readFileSync(resolve(import.meta.dirname, 'population.raw.br'))
		);
	}

	let sum = 0;

	// Flatten the geometry and estimate population for each part
	turf.flattenEach(feature, (f) => {
		const bbox = turf.bbox(f);
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
		if (x0 === x1 || y0 === y1) return 0;

		// Calculate the bounding box for this subdivision
		const bbox: BBox = [x0 / 24 - 180, y0 / 24 - 90, x1 / 24 - 180, y1 / 24 - 90];

		// Check if the subdivision overlaps with the feature's bounding box
		if (!bboxOverlap(bbox, bboxF)) return 0;

		// Create a polygon from the bounding box and calculate the intersection
		const bboxPolygon = turf.bboxPolygon(bbox);
		const intersection = turf.intersect(
			turf.featureCollection<Polygon | MultiPolygon>([feature, bboxPolygon])
		);
		if (!intersection) return 0;

		// If the subdivision is minimal, calculate the population directly
		if (x1 - x0 === 1 && y1 - y0 === 1) {
			const areaFull = turf.area(bboxPolygon);
			const areaIntersected = turf.area(intersection);
			const populationDensity = Math.pow(2, popBuffer[y0 * 8640 + x0] / 10);
			return (populationDensity * areaIntersected) / areaFull;
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

/**
 * Checks if two bounding boxes overlap.
 * @param bbox1 - The first bounding box.
 * @param bbox2 - The second bounding box.
 * @returns True if the bounding boxes overlap, false otherwise.
 */
function bboxOverlap(bbox1: BBox, bbox2: BBox): boolean {
	return !(
		bbox1[0] > bbox2[2] ||
		bbox1[1] > bbox2[3] ||
		bbox1[2] < bbox2[0] ||
		bbox1[3] < bbox2[1]
	);
}
