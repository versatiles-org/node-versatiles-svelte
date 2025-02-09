import { vi } from 'vitest';

export class MockMap {
	getCanvasContainer = vi.fn(() => ({ style: { cursor: 'default' } }));
	addSource = vi.fn();
	removeSource = vi.fn();
	getSource = vi.fn(() => ({ setData: vi.fn() }));
	addLayer = vi.fn();
	on = vi.fn();
	setCenter = vi.fn();
	setZoom = vi.fn();
	getZoom = vi.fn(() => 10);
	getCenter = vi.fn(() => ({ lng: 0, lat: 0 }));
	queryRenderedFeatures = vi.fn(() => [{ properties: {} }]);
	setPaintProperty = vi.fn();
	setLayoutProperty = vi.fn();
	removeLayer = vi.fn();
	hasImage = vi.fn();
	removeImage = vi.fn();
	addImage = vi.fn();
	getBounds = vi.fn(() => ({
		getWest: () => -180,
		getEast: () => 180,
		getSouth: () => -90,
		getNorth: () => 90
	}));
}
