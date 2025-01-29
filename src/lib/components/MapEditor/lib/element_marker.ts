import { Color } from '@versatiles/style';
import { AbstractElement } from './element_abstract.js';
import type maplibregl from 'maplibre-gl';
import { get, writable } from 'svelte/store';
import type { GeoJSONSource } from 'maplibre-gl';

export type Point = [number, number];

export class MarkerElement extends AbstractElement {
	private position: Point;
	private source: GeoJSONSource;
	private isDragging = false;
	private dragPoint = false;
	public color = writable('#ff0000');

	constructor(map: maplibregl.Map, name: string, position: Point) {
		super(map, name);
		this.position = position;
		this.source = this.addSource(this.getFeature());
		const layer = this.addSymbolLayer();
		layer.setPaint({
			'icon-color': Color.parse(get(this.color)).asString(),
			'icon-halo-color': Color.parse('#fff').asString(),
			'icon-halo-width': 0.5,
			'icon-halo-blur': 0,
			'icon-opacity': 1,
		})
		layer.setLayout({
			'icon-image': 'basics:icon-embassy',
		})

		this.color.subscribe((value) => layer.updatePaint('icon-color', Color.parse(value)));

		map.on('mousemove', (e) => {
			if (e.originalEvent.buttons % 2 === 0) return this.checkDragPointAt(e.point);
			if (!this.isDragging) return;
			if (!this.dragPoint) return this.checkDragPointAt(e.point);


			this.position = [
				Math.round(e.lngLat.lng * 1e5) / 1e5,
				Math.round(e.lngLat.lat * 1e5) / 1e5
			];


			this.source.setData(this.getFeature());
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

	private checkDragPointAt(point: maplibregl.Point): void {
		const maxDistance = 5;

		const { x, y } = point;

		const p = this.map.project([this.position[0], this.position[1]]);

		const distance = Math.sqrt(Math.pow(x - p.x, 2) + Math.pow(y - p.y, 2));

		this.updateDragPoint(distance < maxDistance);
	}

	private updateDragPoint(dragPoint: boolean) {
		if (this.dragPoint === dragPoint) return;
		this.dragPoint = dragPoint;
		this.canvas.style.cursor = dragPoint ? 'move' : 'default';
	}

	getFeature(): GeoJSON.Feature<GeoJSON.Point> {
		return {
			type: 'Feature',
			properties: {},
			geometry: {
				type: 'Point',
				coordinates: this.position
			}
		}
	}
}