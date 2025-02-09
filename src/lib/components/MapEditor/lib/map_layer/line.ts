import { derived, get, writable } from 'svelte/store';
import type { LayerLine } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';
import { defaultState } from '../state/index.js';

export const dashArrays = new Map<number, { name: string; array: number[] | undefined }>([
	[0, { name: 'solid', array: [100] }],
	[1, { name: 'dashed', array: [2, 4] }],
	[2, { name: 'dotted', array: [0, 2] }]
]);

export class MapLayerLine extends MapLayer<LayerLine> {
	color = writable('#ff0000');
	dashed = writable(0);
	visible = writable(true);
	width = writable(2);

	dashArray = derived(this.dashed, (dashed) => dashArrays.get(dashed)?.array ?? [100]);

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'line',
			{
				'line-cap': 'round',
				'line-join': 'round',
				visibility: get(this.visible) ? 'visible' : 'none'
			},
			{
				'line-color': Color.parse(get(this.color)).asHex(),
				'line-dasharray': get(this.dashArray),
				'line-width': get(this.width)
			}
		);

		this.color.subscribe((v) => {
			this.updatePaint('line-color', Color.parse(v));
			this.manager.saveState();
		});
		this.dashArray.subscribe((v) => {
			this.updatePaint('line-dasharray', v);
			this.manager.saveState();
		});
		this.visible.subscribe((v) => {
			this.updateLayout('visibility', v ? 'visible' : 'none');
			this.manager.saveState();
		});
		this.width.subscribe((v) => {
			this.updatePaint('line-width', v);
			this.manager.saveState();
		});
	}

	getState(): StateObject | undefined {
		return defaultState(
			{
				color: get(this.color),
				pattern: get(this.dashed),
				visible: get(this.visible),
				width: get(this.width)
			},
			{
				color: '#ff0000',
				pattern: 0,
				visible: true,
				width: 2
			}
		);
	}

	setState(state: StateObject) {
		if (state.color) this.color.set(state.color);
		if (state.pattern) this.dashed.set(state.pattern);
		if (state.visible) this.visible.set(state.visible);
		if (state.width) this.width.set(state.width);
	}
}
