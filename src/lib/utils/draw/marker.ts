import type geojson from 'geojson';
import type { AbstractLayerStyle, SymbolStyle } from './style.js';
import { AbstractDrawer } from './abstract.js';
import { getSymbolStyle } from './style.js';
import type { SymbolLayerSpecification } from 'maplibre-gl';

const maplibregl = await import('maplibre-gl');
const { LngLatBounds } = maplibregl;
export type Point = [number, number];

export class MarkerDrawer extends AbstractDrawer<geojson.BBox> {
	private source?: maplibregl.GeoJSONSource;
	private isDragging = false;
	private dragPoint = false;
	private map: maplibregl.Map;
	private canvas: HTMLElement;

	private symbolStyle: AbstractLayerStyle<SymbolLayerSpecification>;
	private point: Point;

	constructor(map: maplibregl.Map, options?: { point?: Point } & SymbolStyle) {
		super();
		const center = map.getCenter();
		this.point = options?.point ?? [center.lng, center.lat];
		this.symbolStyle = getSymbolStyle(options);
		this.map = map;

		const sourceId = 'marker_' + Math.random().toString(36).slice(2);

		if (this.source) throw new Error('BBoxDrawer already added to map');
		map.addSource(sourceId, { type: 'geojson', data: this.getAsFeatureCollection() });
		map.addLayer({
			id: 'marker_' + Math.random().toString(36).slice(2),
			type: 'symbol',
			source: sourceId,
			filter: ['==', '$type', 'Point'],
			...this.symbolStyle
		});
		this.source = map.getSource(sourceId);

		this.canvas = map.getCanvasContainer();

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
		this.source?.setData(this.getAsFeatureCollection());
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
