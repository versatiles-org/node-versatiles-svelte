import { writable, type Writable } from 'svelte/store';
import type { AbstractElement } from '../element/abstract.js';
import type { StateRoot } from '../state/types.js';
import { vi } from 'vitest';
import { MockMap } from '../../../../__mocks__/map.js';
import { MockCursor } from './cursor.js';

export class MockGeometryManager {
	public readonly elements: Writable<AbstractElement[]> = writable([]);
	public readonly activeElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly map = new MockMap();
	public readonly cursor = new MockCursor();

	constructor() {}

	public setActiveElement = vi.fn();
	public getState = vi.fn((): StateRoot => ({ map_center: [0, 0], map_zoom: 10, elements: [] }));
	public setState = vi.fn();
	public getElement = vi.fn(
		(index: number): AbstractElement => ({ index }) as unknown as AbstractElement
	);
	public addNewMarker = vi.fn(() => ({}) as AbstractElement);
	public addNewLine = vi.fn(() => ({}) as AbstractElement);
	public addNewPolygon = vi.fn(() => ({}) as AbstractElement);
	public removeElement = vi.fn();
	public drawSelectionNodes = vi.fn();
}
