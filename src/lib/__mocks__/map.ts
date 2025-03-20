import { vi } from 'vitest';
import maplibre from 'maplibre-gl';

export class MockMap {
	constructor() {}
	getCanvasContainer = vi.fn(() => ({ style: { cursor: 'default' } }) as HTMLElement);
	addSource = vi.fn();
	removeSource = vi.fn();
	getSource = vi.fn(() => ({ setData: vi.fn() })) as unknown as MaplibreMap['getSource'];
	addLayer = vi.fn();
	on = vi.fn();
	once = vi.fn();
	setCenter = vi.fn();
	setZoom = vi.fn();
	getZoom = vi.fn(() => 10);
	getCenter = vi.fn(() => new LngLat(0, 0));
	queryRenderedFeatures = vi.fn(() => [
		{ properties: {} }
	]) as unknown as MaplibreMap['queryRenderedFeatures'];
	setPaintProperty = vi.fn();
	setLayoutProperty = vi.fn();
	removeLayer = vi.fn();
	hasImage = vi.fn();
	removeImage = vi.fn();
	getImage = vi.fn();
	addImage = vi.fn();
	project = vi.fn((lnglat: maplibre.LngLatLike) => {
		const c = LngLat.convert(lnglat);
		return new Point(c.lng, Math.sin(c.lat / 1000) * 1000);
	});
	getBounds = vi.fn(() => new LngLatBounds([-180, -90, 180, 90]));
}

export type MaplibreMap = maplibre.Map;
export const LngLat = maplibre.LngLat;
export const LngLatBounds = maplibre.LngLatBounds;
export const Point = maplibre.Point;
