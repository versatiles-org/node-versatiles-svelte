import type geojson from 'geojson';
import type maplibregl from 'maplibre-gl';
import { EventHandler } from '../../../utils/event_handler.js';

export type DragPoint = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | false;
// prettier-ignore
export const DragPointMap = new Map<DragPoint, { cursor: string, flipH: DragPoint, flipV: DragPoint }>([
	['n', { cursor: 'ns-resize', flipH: 'n', flipV: 's' }],
	['ne', { cursor: 'nesw-resize', flipH: 'nw', flipV: 'se' }],
	['e', { cursor: 'ew-resize', flipH: 'w', flipV: 'e' }],
	['se', { cursor: 'nwse-resize', flipH: 'sw', flipV: 'ne' }],
	['s', { cursor: 'ns-resize', flipH: 's', flipV: 'n' }],
	['sw', { cursor: 'nesw-resize', flipH: 'se', flipV: 'nw' }],
	['w', { cursor: 'ew-resize', flipH: 'e', flipV: 'w' }],
	['nw', { cursor: 'nwse-resize', flipH: 'ne', flipV: 'sw' }],
	[false, { cursor: 'default', flipH: false, flipV: false }],
])

export type BBox = [number, number, number, number];
const worldBBox: BBox = [-180, -85, 180, 85];

export class BBoxDrawer extends EventHandler<{ drag: BBox; dragEnd: BBox }> {
	private sourceId: string;
	private dragPoint: DragPoint = false;
	private isDragging = false;
	private map: maplibregl.Map;
	private canvas: HTMLElement;

	private insideOut: boolean;
	#bbox: BBox;

