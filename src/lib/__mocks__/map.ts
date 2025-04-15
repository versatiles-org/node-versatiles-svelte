import { vi } from 'vitest';
import maplibre from 'maplibre-gl';

export class MockMap {
	private zoom = 5;
	private center = new LngLat(1, 2);

	constructor() {}
	getCanvasContainer = vi.fn(() => ({ style: { cursor: 'default' } }) as HTMLElement);
	addSource = vi.fn();
	removeSource = vi.fn();
	getSource = vi.fn(() => ({ setData: vi.fn() })) as unknown as MaplibreMap['getSource'];
	addLayer = vi.fn();
	on = vi.fn();
	once = vi.fn();
	setZoom = vi.fn((zoom) => (this.zoom = zoom));
	getZoom = vi.fn(() => this.zoom);
	setCenter = vi.fn((center: maplibre.LngLat) => (this.center = center));
	getCenter = vi.fn(() => this.center);
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
