import { describe, expect, it } from 'vitest';
import { StateWriter } from './writer.js';
import { StateReader } from './reader.js';
import type { StateObject } from './types.js';
import { defaultState } from './index.js';

describe('StateWriter -> StateReader', () => {
	const text =
		'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.';

	it('should write+read bytes correctly', () => {
		const writer = new StateWriter();
		writer.writeByte(10);
		writer.writeByte(20);
		writer.writeByte(30);
		const reader = new StateReader(writer.buffer);
		expect(reader.readByte()).toBe(10);
		expect(reader.readByte()).toBe(20);
		expect(reader.readByte()).toBe(30);
	});

	it('should write+read unsigned integers correctly', () => {
		const writer = new StateWriter();
		writer.writeUnsignedInteger(70462032);
		writer.writeUnsignedInteger(374517710);
		const reader = new StateReader(writer.buffer);
		expect(reader.readUnsignedInteger()).toBe(70462032);
		expect(reader.readUnsignedInteger()).toBe(374517710);
	});

	it('should write+read signed integers correctly', () => {
		const writer = new StateWriter();
		writer.writeSignedInteger(70462032);
		writer.writeSignedInteger(-374517710);
		const reader = new StateReader(writer.buffer);
		expect(reader.readSignedInteger()).toBe(70462032);
		expect(reader.readSignedInteger()).toBe(-374517710);
	});

	it('should write+read strings correctly', () => {
		const text = 'Hello, World! ö😇🥦自由的百科全書';
		const writer = new StateWriter();
		writer.writeString(text);
		const reader = new StateReader(writer.buffer);
		expect(reader.readString()).toBe(text);
	});

	it('should (de)code base64 correctly', async () => {
		const writer = new StateWriter();
		writer.writeString(text);
		const base64 = await writer.getBase64();
		const reader = await StateReader.fromBase64(base64);
		expect(reader.readString()).toBe(text);
	});

	it('should (de)compress strings correctly', async () => {
		const writer = new StateWriter();
		writer.writeString(text);
		const base64 = await writer.getBase64compressed();
		const reader = await StateReader.fromBase64compressed(base64);
		expect(reader.readString()).toBe(text);
	});
});

describe('defaultState', () => {
	it('should return undefined if value matches default', () => {
		const value: StateObject = { zoom: 5, color: 'red' };
		const def: StateObject = { zoom: 5, color: 'red' };
		expect(defaultState(value, def)).toBeUndefined();
	});

	it('should return filtered object if some properties differ from default', () => {
		const value: StateObject = { zoom: 5, color: 'blue' };
		const def: StateObject = { zoom: 5, color: 'red' };
		expect(defaultState(value, def)).toEqual({ color: 'blue' });
	});

	it('should exclude undefined values', () => {
		const value: StateObject = { zoom: 5, color: undefined };
		const def: StateObject = { zoom: 5, color: 'red' };
		expect(defaultState(value, def)).toBeUndefined();
	});

	it('should return the entire object if no properties match default', () => {
		const value: StateObject = { zoom: 6, color: 'blue' };
		const def: StateObject = { zoom: 5, color: 'red' };
		expect(defaultState(value, def)).toEqual({ zoom: 6, color: 'blue' });
	});

	it('should handle empty objects correctly', () => {
		expect(defaultState({}, {})).toBeUndefined();
	});
});
