import { describe, it, expect } from 'vitest';
import { StateReader } from './reader.js';

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
});
