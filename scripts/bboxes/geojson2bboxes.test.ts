import { describe, it, expect } from 'vitest';
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { processData } from './geojson2bboxes.js';
import { join, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { brotliCompressSync, gzipSync } from 'node:zlib';

describe('scripts/bboxes/geojson2bboxes.ts', () => {
	const mockGeoJSON = {
		type: 'FeatureCollection',
		features: [
			{
				type: 'Feature',
				geometry: {
					type: 'Polygon',
					coordinates: [
						[
							[-10, -10],
							[-10, 10],
							[10, 10],
							[10, -10],
							[-10, -10]
						]
					]
				},
				properties: { name: 'Test Feature', population: 500 }
			}
		]
	};

	const mockGeoJSONResult = JSON.stringify({
		label: 'Test Feature',
		population: 500,
		bbox: [-10, -10, 10, 10]
	});

	const mockGeoJSONL = `
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-10,-10],[-10,10],[10,10],[10,-10],[-10,-10]]]},"properties":{"name":"A Test Feature","population":500}}
{"type":"Feature","geometry":{"type":"Polygon","coordinates":[[[-20,-20],[-20,-10],[-10,-10],[-10,-20],[-20,-20]]]},"properties":{"name":"Different Feature","population":1000}}
`;

	const tempDir = mkdtempSync(join(tmpdir(), 'vitest-'));

	function saveAsTempFile(
		data: string | object,
		extension: string
	): { filenameIn: string; filenameOut: string } {
		const tempFile = resolve(tempDir, Math.random().toString(36).slice(2));
		const filenameIn = tempFile + '.' + extension;
		const filenameOut = tempFile + '.jsonl';

		let buffer: Buffer = Buffer.from(typeof data == 'string' ? data : JSON.stringify(data));
		if (extension.endsWith('.br')) buffer = brotliCompressSync(buffer);
		if (extension.endsWith('.gz')) buffer = gzipSync(buffer);

		writeFileSync(filenameIn, buffer);
		return { filenameIn, filenameOut };
	}

	it('should process a GeoJSON file and write results to JSONL', async () => {
		const { filenameIn, filenameOut } = saveAsTempFile(mockGeoJSON, 'geojson');
		await processData(filenameIn, '{name}', 'population');
		expect(readFileSync(filenameOut, 'utf8')).toStrictEqual(mockGeoJSONResult);
	});

	it('should process a GeoJSONL file and write results to JSONL', async () => {
		const { filenameIn, filenameOut } = saveAsTempFile(mockGeoJSONL, 'geojsonl');
		await processData(filenameIn, '{name}', 'population');
		expect(readFileSync(filenameOut, 'utf8')).toStrictEqual(
			[
				'{"label":"A Test Feature","population":500,"bbox":[-10,-10,10,10]}',
				'{"label":"Different Feature","population":1000,"bbox":[-20,-20,-10,-10]}'
			].join('\n')
		);
	});

	it('should handle Brotli-compressed files', async () => {
		const { filenameIn, filenameOut } = saveAsTempFile(mockGeoJSON, 'geojson.br');
		await processData(filenameIn, '{name}', 'population');
		expect(readFileSync(filenameOut, 'utf8')).toStrictEqual(mockGeoJSONResult);
	});

	it('should handle Gzip-compressed files', async () => {
		const { filenameIn, filenameOut } = saveAsTempFile(mockGeoJSON, 'geojson.gz');
		await processData(filenameIn, '{name}', 'population');
		expect(readFileSync(filenameOut, 'utf8')).toStrictEqual(mockGeoJSONResult);
	});

	it('should estimate population if populationKey is not provided', async () => {
		const { filenameIn, filenameOut } = saveAsTempFile(mockGeoJSON, 'geojson');
		await processData(filenameIn, '{name}');
		expect(readFileSync(filenameOut, 'utf8')).toStrictEqual(
			'{"label":"Test Feature","population":220698576.62801403,"bbox":[-10,-10,10,10]}'
		);
	});

	it('should throw an error for features without properties', async () => {
		const invalidGeoJSON = {
			...mockGeoJSON,
			features: [{ type: 'Feature', geometry: mockGeoJSON.features[0].geometry }]
		};
		const { filenameIn } = saveAsTempFile(invalidGeoJSON, 'geojson');
		await expect(processData(filenameIn, '{name}')).rejects.toThrow('Feature has no properties');
	});

	it('should throw an error for non-Polygon/MultiPolygon features', async () => {
		const invalidGeoJSON = {
			...mockGeoJSON,
			features: [{ type: 'Feature', geometry: { type: 'Point', coordinates: [0, 0] } }]
		};
		const { filenameIn } = saveAsTempFile(invalidGeoJSON, 'geojson');
		await expect(processData(filenameIn, '{name}')).rejects.toThrow(
			'Feature must be Polygon or MultiPolygon'
		);
	});
});
