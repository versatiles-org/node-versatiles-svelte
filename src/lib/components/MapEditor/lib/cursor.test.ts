import { describe, expect, it, beforeEach } from 'vitest';
import { Cursor } from './cursor.js';

describe('Cursor', () => {
	let mockElement: HTMLElement;
	let cursor: Cursor;

	beforeEach(() => {
		mockElement = document.createElement('div');
		cursor = new Cursor(mockElement);
	});

	it('should initialize with default cursor', () => {
		expect(mockElement.style.cursor).toBe('default');
	});

	it('should set cursor to pointer when hover is increased', () => {
		cursor.hover(true);
		expect(mockElement.style.cursor).toBe('pointer');
	});

	it('should return to default when hover is decreased back to zero', () => {
		cursor.hover(true);
		cursor.hover(false);
		expect(mockElement.style.cursor).toBe('default');
	});

	it('should set cursor to crosshair when precise is increased', () => {
		cursor.precise(true);
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should override hover cursor when precise is active', () => {
		cursor.hover(true);
		cursor.precise(true);
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should set cursor to grab when grab is increased', () => {
		cursor.grab(true);
		expect(mockElement.style.cursor).toBe('grab');
	});

	it('should override hover and grab with precise', () => {
		cursor.hover(true);
		cursor.precise(true);
		cursor.grab(true);
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should revert to correct state when grab is decreased', () => {
		cursor.grab(true);
		cursor.precise(true);
		cursor.hover(true);
		cursor.grab(false);
		expect(mockElement.style.cursor).toBe('crosshair');
	});
});
