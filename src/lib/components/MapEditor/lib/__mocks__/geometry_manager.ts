import { writable, type Writable } from 'svelte/store';
import type { AbstractElement } from '../element/abstract.js';
import type { StateObject } from '../state/types.js';
import { vi } from 'vitest';

export class MockGeometryManager {
	public readonly elements: Writable<AbstractElement[]> = writable([]);
	public readonly activeElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly map = {
		getCanvasContainer: vi.fn(() => ({})),
		addSource: vi.fn(),
		removeSource: vi.fn(),
		getSource: vi.fn(() => ({ setData: vi.fn() })),
		addLayer: vi.fn(),
		on: vi.fn(),
		setCenter: vi.fn(),
		setZoom: vi.fn(),
		getZoom: vi.fn(() => 10),
		getCenter: vi.fn(() => ({ lng: 0, lat: 0 })),
		queryRenderedFeatures: vi.fn(() => [{ properties: {} }]),
		setPaintProperty: vi.fn(),
		setLayoutProperty: vi.fn(),
		removeLayer: vi.fn(),
		hasImage: vi.fn(),
		removeImage: vi.fn(),
		addImage: vi.fn(),
		getBounds: vi.fn(() => ({
			getWest: () => -180,
			getEast: () => 180,
			getSouth: () => -90,
			getNorth: () => 90
		}))
	};
	public readonly cursor = {
		grab: vi.fn(),
		hover: vi.fn(),
		precise: vi.fn()
	};

	constructor() {}

	public setActiveElement = vi.fn();
	public getState = vi.fn((): StateObject => ({ map: { point: [0, 0], zoom: 10 }, elements: [] }));
	public saveState = vi.fn();
	public loadState = vi.fn();
	public getElement = vi.fn(
		(index: number): AbstractElement => ({ index }) as unknown as AbstractElement
	);
	public addNewMarker = vi.fn(() => ({}) as AbstractElement);
	public addNewLine = vi.fn(() => ({}) as AbstractElement);
	public addNewPolygon = vi.fn(() => ({}) as AbstractElement);
	public deleteElement = vi.fn();
	public drawSelectionNodes = vi.fn();
}
