#!/usr/bin/env npx tsx

import type { BBox } from 'geojson';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';


type Entry = {
	label: string,
	population: number,
	bbox: BBox,
}

process.chdir(import.meta.dirname);

console.log('load data');
const data: Entry[] = [];
const knownLabels = new Set<string>();
readdirSync('sources').forEach(filename => {
	if (!filename.endsWith('.jsonl')) return;
	const lines = readFileSync('sources/' + filename, 'utf8').split('\n');
	for (const line of lines) {
		if (!line) continue;
		const entry = JSON.parse(line) as Entry;

		if (!entry.population) console.error('Error, population is missing: ' + line);

		if (knownLabels.has(entry.label)) {
			throw Error(`Error, label "${entry.label}" is duplicated`)
		}
		knownLabels.add(entry.label);

		const bbox = roundBBox(entry.bbox);
		data.push({ ...entry, bbox });
	}
})

data.sort((a, b) => b.population - a.population);

console.log('write data');
writeFileSync('../bboxes.json',
	'[\n' +
	data.map(e => {
		const r = [e.label, ...e.bbox];
		if (r.length !== 5) throw Error();
		return JSON.stringify(r);
	}).join(',\n')
	+ '\n]'
);

function roundBBox(bbox: BBox): BBox {
	const fx = length2precision(Math.abs(bbox[2] - bbox[0]));
	const fy = length2precision(Math.abs(bbox[3] - bbox[1]));

	const x = Math.floor(bbox[0] * fx) / fx;
	const y = Math.floor(bbox[1] * fy) / fy;
	const b = [
		x, y,
		Math.ceil((bbox[2] - x) * fx) / fx,
		Math.ceil((bbox[3] - y) * fy) / fy,
	] as BBox;

	return b;

	function length2precision(n: number): number {
		if (n > 300) return 1;
		if (n > 30) return 10;
		if (n > 3) return 100;
		return 1000;
	}
}
