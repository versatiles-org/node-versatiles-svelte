import { get, writable } from 'svelte/store';
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
	public readonly style = {
		color: writable('#ff0000'),
		dashed: writable('solid'),
		width: writable(2)
	};

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		const getDashArray = (): number[] => dashArrays.get(get(this.style.dashed)) ?? [10];

		this.addLayer(
			source,
			'line',
			{
				'line-cap': 'round',
				'line-join': 'round'
			},
			{
				'line-color': Color.parse(get(this.style.color)).asHex(),
				'line-dasharray': getDashArray(),
				'line-width': get(this.style.width)
			}
		);

		this.style.color.subscribe((value) => this.updatePaint('line-color', Color.parse(value)));
		this.style.width.subscribe((value) => this.updatePaint('line-width', value));
		this.style.dashed.subscribe(() => this.updatePaint('line-dasharray', getDashArray()));
	}
}
