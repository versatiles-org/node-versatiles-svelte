#!/usr/bin/env npx tsx

import type { BBox } from 'geojson';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { roundBBox } from './lib/bboxes.js';
import { fileURLToPath } from 'node:url';
import { argv } from 'node:process';
import { resolve } from 'node:path';

// Define the structure of the entries in the data
type Entry = {
	label: string;
	population: number;
	bbox: BBox;
};

if (fileURLToPath(import.meta.url) === argv[1]) {
	const result = mergeBBoxes();
	writeFileSync(resolve(import.meta.dirname, '../../src/lib/components/BBoxMap/bboxes.json'), result);
}

export function mergeBBoxes() {
	console.log('Loading data...');

	const dirIn = resolve(import.meta.dirname, './data')

	// Initialize an array to hold the processed data
	const data: Entry[] = [];

	// Set to keep track of known labels to prevent duplicates
	const knownLabels = new Set<string>();

	// Read all files in the "sources" directory
	readdirSync(dirIn).forEach((filename) => {
		// Skip files that do not end with .jsonl
		if (!filename.endsWith('.jsonl')) return;

		// Read the contents of the file and split it into lines
		const lines = readFileSync(resolve(dirIn, filename), 'utf8').split('\n');
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

			// max values are now relative to min values
			bbox[2] = round(bbox[2] - bbox[0]);
			bbox[3] = round(bbox[3] - bbox[1]);

			// Add the entry to the data array
			data.push({ ...entry, bbox });
		}
	});

	// Sort the data array by population in descending order
	data.sort((a, b) => b.population - a.population);

	// Write the processed data to a JSON file
	return `[\n${data.map((e) => {
		const r = [e.label, ...e.bbox];
		// Ensure the array has exactly 5 elements (label + 4 bbox values)
		if (r.length !== 5) throw new Error('Error: Incorrect entry length');
		return JSON.stringify(r);
	}).join(',\n')}\n]`;
}

export function round(num: number) {
	return Math.round(num * 1000) / 1000;
}
