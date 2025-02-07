import { derived, get, writable } from 'svelte/store';
import type { LayerLine } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';

export const dashArrays = new Map<string, number[] | undefined>([
	['solid', undefined],
	['dashed', [2, 4]],
	['dotted', [0, 2]]
]);

export class MapLayerLine extends MapLayer<LayerLine> {
	color = writable('#ff0000');
	dashed = writable('solid');
	width = writable(2);

	dashArray = derived(this.dashed, (dashed) => dashArrays.get(dashed) ?? [10]);

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'line',
			{
				'line-cap': 'round',
				'line-join': 'round'
			},
			{
				'line-color': Color.parse(get(this.color)).asHex(),
				'line-dasharray': get(this.dashArray),
				'line-width': get(this.width)
			}
		);

		this.color.subscribe((v) => this.updatePaint('line-color', Color.parse(v)));
		this.width.subscribe((v) => this.updatePaint('line-width', v));
		this.dashArray.subscribe((v) => this.updatePaint('line-dasharray', v));
	}
}
