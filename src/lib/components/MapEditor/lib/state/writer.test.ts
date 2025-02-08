import { describe, it, expect } from 'vitest';
import { StateWriter } from './writer.js';

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
});
