import { AbstractDrawer } from './abstract.js';
import type { FeatureCollection, Feature, LineString, Position, Polygon } from 'geojson';
import type geojson from 'geojson';

const maplibregl = await import('maplibre-gl');
const { LngLatBounds } = maplibregl;

export type DragPoint = 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w' | 'nw' | false;
export type BBox = [number, number, number, number];
const worldBBox: BBox = [-180, -85, 180, 85];

export class BBoxDrawer extends AbstractDrawer {
	public source?: maplibregl.GeoJSONSource;
	private bboxColor = '#000000';
	public inverted: boolean = false;
	private bbox: BBox;
	private dragPoint: DragPoint = false;
	private map: maplibregl.Map;

	constructor(map: maplibregl.Map, bbox: BBox = worldBBox) {
		super();
		this.bbox = bbox;
		this.map = map;

		const sourceId = 'bbox' + Math.random().toString(36).substr(2, 9);

		if (this.source) throw new Error('BBoxDrawer already added to map');
		map.addSource(sourceId, { type: 'geojson', data: this.getAsFeatureCollection() });
		map.addLayer({
			id: 'bbox-line',
			type: 'line',
			source: sourceId,
			filter: ['==', '$type', 'LineString'],
			layout: { 'line-cap': 'round', 'line-join': 'round' },
			paint: { 'line-color': this.bboxColor, 'line-width': 0.5 }
		});
		map.addLayer({
			id: 'bbox-fill',
			type: 'fill',
			source: sourceId,
			filter: ['==', '$type', 'Polygon'],
			paint: { 'fill-color': this.bboxColor, 'fill-opacity': 0.2 }
		});
		this.source = map.getSource(sourceId);

		const canvas = map.getCanvasContainer();

		map.on('mousemove', (e) => {
			if (this.dragPoint) {
				if (e.originalEvent.buttons % 2) {
					this.doDrag(e.lngLat);
					this.redraw();
					e.preventDefault();
				} else {
					this.dragPoint = false;
				}
			} else {
				const drag = this.getDragPoint(e.point);
				if (drag !== this.dragPoint) {
					this.dragPoint = drag;
					canvas.style.cursor = this.getCursor(drag);
				}
			}
		});

		map.on('mousedown', (e) => {
			if (e.originalEvent.buttons % 2) {
				this.dragPoint = this.getDragPoint(e.point);
				e.preventDefault();
			}
		});

		map.on('mouseup', () => {
			this.dragPoint = false;
		});
	}

	public setColor(color: string): void {
		this.bboxColor = color;
	}

	public getAsFeatureCollection(): FeatureCollection {
		const ring = getRing(this.bbox);
		return {
			type: 'FeatureCollection',
			features: [
				this.inverted ? polygon(getRing(worldBBox), ring) : polygon(ring),
				linestring(ring)
			]
		};

		function getRing(bbox: BBox): Position[] {
			const x0 = Math.min(bbox[0], bbox[2]);
			const x1 = Math.max(bbox[0], bbox[2]);
			const y0 = Math.min(bbox[1], bbox[3]);
			const y1 = Math.max(bbox[1], bbox[3]);
			// prettier-ignore
			return [[x0, y0], [x1, y0], [x1, y1], [x0, y1], [x0, y0]];
		}

		function polygon(...coordinates: Position[][]): Feature<Polygon> {
			return {
				type: 'Feature',
				geometry: { type: 'Polygon', coordinates },
				properties: {}
			};
		}

		function linestring(coordinates: Position[]): Feature<LineString> {
			return {
				type: 'Feature',
				geometry: { type: 'LineString', coordinates },
				properties: {}
			};
		}
	}

	public setBBox(bbox: geojson.BBox): void {
		this.bbox = bbox.slice(0, 4) as BBox;
		this.redraw();
	}

	public getBounds(): maplibregl.LngLatBounds {
		return new LngLatBounds(this.bbox);
	}

	public redraw(): void {
		this.source?.setData(this.getAsFeatureCollection());
	}

