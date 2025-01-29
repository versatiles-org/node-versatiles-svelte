import { Color } from '@versatiles/style';
import { AbstractElement } from './element_abstract.js';
import type maplibregl from 'maplibre-gl';
import { get, writable } from 'svelte/store';

export type Point = [number, number];

export class MarkerElement extends AbstractElement {
	private position: Point;
	private feature: GeoJSON.Feature<GeoJSON.Point>;
	public color = writable('#ff0000');

	constructor(map: maplibregl.Map, name: string, position: Point) {
		super(map, name);
		this.position = position;
		this.feature = this.addSource({ type: 'Point', coordinates: position });
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