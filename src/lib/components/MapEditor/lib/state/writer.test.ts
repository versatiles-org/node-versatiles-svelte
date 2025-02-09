import { describe, it, expect } from 'vitest';
import { StateWriter } from './writer.js';
import type { StateObject } from './types.js';

describe('StateWriter', () => {
	it('should write bytes correctly', () => {
		const writer = new StateWriter();
		writer.writeByte(10);
		writer.writeByte(20);
		writer.writeByte(30);

		expect(writer.getBase64()).toBe(btoa(String.fromCharCode(10, 20, 30)));
	});

	it('should write integers correctly (varint encoding with ZigZag)', () => {
		const writer = new StateWriter();
		writer.writeSignedInteger(1);
		writer.writeSignedInteger(133);
		writer.writeSignedInteger(-42);
		expect(writer.getBuffer()).toStrictEqual(new Uint8Array([2, 138, 2, 83]));
	});

	it('should write strings correctly', () => {
		const writer = new StateWriter();
		writer.writeString('Hello');
		expect(writer.getBuffer()).toStrictEqual(new Uint8Array([0x05, 72, 101, 108, 108, 111]));
	});

	it('should correctly handle base64 encoding', () => {
		const writer = new StateWriter();
		writer.writeByte(255);
		writer.writeByte(128);
		writer.writeByte(63);
		expect(writer.getBase64()).toBe(btoa(String.fromCharCode(255, 128, 63)));
	});

	it('should correctly handle compressed base64 encoding', async () => {
		const writer = new StateWriter();
		writer.writeSignedInteger(1234567);
		writer.writeString('please compress, compress, compress, compress, compress, compress me');
		expect(await writer.getBase64compressed()).toStrictEqual(
			'67s1jdGlICc1sThVITk/t6AotbhYh2SWQm4qAA=='
		);
	});

	it('should expand buffer size correctly when needed', () => {
		const chunkSize = 70000;
		const writer = new StateWriter();
		for (let i = 0; i < chunkSize + 10; i++) {
			writer.writeByte(255);
		}
		expect(writer.buffer.length).toBeGreaterThan(chunkSize);
	});

	describe('writeObject', () => {
		it('should write an empty object (only the terminating 0)', () => {
			const writer = new StateWriter();
			writer.writeObject({});
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([0]));
		});

		it('should throw error for unknown keys', () => {
			const writer = new StateWriter();
			expect(() =>
				writer.writeObject({ unknownKey: 'someValue' } as unknown as StateObject)
			).toThrowError(/Invalid state key: unknownKey/);
		});

		it('should write nested objects (map, style, strokeStyle)', () => {
			const writer = new StateWriter();
			writer.writeObject({ map: { zoom: 3 }, style: {}, strokeStyle: { color: '#123' } });
			expect(writer.getBuffer()).toStrictEqual(
				new Uint8Array([10, 76, 3, 0, 11, 0, 12, 40, 17, 34, 51, 0, 0])
			);
		});

		it('should write "elements" properly (array of objects)', () => {
			const writer = new StateWriter();
			writer.writeObject({ elements: [{ type: 'marker' }, { type: 'line' }] });
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([20, 2, 50, 0, 0, 50, 1, 0, 0]));
		});

		it('should write a single point (two coordinates) correctly', () => {
			const writer = new StateWriter();
			writer.writeObject({ point: [1.23456, -2.34567] });
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([30, 128, 137, 15, 141, 209, 28, 0]));
		});

		it('should reject invalid "point" (not exactly length 2)', () => {
			const writer = new StateWriter();
			expect(() => writer.writeObject({ point: [1, 2, 3] } as unknown as StateObject)).toThrowError(
				/Invalid point/
			);
		});

		it('should write a "points" array with differential encoding', () => {
			const writer = new StateWriter();
			writer.writeObject({
				points: [
					[0, 0],
					[1.23456, 2.34567],
					[2.23456, 3.34567]
				]
			});
			expect(writer.getBuffer()).toStrictEqual(
				new Uint8Array([31, 3, 0, 128, 137, 15, 192, 154, 12, 0, 142, 209, 28, 192, 154, 12, 0])
			);
		});

		it('should write "color" correctly', () => {
			const writer = new StateWriter();
			writer.writeObject({ color: 'rgb(12,34,56)' });
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([40, 12, 34, 56, 0]));
		});

		it('should write "type" with allowed values', () => {
			const writer = new StateWriter();
			writer.writeObject({ type: 'marker' });
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([50, 0, 0]));
		});

		it('should throw error on invalid "type"', () => {
			const writer = new StateWriter();
			expect(() => writer.writeObject({ type: 'circle' } as unknown as StateObject)).toThrowError(
				/Invalid type/
			);
		});

		it('should write a string label', () => {
			const writer = new StateWriter();
			writer.writeObject({ label: 'TestLabel' });
			expect(writer.getBuffer()).toStrictEqual(
				new Uint8Array([60, 9, 84, 101, 115, 116, 76, 97, 98, 101, 108, 0])
			);
		});

		it('should handle numeric fields (halo, opacity, etc.)', () => {
			const writer = new StateWriter();
			writer.writeObject({ halo: 5, opacity: 123, rotate: 360 });
			expect(writer.getBuffer()).toStrictEqual(new Uint8Array([70, 5, 71, 123, 73, 232, 2, 0]));
		});

		it('should throw error if numeric fields are negative', () => {
			const writer = new StateWriter();
			expect(() => writer.writeObject({ halo: -1 } as unknown as StateObject)).toThrow(
				/Negative Number/
			);
		});

		it('should recursively write nested objects and terminate properly', () => {
			const writer = new StateWriter();
			writer.writeObject({
				map: { style: { type: 'polygon', color: '#000000' } },
				elements: [{ label: 'One', color: '#ffffff' }]
			});
			expect(writer.getBuffer()).toStrictEqual(
				new Uint8Array([
					10, 11, 50, 2, 40, 0, 0, 0, 0, 0, 20, 1, 60, 3, 79, 110, 101, 40, 255, 255, 255, 0, 0
				])
			);
		});
	});
});
