#!/usr/bin/env npx tsx

import type { BBox, Feature, MultiPolygon, Polygon } from 'geojson';
import { createReadStream, readFileSync, writeFileSync } from 'node:fs';
import { brotliDecompressSync, createBrotliDecompress, createGunzip } from 'node:zlib';
import { basename, resolve } from 'node:path';
import type { Stream } from 'node:stream';
import * as turf from '@turf/turf';
import split from 'split2';

let popBuffer: Buffer;
let input = process.argv[2];
const labelTemplate = process.argv[3];
const populationKey = process.argv[4];

if (!input || !labelTemplate) {
	console.log('Expected: ./geojson2bboxes.ts $FILENAME $LABEL_KEY $POPULATION_KEY');
	console.log('where:');
	console.log(' - $FILENAME is the name of the GeoJSON(L) file (can be compressed with br/gz)');
	console.log(
		' - $LABEL is a template to generate the label in the form e.g. "{country} - {name}"'
	);
	console.log(
		' - $POPULATION_KEY (optional) is the key in the properties containing the population'
	);
	process.exit(1);
}

let stream: Stream = createReadStream(input);
input = basename(input);

if (input.endsWith('.br')) {
	stream = stream.pipe(createBrotliDecompress());
	input = basename(input, '.br');
} else if (input.endsWith('.gz')) {
	stream = stream.pipe(createGunzip());
	input = basename(input, '.gz');
}

type Entry = { label: string; population: number; bbox: BBox };
let result: Entry[] = [];
if (input.endsWith('.geojson')) {
	result = JSON.parse(await streamToString(stream)).features.map(processFeature);
} else if (input.endsWith('.geojsonl')) {
	result = await mapJSONStream(stream.pipe(split()), processFeature);
}

writeFileSync(
	input + '.jsonl',
	result
		.map((f) => JSON.stringify(f))
		.sort()
		.join('\n')
);

function processFeature(feature: Feature): Entry {
	const { properties } = feature;
	if (properties == null) throw Error(`features has no properties`);

	const bbox = turf.bbox(feature);
	const label = labelTemplate.replace(/{(.*?)}/g, (text, key) => {
		const value = properties[key];
		if (value === undefined) console.error(`key "${key}" not found`);
		return value;
	});
	let population;
	if (populationKey) {
		population = properties[populationKey];
	} else {
		console.log(`guessing population of "${label}"`);
		population = guessPopulation(feature);
	}

	return {
		label,
		population,
		bbox
	};
}

function streamToString(stream: Stream): Promise<string> {
	const chunks: Buffer[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
	});
}

function mapJSONStream(stream: NodeJS.WritableStream, cb: (f: Feature) => Entry): Promise<Entry[]> {
	const result: Entry[] = [];
	return new Promise((resolve, reject) => {
		stream.on('data', (chunk) => result.push(cb(JSON.parse(chunk))));
		stream.on('error', (err) => reject(err));
		stream.on('end', () => resolve(result));
	});
}

function guessPopulation(f: Feature): number {
	const feature = f as Feature<Polygon | MultiPolygon>;
	if (!popBuffer)
		popBuffer = brotliDecompressSync(
			readFileSync(resolve(import.meta.dirname, 'population.raw.br'))
		);

	let sum = 0;

	turf.flattenEach(feature, (f) => {
		const bbox = turf.bbox(f);
		sum += rec(f, bbox, 0, 0, 4320, 4320);
		sum += rec(f, bbox, 4320, 0, 8640, 4320);
	});
	return sum;

	function rec(
		feature: Feature<Polygon | MultiPolygon>,
		bboxF: BBox,
		x0: number,
		y0: number,
		x1: number,
		y1: number
	): number {
		if (!feature) return 0;
		if (x0 == x1) return 0;
		if (y0 == y1) return 0;

		const bbox: BBox = [x0 / 24 - 180, y0 / 24 - 90, x1 / 24 - 180, y1 / 24 - 90];
		if (!bboxOverlap(bbox, bboxF)) return 0;
		const bboxPolygon = turf.bboxPolygon(bbox);
		const intersection = turf.intersect(
			turf.featureCollection<Polygon | MultiPolygon>([feature, bboxPolygon])
		);
		if (intersection == null) return 0;

		if (x1 - x0 == 1 && y1 - y0 == 1) {
			const a1 = turf.area(bboxPolygon);
			const a2 = turf.area(intersection);
			const v = Math.pow(2, popBuffer[y0 * 8640 + x0] / 10);
			//console.log(v);
			return (v * a2) / a1;
		}

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

function bboxOverlap(bbox1: BBox, bbox2: BBox): boolean {
	if (bbox1[0] > bbox2[2]) return false;
	if (bbox1[1] > bbox2[3]) return false;
	if (bbox1[2] < bbox2[0]) return false;
	if (bbox1[3] < bbox2[1]) return false;
	return true;
}
