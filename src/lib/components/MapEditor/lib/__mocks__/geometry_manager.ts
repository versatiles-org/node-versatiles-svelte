import { writable, type Writable } from 'svelte/store';
import type { AbstractElement } from '../element/abstract.js';
import type { StateRoot } from '../state/types.js';
import { vi } from 'vitest';
import { MockMap } from '../../../../__mocks__/map.js';
import { MockCursor } from './cursor.js';
import { StateManager } from '../state/manager.js';
import type { GeometryManager } from '../geometry_manager.js';

export class MockGeometryManager {
	public readonly elements: Writable<AbstractElement[]> = writable([]);
	public readonly activeElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly map = new MockMap();
	public readonly cursor = new MockCursor();
	public readonly state;

	constructor() {
		this.state = new StateManager(this as unknown as GeometryManager);
	}

	public setActiveElement = vi.fn();
	public getState = vi.fn((): StateRoot => ({ map: { center: [0, 0], radius: 1000 }, elements: [] }));
	public setState = vi.fn();
	public getElement = vi.fn((index: number): AbstractElement => ({ index }) as unknown as AbstractElement);
	public addNewMarker = vi.fn(() => ({}) as AbstractElement);
	public addNewLine = vi.fn(() => ({}) as AbstractElement);
	public addNewPolygon = vi.fn(() => ({}) as AbstractElement);
	public removeElement = vi.fn();
	public drawSelectionNodes = vi.fn();
}
