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
	public size = writable(1);

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
			'icon-size': get(this.size),
			'icon-overlap': 'always',
		})

		this.color.subscribe((value) => layer.updatePaint('icon-color', Color.parse(value)));
		this.size.subscribe((value) => layer.updateLayout('icon-size', value));

		map.on('mousemove', layer.id, (e) => {
			if (!this.isDragging) return;

			this.position = [
				Math.round(e.lngLat.lng * 1e5) / 1e5,
				Math.round(e.lngLat.lat * 1e5) / 1e5
			];

			this.source.setData(this.getFeature());
			e.preventDefault();
		});

		map.on('mousedown', layer.id, (e) => {
			if (this.isDragging) return;
			if (e.originalEvent.buttons % 2) {
				this.isDragging = true;
				e.preventDefault();
			}
		});

		map.on('mouseup', layer.id, () => {
			this.isDragging = false;
		});

		map.on('mouseenter', layer.id, () => this.canvas.style.cursor = 'move')
		map.on('mouseleave', layer.id, () => this.canvas.style.cursor = 'default')
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