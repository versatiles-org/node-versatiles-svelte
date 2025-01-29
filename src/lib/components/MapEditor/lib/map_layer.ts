import type { LayerSpecification } from 'maplibre-gl';
import type { LayerFill, LayerLine, LayerSymbol } from './types.js';
import { Color } from '@versatiles/style';

type LayerSpec = LayerFill | LayerLine | LayerSymbol;

export class MapLayer<T extends LayerSpec> {
	private map: maplibregl.Map;
	private id: string;
	private layoutProperties = {} as T['layout'];
	private paintProperties = {} as T['paint'];

	constructor(map: maplibregl.Map, id: string, source: string, type: 'symbol' | 'line' | 'fill') {
		this.map = map;
		this.id = id;

		let filter: string;
		switch (type) {
			case 'symbol': filter = 'Point'; break;
			case 'line': filter = 'LineString'; break;
			case 'fill': filter = 'Polygon'; break;
			default: throw new Error('Invalid layer type');
		}
		this.map.addLayer({
			id,
			source,
			type,
			layout: this.layoutProperties,
			paint: this.paintProperties,
			filter: ['==', '$type', filter]
		} as LayerSpecification);
	}

	setPaint(paint: T['paint']) {
		if (paint === undefined) return;
		const keys = new Set(Object.keys(paint).concat(Object.keys(this.paintProperties)) as (keyof T['paint'])[]);
		for (const key of keys.values()) this.updatePaint(key, (paint as T['paint'])[key]);
	}

	updatePaint<K extends keyof T['paint'], V extends T['paint'][K]>(key: K, value: V) {
		if (value instanceof Color) value = value.asString() as V;

		if (this.paintProperties[key] == value) return;
		this.map.setPaintProperty(this.id, key as string, value);
		this.paintProperties[key] = value;
	}

	setLayout(layout: T['layout']) {
		if (layout === undefined) return;
		const keys = new Set(Object.keys(layout).concat(Object.keys(this.layoutProperties)) as (keyof T['layout'])[]);
		for (const key of keys.values()) this.updateLayout(key, (layout as T['layout'])[key]);
	}

	updateLayout<K extends keyof T['layout'], V extends T['layout'][K]>(key: K, value: V) {
		if (this.layoutProperties[key] == value) return;
		this.map.setLayoutProperty(this.id, key as string, value);
		this.layoutProperties[key] = value;
	}
}
