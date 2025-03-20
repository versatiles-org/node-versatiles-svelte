import { describe, it, expect } from 'vitest';
import { StateReader } from './reader.js';
import type { StateObject } from './types.js';
import { StateWriter } from './writer.js';

describe('StateReader', () => {
	it('should read bytes correctly', () => {
		const reader = new StateReader([10, 20, 30]);
		expect(reader.readByte()).toBe(10);
		expect(reader.readByte()).toBe(20);
		expect(reader.readByte()).toBe(30);
	});

	it('should read integers correctly (varint encoding with ZigZag)', () => {
		const reader = new StateReader([0x02, 0x85, 0x02]);
		expect(reader.readSignedInteger()).toBe(1);
		expect(reader.readSignedInteger()).toBe(-131);
	});

	it('should read negative integers correctly', () => {
		const reader = new StateReader([0x01, 0x03, 0x05]);
		expect(reader.readSignedInteger()).toBe(-1);
		expect(reader.readSignedInteger()).toBe(-2);
		expect(reader.readSignedInteger()).toBe(-3);
	});

	it('should read strings correctly', () => {
		const reader = new StateReader([5, 72, 101, 108, 108, 111]);
		expect(reader.readString()).toBe('Hello');
	});

	it('should decode from Base64', async () => {
		const base64String = 'AoUCAg==';
		const reader = await StateReader.fromBase64(base64String);
		expect(reader.readSignedInteger()).toBe(1);
		expect(reader.readSignedInteger()).toBe(-131);
	});

	it('should decode from compressed Base64', async () => {
		const base64String = '67s1jdGlICc1sThVITk/t6AotbhYh2SWQm4qAA==';
		const reader = await StateReader.fromBase64compressed(base64String);
		expect(reader.readSignedInteger()).toBe(1234567);
		expect(reader.readString()).toBe(
			'please compress, compress, compress, compress, compress, compress me'
		);
	});

	it('should throw an error when reading past the buffer', () => {
		const reader = new StateReader([10, 20]);
		reader.readByte();
		reader.readByte();
		expect(() => reader.readByte()).toThrow(RangeError);
	});

	it('should read an object correctly', () => {
		const originalState: StateObject = {
			map: { zoom: 5 },
			type: 'polygon',
			point: [12.34567, -98.76543],
			label: 'Test Label',
			elements: [{ type: 'marker' }],
			color: '#123456',
			style: {
				halo: 1,
				opacity: 1,
				pattern: 1,
				rotate: 1,
				align: 3,
			},
			strokeStyle: {
				size: 1,
				width: 1,
				zoom: 1,
				visible: true
			}
		};

		const writer = new StateWriter();
		writer.writeObject(originalState);
		const buffer = writer.getBuffer();

		const reader = new StateReader(buffer);
		const parsedState = reader.readObject();

		expect(parsedState).toStrictEqual(originalState);
	});

	it('should handle empty object', () => {
		const writer = new StateWriter();
		writer.writeObject({});
		const buffer = writer.getBuffer();

		const reader = new StateReader(buffer);
		const parsedState = reader.readObject();

		expect(parsedState).toStrictEqual({});
	});

	it('should handle nested objects', () => {
		const originalState: StateObject = {
			map: { zoom: 5, style: { color: '#336699' } },
			type: 'line'
		};

		const writer = new StateWriter();
		writer.writeObject(originalState);
		const buffer = writer.getBuffer();

		const reader = new StateReader(buffer);
		const parsedState = reader.readObject();

		expect(parsedState).toStrictEqual(originalState);
	});

	it('should handle points correctly', () => {
		const points: [number, number][] = new Array(10)
			.fill(0)
			.map(() => [
				Math.round((Math.random() - 0.5) * 36e6) / 1e5,
				Math.round((Math.random() - 0.5) * 18e6) / 1e5
			]);
		const originalState: StateObject = { points };
		const writer = new StateWriter();
		writer.writeObject(originalState);
		const buffer = writer.getBuffer();
		const reader = new StateReader(buffer);
		const parsedState = reader.readObject();
		expect(parsedState).toStrictEqual(originalState);
	});

	it('should read color correctly', () => {
		const reader = new StateReader(new Uint8Array([40, 255, 100, 50, 0]));
		const state = reader.readObject();
		expect(state.color).toStrictEqual('#FF6432');
	});

	it('should throw error on invalid key', () => {
		const reader = new StateReader(new Uint8Array([99, 0]));
		expect(() => reader.readObject()).toThrow('Invalid state key: 99');
	});
});
