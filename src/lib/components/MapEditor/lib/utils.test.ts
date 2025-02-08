import { describe, it, expect } from 'vitest';
import {
	getMiddlePoint,
	lat2mercator,
	mercator2lat,
	base64ToUint8Array,
	uint8ArrayToBase64,
	compress,
	decompress
} from './utils.js';
import type { ElementPoint } from './element/types.js';

describe('Coordinate Conversion Utils', () => {
	it('should convert latitude to Mercator projection correctly', () => {
		expect(lat2mercator(0)).toBeCloseTo(0); // Equator should map to 0
		expect(lat2mercator(85.051128)).toBeCloseTo(Math.PI);
		expect(lat2mercator(-85.051128)).toBeCloseTo(-Math.PI);
	});

	it('should convert Mercator projection back to latitude correctly', () => {
		expect(mercator2lat(0)).toBeCloseTo(0);
		expect(mercator2lat(lat2mercator(45))).toBeCloseTo(45, 5);
		expect(mercator2lat(lat2mercator(-30))).toBeCloseTo(-30, 5);
	});

	it('should get the middle point correctly', () => {
		const p0: ElementPoint = [0, 0];
		const p1: ElementPoint = [10, 10];
		const middle = getMiddlePoint(p0, p1);

		expect(middle[0]).toBeCloseTo(5);
		expect(middle[1]).toBeCloseTo(mercator2lat((lat2mercator(0) + lat2mercator(10)) / 2));
	});
});

describe('Base64 Encoding & Decoding Utils', () => {
	it('should convert Uint8Array to Base64 and back', () => {
		const data = new Uint8Array([72, 101, 108, 108, 111]); // 'Hello'
		const base64 = uint8ArrayToBase64(data);
		const decodedData = base64ToUint8Array(base64);

		expect(base64).toBe(btoa('Hello'));
		expect(decodedData).toEqual(data);
	});

	it('should decode Base64 string correctly', () => {
		const base64 = btoa('Hello, world!');
		const decoded = base64ToUint8Array(base64);
		expect(new TextDecoder().decode(decoded)).toBe('Hello, world!');
	});

	it('should encode/decode base64 correctly', () => {
		const data = Uint8Array.from({ length: 256 }, (_, i) => i);
		const base64 = uint8ArrayToBase64(data);
		const decoded = base64ToUint8Array(base64);
		expect(decoded).toStrictEqual(data);
	});
});

describe('Compression Utils', () => {
	it('should compress and decompress data correctly', async () => {
		const data = new Uint8Array([72, 101, 101, 101, 101, 101, 101, 108, 108, 111]); // 'Heeeeeello'
		const compressed = await compress(data);
		const decompressed = await decompress(compressed);

		expect(decompressed).toEqual(data);
	});

	it('should return a different size after compression', async () => {
		const data = new Uint8Array(new Array(1000).fill(65)); // 'A' repeated
		const compressed = await compress(data);

		expect(compressed.length).toBeLessThan(data.length);
	});
});
