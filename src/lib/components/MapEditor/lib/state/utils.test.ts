import { describe, it, expect } from 'vitest';
import { removeDefaultFields } from './utils.js';
import type { StateStyle } from './types.js';

describe('removeDefaultFields', () => {
	it('should return undefined if all fields match the default', () => {
		const value: StateStyle = { color: 'red', size: 10 };
		const def: StateStyle = { color: 'red', size: 10 };
		const result = removeDefaultFields(value, def);
		expect(result).toBeUndefined();
	});

	it('should return an object with fields that differ from the default', () => {
		const value: StateStyle = { color: 'blue', size: 10 };
		const def: StateStyle = { color: 'red', size: 10 };
		const result = removeDefaultFields(value, def);
		expect(result).toEqual({ color: 'blue' });
	});

	it('should exclude fields that are undefined in the value', () => {
		const value: StateStyle = { color: undefined, size: 10 };
		const def: StateStyle = { color: 'red', size: 10 };
		const result = removeDefaultFields(value, def);
		expect(result).toBeUndefined();
	});

	it('should return undefined if the value object is empty', () => {
		const value: StateStyle = {};
		const def: StateStyle = { color: 'red', size: 10 };
		const result = removeDefaultFields(value, def);
		expect(result).toBeUndefined();
	});

	it('should handle cases where the default object is empty', () => {
		const value: StateStyle = { color: 'blue', size: 10 };
		const def: StateStyle = {};
		const result = removeDefaultFields(value, def);
		expect(result).toEqual({ color: 'blue', size: 10 });
	});

	it('should handle cases where both value and default objects are empty', () => {
		const value: StateStyle = {};
		const def: StateStyle = {};
		const result = removeDefaultFields(value, def);
		expect(result).toBeUndefined();
	});
});
