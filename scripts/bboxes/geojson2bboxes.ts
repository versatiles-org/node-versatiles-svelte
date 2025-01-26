#!/usr/bin/env npx tsx

import type { BBox, Feature, MultiPolygon, Polygon } from 'geojson';
import { readFileSync, writeFileSync } from 'node:fs';
import { brotliDecompressSync, gunzipSync } from 'node:zlib';
import * as turf from '@turf/turf';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import { GuessPopulation } from './lib/guess_population.js';

if (fileURLToPath(import.meta.url) === argv[1]) {
	processData(argv[2], argv[3], argv[4]);
}

export async function processData(input: string, labelTemplate: string, populationKey?: string) {
	// Buffer to hold decompressed population data
	const guessPopulation = new GuessPopulation();

	// Validate command-line arguments
	if (!input || !labelTemplate) {
		[
			'Expected: ./geojson2bboxes.ts <FILENAME> <LABEL_TEMPLATE> [POPULATION_KEY]',
			'where:',
			'<FILENAME>: The name of the input GeoJSON or GeoJSONL file. The file can be optionally compressed with .br (Brotli) or .gz (Gzip).',
			'<LABEL_TEMPLATE>: A template string used to generate labels for each feature. The template can include placeholders in the form {propertyName} which will be replaced by the corresponding property value from each feature.',
			"[POPULATION_KEY]: (Optional) The key in the feature's properties that contains the population value. If not provided, the script will attempt to estimate the population using a predefined algorithm."
		].forEach((m) => console.error(m));
		process.exit(1);
	}

	// Determine the input stream, handling compressed files
	let buffer = readFileSync(input);

	if (input.endsWith('.br')) {
		buffer = brotliDecompressSync(buffer);
		input = input.replace(/\.br$/, '');
	} else if (input.endsWith('.gz')) {
		buffer = gunzipSync(buffer);
		input = input.replace(/\.gz$/, '');
	}

	// Define the structure of the output entries
	type Entry = { label: string; population: number; bbox: BBox };

	// Initialize the result array
	let result: Entry[] = [];

	if (input.endsWith('.geojson')) {
		// If the input is a GeoJSON file, process it directly
		result = JSON.parse(buffer.toString()).features.map(processFeature);
		input = input.replace(/\.geojson$/, '');
	} else if (input.endsWith('.geojsonl')) {
		// If the input is a GeoJSONL file, process it line by line
		result = buffer
			.toString()
			.split('\n')
			.filter((line) => line.length > 1)
			.map((line) => processFeature(JSON.parse(line)));
		input = input.replace(/\.geojsonl$/, '');
	} else {
		throw new Error('Input file must be GeoJSON or GeoJSONL');
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
		if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon') {
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
			population = guessPopulation.guess(polygon);
		}

		return { label, population, bbox };
	}
}