	private getAsPixel(): BBox {
		const p0 = this.map.project([this.bbox[0], this.bbox[1]]);
		const p1 = this.map.project([this.bbox[2], this.bbox[3]]);
		return [Math.min(p0.x, p1.x), Math.min(p0.y, p1.y), Math.max(p0.x, p1.x), Math.max(p0.y, p1.y)];
	}

	private getDragPoint(point: maplibregl.Point): DragPoint {
		const maxDistance = 5;

		const { x, y } = point;
		const [x0, y0, x1, y1] = this.getAsPixel();

		// Don't think outside the box
		if (x < x0 - maxDistance) return false;
		if (x > x1 + maxDistance) return false;
		if (y < y0 - maxDistance) return false;
		if (y > y1 + maxDistance) return false;

		let dragX = (Math.abs(x0 - x) < maxDistance ? 1 : 0) + (Math.abs(x1 - x) < maxDistance ? 2 : 0);
		let dragY = (Math.abs(y0 - y) < maxDistance ? 1 : 0) + (Math.abs(y1 - y) < maxDistance ? 2 : 0);

		if (dragX === 3) dragX = Math.abs(x0 - x) < Math.abs(x1 - x) ? 1 : 2;
		if (dragY === 3) dragY = Math.abs(y0 - y) < Math.abs(y1 - y) ? 1 : 2;

		const directions: DragPoint[] = [false, 'w', 'e', 'n', 'nw', 'ne', 's', 'sw', 'se'];
		return directions[dragX + dragY * 3];
	}

	private getCursor(drag: DragPoint): string {
		// prettier-ignore
		switch (drag) {
			case 'n':
			case 's': return 'ns-resize';
			case 'e':
			case 'w': return 'ew-resize';
			case 'nw':
			case 'se': return 'nwse-resize';
			case 'ne':
			case 'sw': return 'nesw-resize';
		}
		return 'default';
	}

	private doDrag(lngLat: maplibregl.LngLat): void {
		const x = Math.round(lngLat.lng * 1e3) / 1e3;
		const y = Math.round(lngLat.lat * 1e3) / 1e3;
		
		// prettier-ignore
		switch (this.dragPoint) {
			case 'n': this.bbox[3] = y; break;
			case 'ne': this.bbox[2] = x; this.bbox[3] = y; break;
			case 'e': this.bbox[2] = x; break;
			case 'se': this.bbox[2] = x; this.bbox[1] = y; break;
			case 's': this.bbox[1] = y; break;
			case 'sw': this.bbox[0] = x; this.bbox[1] = y; break;
			case 'w': this.bbox[0] = x; break;
			case 'nw': this.bbox[0] = x; this.bbox[3] = y; break;
			default: return;
		}

		if (this.bbox[2] < this.bbox[0]) {
			// flip horizontal
			this.bbox = [this.bbox[2], this.bbox[1], this.bbox[0], this.bbox[3]];
			
			// prettier-ignore
			switch (this.dragPoint) {
				case 'ne': this.dragPoint = 'nw'; break;
				case 'nw': this.dragPoint = 'ne'; break;
				case 'se': this.dragPoint = 'sw'; break;
				case 'sw': this.dragPoint = 'se'; break;
				case 'e': this.dragPoint = 'w'; break;
				case 'w': this.dragPoint = 'e'; break;
			}
		}

		if (this.bbox[3] < this.bbox[1]) {
			// flip vertical
			this.bbox = [this.bbox[0], this.bbox[3], this.bbox[2], this.bbox[1]];
			
			// prettier-ignore
			switch (this.dragPoint) {
				case 'ne': this.dragPoint = 'se'; break;
				case 'nw': this.dragPoint = 'sw'; break;
				case 'se': this.dragPoint = 'ne'; break;
				case 'sw': this.dragPoint = 'nw'; break;
				case 'e': this.dragPoint = 'e'; break;
				case 'w': this.dragPoint = 'w'; break;
			}
		}
	}
}
