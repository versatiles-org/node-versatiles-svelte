import { describe, expect, it, beforeEach, vi } from 'vitest';
import { GeometryManager } from './geometry_manager.js';
import { get } from 'svelte/store';
import { MockMap, type MaplibreMap } from '../../../__mocks__/map.js';
import type { StateRoot } from './state/types.js';
import type { AbstractElement } from './element/abstract.js';

describe('GeometryManager', () => {
	let map: MockMap;
	let geometryManager: GeometryManager;

	beforeEach(() => {
		map = new MockMap();
		geometryManager = new GeometryManager(map as unknown as MaplibreMap);
	});

	it('should initialize with default values', () => {
		expect(geometryManager.elements).toBeDefined();
		expect(geometryManager.map).toBe(map);
		expect(geometryManager.canvas).toBe(map.getCanvasContainer());
		expect(geometryManager.state).toBeNull();
		expect(geometryManager.selection).toBeNull();
	});

	it('should clear all elements', () => {
		const element = { destroy: vi.fn() } as unknown as AbstractElement;
		get(geometryManager.elements).push(element);
		geometryManager.clear();
		expect(element.destroy).toHaveBeenCalled();
		expect(geometryManager.elements).toBeDefined();
	});

	it('should append an element', () => {
		const element = { id: 'test-element' } as unknown as AbstractElement;
		geometryManager['appendElement'](element);
		expect(get(geometryManager.elements)).toContain(element);
	});

	it('should remove an element', () => {
		const element = { id: 'test-element' } as unknown as AbstractElement;
		get(geometryManager.elements).push(element);
		geometryManager.removeElement(element);
		expect(get(geometryManager.elements)).not.toContain(element);
	});

	it('should load a state', async () => {
		const state: StateRoot = {
			map: { center: [0, 0], radius: 1000 },
			elements: []
		};
		const clearSpy = vi.spyOn(geometryManager, 'clear');
		const setStateSpy = vi.spyOn(geometryManager, 'setState');
		// @ts-expect-error: mocking state
		geometryManager.state = { history: { reset: vi.fn() } };

		await geometryManager.loadState(state);
		expect(clearSpy).toHaveBeenCalled();
		expect(setStateSpy).toHaveBeenCalledWith(state);
		expect(geometryManager.state?.history.reset).toHaveBeenCalledWith(state);
	});

	it('should set a state and fit map bounds', async () => {
		const state: StateRoot = {
			map: { center: [0, 0], radius: 1000 },
			elements: []
		};
		await geometryManager.setState(state);
		expect(map.fitBounds).toHaveBeenCalled();
	});

	it('should return an element by index', () => {
		const element = { id: 'test-element' } as unknown as AbstractElement;
		get(geometryManager.elements).push(element);
		const result = geometryManager.getElement(0);
		expect(result).toBe(element);
	});

	it('should identify as non-interactive', () => {
		expect(geometryManager.isInteractive()).toBe(false);
	});
});