	constructor(map: maplibregl.Map, initialBBox: BBox, color: string, insideOut?: boolean) {
		super();
		this.#bbox = [...initialBBox];
		this.insideOut = insideOut ?? true;
		this.map = map;

		this.sourceId = 'bbox_' + Math.random().toString(36).slice(2);

		map.addSource(this.sourceId, { type: 'geojson', data: this.getAsFeatureCollection() });
		map.addLayer({
			id: 'bbox-line_' + Math.random().toString(36).slice(2),
			type: 'line',
			source: this.sourceId,
			filter: ['==', '$type', 'LineString'],
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: { 'line-color': color }
		});
		map.addLayer({
			id: 'bbox-fill_' + Math.random().toString(36).slice(2),
			type: 'fill',
			source: this.sourceId,
			filter: ['==', '$type', 'Polygon'],
			layout: {},
			paint: { 'fill-color': color, 'fill-opacity': 0.2 }
		});

		this.canvas = map.getCanvasContainer();

		map.on('mousemove', (e) => {
			if (e.originalEvent.buttons % 2 === 0) return this.checkDragPointAt(e.point);
			if (!this.isDragging) return;
			if (!this.dragPoint) return this.checkDragPointAt(e.point);

			this.doDrag(e.lngLat);
			this.redraw();
			e.preventDefault();
			this.emit('drag', [...this.#bbox]);
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
			this.emit('dragEnd', [...this.#bbox]);
		});
	}

	private updateDragPoint(dragPoint: DragPoint) {
		if (this.dragPoint === dragPoint) return;
		this.dragPoint = dragPoint;
		this.canvas.style.cursor = this.getCursor(dragPoint);
	}

	private getAsFeatureCollection(): geojson.FeatureCollection {
		const ring = getRing(this.#bbox);
		return {
			type: 'FeatureCollection',
			features: [this.insideOut ? polygon(getRing(worldBBox), ring) : polygon(ring), linestring(ring)]
		};

		function getRing(bbox: BBox): geojson.Position[] {
			const x0 = Math.min(bbox[0], bbox[2]);
			const x1 = Math.max(bbox[0], bbox[2]);
			const y0 = Math.min(bbox[1], bbox[3]);
			const y1 = Math.max(bbox[1], bbox[3]);
			// prettier-ignore
			return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
		}

		function polygon(...coordinates: geojson.Position[][]): geojson.Feature<geojson.Polygon> {
			return { type: 'Feature', geometry: { type: 'Polygon', coordinates }, properties: {} };
		}

		function linestring(coordinates: geojson.Position[]): geojson.Feature<geojson.LineString> {
			return { type: 'Feature', geometry: { type: 'LineString', coordinates }, properties: {} };
		}
	}

	public set bbox(bbox: BBox) {
		if (isSameBBox(this.#bbox, bbox)) return;
		this.#bbox = [...bbox];
		this.redraw();
	}

	public get bbox(): BBox {
		return [...this.#bbox];
	}

	private redraw(): void {
		const source = this.map.getSource(this.sourceId);
		if (!source || source.type !== 'geojson') return;
		(source as maplibregl.GeoJSONSource).setData(this.getAsFeatureCollection());
	}

	private getAsPixel(): BBox {
		const bbox = this.#bbox;
		const p0 = this.map.project([bbox[0], bbox[1]]);
		const p1 = this.map.project([bbox[2], bbox[3]]);
		return [Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.max(p0.x, p1.x), Math.max(p0.y, p1.y)];
	}

	private checkDragPointAt(point: maplibregl.Point): void {
		const maxDistance = 5;

		const { x, y } = point;
		const [x0, y0, x1, y1] = this.getAsPixel();

		// Don't think outside the box
		if (x < x0 - maxDistance) return this.updateDragPoint(false);
		if (x > x1 + maxDistance) return this.updateDragPoint(false);
		if (y < y0 - maxDistance) return this.updateDragPoint(false);
		if (y > y1 + maxDistance) return this.updateDragPoint(false);

		let dragX = (Math.abs(x0 - x) < maxDistance ? 1 : 0) + (Math.abs(x1 - x) < maxDistance ? 2 : 0);
		let dragY = (Math.abs(y0 - y) < maxDistance ? 1 : 0) + (Math.abs(y1 - y) < maxDistance ? 2 : 0);

		if (dragX === 3) dragX = Math.abs(x0 - x) < Math.abs(x1 - x) ? 1 : 2;
		if (dragY === 3) dragY = Math.abs(y0 - y) < Math.abs(y1 - y) ? 1 : 2;

		const directions: DragPoint[] = [false, 'w', 'e', 'n', 'nw', 'ne', 's', 'sw', 'se'];
		this.updateDragPoint(directions[dragX + dragY * 3]);
	}

	private getCursor(drag: DragPoint): string {
		return DragPointMap.get(drag)?.cursor ?? 'default';
	}

	private doDrag(lngLat: maplibregl.LngLat): void {
		this.#bbox = ((bbox) => {
			const x = Math.round(lngLat.lng * 1e3) / 1e3;
			const y = Math.round(lngLat.lat * 1e3) / 1e3;

			// prettier-ignore
			switch (this.dragPoint) {
				case 'n': bbox[3] = y; break;
				case 'ne': bbox[2] = x; bbox[3] = y; break;
				case 'e': bbox[2] = x; break;
				case 'se': bbox[2] = x; bbox[1] = y; break;
				case 's': bbox[1] = y; break;
				case 'sw': bbox[0] = x; bbox[1] = y; break;
				case 'w': bbox[0] = x; break;
				case 'nw': bbox[0] = x; bbox[3] = y; break;
				default: return bbox;
			}

			if (bbox[2] < bbox[0]) {
				// flip horizontal
				bbox = [bbox[2], bbox[1], bbox[0], bbox[3]];
				this.updateDragPoint(DragPointMap.get(this.dragPoint)?.flipH ?? false);
			}

			if (bbox[3] < bbox[1]) {
				// flip vertical
				bbox = [bbox[0], bbox[3], bbox[2], bbox[1]];
				this.updateDragPoint(DragPointMap.get(this.dragPoint)?.flipV ?? false);
			}
			return bbox;
		})(this.#bbox);
	}
}

export function isSameBBox(a: geojson.BBox, b: geojson.BBox) {
	return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
}
