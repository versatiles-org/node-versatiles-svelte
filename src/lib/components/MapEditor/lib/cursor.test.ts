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
		cursor.toggleHover('test');
		expect(mockElement.style.cursor).toBe('pointer');
	});

	it('should return to default when hover is decreased back to zero', () => {
		cursor.toggleHover('test');
		cursor.toggleHover('test', false);
		expect(mockElement.style.cursor).toBe('default');
	});

	it('should set cursor to crosshair when precise is increased', () => {
		cursor.togglePrecise('test');
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should override hover cursor when precise is active', () => {
		cursor.toggleHover('test');
		cursor.togglePrecise('test');
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should set cursor to grab when grab is increased', () => {
		cursor.toggleGrab('test');
		expect(mockElement.style.cursor).toBe('grab');
	});

	it('should override hover and grab with precise', () => {
		cursor.toggleHover('test');
		cursor.togglePrecise('test');
		cursor.toggleGrab('test');
		expect(mockElement.style.cursor).toBe('crosshair');
	});

	it('should revert to correct state when grab is decreased', () => {
		cursor.toggleGrab('test');
		cursor.togglePrecise('test');
		cursor.toggleHover('test');
		cursor.toggleGrab('test', false);
		expect(mockElement.style.cursor).toBe('crosshair');
	});
});
