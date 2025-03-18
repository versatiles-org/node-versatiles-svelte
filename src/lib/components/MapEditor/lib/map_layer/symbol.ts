import { derived, get, writable, type Writable } from 'svelte/store';
import type { LayerSymbol } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';
import { getSymbol, getSymbolIndexByName } from '../symbols.js';
import { removeDefaultFields } from '../utils.js';

interface LabelAlign {
	index: 0 | 1 | 2 | 3;
	name: string;
	value: 'bottom' | 'left' | 'right' | 'top';
}

export const labelPositions: LabelAlign[] = [
	{ index: 0, name: 'right', value: 'left' },
	{ index: 1, name: 'left', value: 'right' },
	{ index: 2, name: 'top', value: 'bottom' },
	{ index: 3, name: 'bottom', value: 'top' }
];

const defaultStyle: {
	color: string;
	rotate: number;
	size: number;
	halo: number;
	pattern: number;
	label: string;
	align: LabelAlign['index'];
} = {
	color: '#ff0000',
	rotate: 0,
	size: 1,
	halo: 1,
	pattern: 38,
	label: '',
	align: 0
};

export class MapLayerSymbol extends MapLayer<LayerSymbol> {
	color = writable(defaultStyle.color);
	halo = writable(defaultStyle.halo);
	rotate = writable(defaultStyle.rotate);
	size = writable(defaultStyle.size);
	symbolIndex = writable(defaultStyle.pattern);
	label = writable(defaultStyle.label);
	labelAlign = writable<LabelAlign['index']>(defaultStyle.align);

	symbolInfo = derived(this.symbolIndex, (index) => getSymbol(index));

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'symbol',
			{
				'icon-image': get(this.symbolInfo).image,
				'icon-offset': get(this.symbolInfo).offset,
				'icon-overlap': 'always',
				'icon-rotate': defaultStyle.rotate,
				'icon-size': defaultStyle.size,

				'text-field': defaultStyle.label,
				'text-font': ['noto_sans_regular'],
				'text-justify': 'left',
				'text-optional': true,
				'text-radial-offset': 0.7,
				'text-anchor': lookupLabelAlign(defaultStyle.align).value
			},
			{
				'icon-color': defaultStyle.color,
				'icon-halo-blur': 0,
				'icon-halo-color': '#FFFFFF',
				'icon-halo-width': defaultStyle.halo,
				'icon-opacity': 1,
				'text-halo-blur': 0,
				'text-halo-color': '#FFFFFF',
				'text-halo-width': defaultStyle.halo
			}
		);

		this.color.subscribe((v) => {
			this.updatePaint('icon-color', Color.parse(v));
			this.manager.saveState();
		});
		this.halo.subscribe((v) => {
			this.updatePaint('icon-halo-width', v);
			this.updatePaint('text-halo-width', v);
			this.manager.saveState();
		});
		this.label.subscribe((v) => {
			this.updateLayout('text-field', v);
			this.manager.saveState();
		});
		this.labelAlign.subscribe((v) => {
			this.updateLayout('text-anchor', lookupLabelAlign(v).value);
			this.manager.saveState();
		});
		this.rotate.subscribe((v) => {
			this.updateLayout('icon-rotate', v);
			this.manager.saveState();
		});
		this.size.subscribe((v) => {
			this.updateLayout('icon-size', v);
			this.updateLayout('text-size', v * 16);
			this.manager.saveState();
		});
		this.symbolInfo.subscribe((v) => {
			if (v.image == null) {
				this.updateLayout('icon-image', undefined);
				this.updateLayout('text-anchor', 'center');
			} else {
				this.updateLayout('icon-image', v.image);
				this.updateLayout('text-anchor', lookupLabelAlign(this.labelAlign).value);
				this.updateLayout('icon-offset', v.offset);
			}
			this.manager.saveState();
		});
	}

	getState(): StateObject | undefined {
		return removeDefaultFields(
			{
				color: get(this.color),
				rotate: get(this.rotate),
				size: get(this.size),
				halo: get(this.halo),
				pattern: get(this.symbolIndex),
				label: get(this.label),
				align: get(this.labelAlign)
			},
			defaultStyle
		);
	}

	setState(state: StateObject) {
		if (state.color) this.color.set(state.color);
		if (state.rotate) this.rotate.set(state.rotate);
		if (state.size) this.size.set(state.size);
		if (state.halo) this.halo.set(state.halo);
		if (state.pattern) this.symbolIndex.set(state.pattern);
		if (state.label) this.label.set(state.label);
		if (state.align) this.labelAlign.set(lookupLabelAlign(state.align).index);
	}

	getGeoJSONProperties(): GeoJSON.GeoJsonProperties {
		return {
			'symbol-color': get(this.color),
			'symbol-halo-width': get(this.halo),
			'symbol-rotate': get(this.rotate),
			'symbol-size': get(this.size),
			'symbol-pattern': get(this.symbolInfo).name,
			'symbol-label': get(this.label),
			'symbol-label-align': lookupLabelAlign(this.labelAlign).name
		};
	}

	setGeoJSONProperties(properties: GeoJSON.GeoJsonProperties): void {
		if (properties == null) return;
		if (properties['symbol-color']) this.color.set(properties['symbol-color']);
		if (properties['symbol-halo-width']) this.halo.set(properties['symbol-halo-width']);
		if (properties['symbol-rotate']) this.rotate.set(properties['symbol-rotate']);
		if (properties['symbol-size']) this.size.set(properties['symbol-size']);
		if (properties['symbol-label']) this.label.set(properties['symbol-label']);
		if (properties['symbol-label-align'])
			this.labelAlign.set(lookupLabelAlign(properties['symbol-label-align']).index);
		if (properties['symbol-pattern']) {
			const index = getSymbolIndexByName(properties['symbol-pattern']);
			if (index != null) this.symbolIndex.set(index);
		}
	}
}

function lookupLabelAlign(index: number | string | Writable<LabelAlign['index']>): LabelAlign {
	let pos;

	if (typeof index === 'object') {
		index = get(index);
	}

	if (typeof index === 'number') {
		pos = labelPositions.find((p) => p.index === index);
	} else if (typeof index === 'string') {
		pos = labelPositions.find((p) => p.name === index);
	}

	if (pos == null) return labelPositions[0];
	return pos;
}
