#!/usr/bin/env npx tsx

import type { BBox } from 'geojson';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';

// Define the structure of the entries in the data
type Entry = {
	label: string;
	population: number;
	bbox: BBox;
};

// Change the current working directory to the script's directory
process.chdir(import.meta.dirname);

console.log('Loading data...');

// Initialize an array to hold the processed data
const data: Entry[] = [];

// Set to keep track of known labels to prevent duplicates
const knownLabels = new Set<string>();

// Read all files in the "sources" directory
readdirSync('../data/sources').forEach((filename) => {
	// Skip files that do not end with .jsonl
	if (!filename.endsWith('.jsonl')) return;

	// Read the contents of the file and split it into lines
	const lines = readFileSync(`../data/sources/${filename}`, 'utf8').split('\n');
	for (const line of lines) {
		// Skip empty lines
		if (!line) continue;

		// Parse each line into an Entry object
		const entry = JSON.parse(line) as Entry;

		// Check for missing population values
		if (!entry.population) {
			console.error(`Error: Population is missing in line: ${line}`);
			continue;
		}

		// Check for duplicate labels
		if (knownLabels.has(entry.label)) {
			throw new Error(`Error: Label "${entry.label}" is duplicated`);
		}

		// Add the label to the knownLabels set
		knownLabels.add(entry.label);

		// Round the bounding box values
		const bbox = roundBBox(entry.bbox);

		// Add the entry to the data array
		data.push({ ...entry, bbox });
	}
});

// Sort the data array by population in descending order
data.sort((a, b) => b.population - a.population);

console.log('Writing data to output file...');

// Write the processed data to a JSON file
writeFileSync(
	'../bboxes.json',
	'[\n' +
	data
		.map((e) => {
			const r = [e.label, ...e.bbox];
			// Ensure the array has exactly 5 elements (label + 4 bbox values)
			if (r.length !== 5) throw new Error('Error: Incorrect entry length');
			return JSON.stringify(r);
		})
		.join(',\n') +
	'\n]'
);

console.log('Data processing complete.');

/**
 * Rounds the values in a bounding box to a precision determined by its size.
 * @param bbox - The bounding box to round.
 * @returns A new bounding box with rounded values.
 */
function roundBBox(bbox: BBox): BBox {
	// Determine precision based on the size of the bounding box
	const fx = length2precision(Math.abs(bbox[2] - bbox[0]));
	const fy = length2precision(Math.abs(bbox[3] - bbox[1]));

	// Round the bounding box values
	const x = Math.floor(bbox[0] * fx) / fx;
	const y = Math.floor(bbox[1] * fy) / fy;
	const b = [x, y, Math.ceil((bbox[2] - x) * fx) / fx, Math.ceil((bbox[3] - y) * fy) / fy] as BBox;

	return b;

	/**
	 * Determines the precision for rounding based on the length of a side of the bounding box.
	 * @param n - The length of a side of the bounding box.
	 * @returns The precision factor to use for rounding.
	 */
	function length2precision(n: number): number {
		if (n > 300) return 1; // No rounding for large values
		if (n > 30) return 10; // Round to the nearest 0.1
		if (n > 3) return 100; // Round to the nearest 0.01
		return 1000;           // Round to the nearest 0.001 for small values
	}
}
