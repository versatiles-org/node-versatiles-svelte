
/*
import type geojson from 'geojson';
import { AbstractDrawer } from '../../../utils/draw/abstract.js';
import { SymbolStyle } from './style.js';

const maplibregl = await import('maplibre-gl');
const { LngLatBounds } = maplibregl;
export type Point = [number, number];

export class MarkerDrawer extends AbstractDrawer<geojson.BBox> {
	private source: maplibregl.GeoJSONSource;
	private layerId: string;
	private isDragging = false;
	private dragPoint = false;
	private map: maplibregl.Map;
	private canvas: HTMLElement;

	public readonly style = new SymbolStyle();
	private point: Point;

	constructor(map: maplibregl.Map, options?: { point?: Point }) {
		super();
		const center = map.getCenter();
		this.point = options?.point ?? [center.lng, center.lat];
		this.map = map;

		const sourceId = 'marker_' + Math.random().toString(36).slice(2);
		this.layerId = 'layer_' + sourceId;

		map.addSource(sourceId, { type: 'geojson', data: this.getAsFeatureCollection() });
		this.source = map.getSource(sourceId)!;

		map.addLayer({
			id: this.layerId,
			type: 'symbol',
			source: sourceId,
			filter: ['==', '$type', 'Point'],
			...this.style.getLayerSpecifcation()
		});

		this.canvas = map.getCanvasContainer();

		this.style.subscribe(() => this.redraw())

		map.on('mousemove', (e) => {
			if (e.originalEvent.buttons % 2 === 0) return this.checkDragPointAt(e.point);
			if (!this.isDragging) return;
			if (!this.dragPoint) return this.checkDragPointAt(e.point);

			this.doDrag(e.lngLat);
			this.redraw();
			e.preventDefault();
		});

		map.on('mousedown', (e) => {
			if (this.isDragging) return;
			if (e.originalEvent.buttons % 2) {
				this.checkDragPointAt(e.point);
				if (this.dragPoint) this.isDragging = true;
				if (this.isDragging) e.preventDefault();
			}
		});

		map.on('mouseup', () => {
			this.isDragging = false;
			this.updateDragPoint(false);
		});
	}

	private updateDragPoint(dragPoint: boolean) {
		if (this.dragPoint === dragPoint) return;
		this.dragPoint = dragPoint;
		this.canvas.style.cursor = dragPoint ? 'move' : 'default';
	}

	private getAsFeatureCollection(): geojson.FeatureCollection {
		return {
			type: 'FeatureCollection',
			features: [getPoint(this.point)]
		};

		function getPoint(coordinates: Point): geojson.Feature<geojson.Point> {
			return { type: 'Feature', geometry: { type: 'Point', coordinates }, properties: {} };
		}
	}

	public setGeometry(point: geojson.Position): void {
		this.point = [point[0], point[1]];
		this.redraw();
	}

	public getBounds(): maplibregl.LngLatBounds {
		return new LngLatBounds(this.point, this.point);
	}

	private redraw(): void {
		this.source.setData(this.getAsFeatureCollection());
		const spec = this.style.getLayerSpecifcation();
		for (const [key, value] of Object.entries(spec.paint)) {
			this.map.setPaintProperty(this.layerId, key, value);
		}
		for (const [key, value] of Object.entries(spec.layout)) {
			this.map.setLayoutProperty(this.layerId, key, value);
		}
	}

	private getAsPixel(): Point {
		const p = this.map.project([this.point[0], this.point[1]]);
		return [p.x, p.y];
	}

	private checkDragPointAt(point: maplibregl.Point): void {
		const maxDistance = 5;

		const { x, y } = point;
		const [x0, y0] = this.getAsPixel();

		const distance = Math.sqrt(Math.pow(x - x0, 2) + Math.pow(y - y0, 2));

		this.updateDragPoint(distance < maxDistance);
	}

	private doDrag(lngLat: maplibregl.LngLat): void {
		this.point = [Math.round(lngLat.lng * 1e5) / 1e5, Math.round(lngLat.lat * 1e5) / 1e5];
	}
}
*/