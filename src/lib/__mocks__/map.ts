import { vi, type Mock } from 'vitest';
import maplibre from 'maplibre-gl';

const mockedCanvas = { style: { cursor: 'default' } } as HTMLElement;

type Callback = (data: unknown) => void;

export class MockMap {
	private zoom = 5;
	private center = new LngLat(1, 2);
	private events: { event: string; callback: Callback }[] = [];

	constructor() {}
	getCanvasContainer = vi.fn(() => mockedCanvas);
	addSource = vi.fn();
	removeSource = vi.fn();
	getSource = vi.fn(() => ({ setData: vi.fn() }) as unknown) as Mock<MaplibreMap['getSource']>;
	addLayer = vi.fn();
	on = vi.fn((event: string, ...rest: unknown[]) => this.events.push({ event, callback: rest.pop() as Callback }));
	once = vi.fn((event: string, ...rest: unknown[]) => this.events.push({ event, callback: rest.pop() as Callback }));
	off = vi.fn(
		(event: string, callback: Callback) =>
			(this.events = this.events.filter((e) => e.event !== event && e.callback !== callback))
	);
	emit = vi.fn((event: string, data?: unknown) => this.events.forEach((e) => e.event === event && e.callback(data)));
	setZoom = vi.fn((zoom) => (this.zoom = zoom));
	getZoom = vi.fn(() => this.zoom);
	setCenter = vi.fn((center: maplibre.LngLat) => (this.center = center));
	getCenter = vi.fn(() => this.center);
	queryRenderedFeatures = vi.fn(() => [{ properties: {} }]) as Mock<MaplibreMap['queryRenderedFeatures']>;
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
	getBounds = vi.fn(() => {
		const dy = 90 * Math.pow(0.5, this.zoom);
		const dx = dy * Math.cos((this.center.lat * Math.PI) / 180);
		const bounds = new LngLatBounds(
			[this.center.lng - dx, this.center.lat - dy],
			[this.center.lng + dx, this.center.lat + dy]
		);
		return bounds;
	});
	fitBounds = vi.fn();
	setStyle = vi.fn();
	isStyleLoaded = vi.fn(() => true);
}

export type MaplibreMap = maplibre.Map;
export const LngLat = maplibre.LngLat;
export const LngLatBounds = maplibre.LngLatBounds;
export const Point = maplibre.Point;
