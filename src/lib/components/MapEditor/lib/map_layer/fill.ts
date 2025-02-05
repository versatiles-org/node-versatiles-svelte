import { get, writable } from 'svelte/store';
import type { LayerFill } from '../types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';

export class MapLayerFill extends MapLayer<LayerFill> {
	public readonly style = {
		color: writable('#ff0000'),
		opacity: writable(1)
	};

	constructor(map: maplibregl.Map, id: string, source: string) {
		super(map, id);

		this.addLayer(
			source,
			'fill',
			{},
			{
				'fill-color': Color.parse(get(this.style.color)).asString(),
				'fill-opacity': get(this.style.opacity)
			}
		);

		this.style.color.subscribe((value) => this.updatePaint('fill-color', Color.parse(value)));
		this.style.opacity.subscribe((value) => this.updatePaint('fill-opacity', value));
	}
}
