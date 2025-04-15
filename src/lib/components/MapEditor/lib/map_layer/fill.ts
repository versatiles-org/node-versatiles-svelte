import { get, writable } from 'svelte/store';
import type { LayerFill } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateStyle } from '../state/types.js';
import { removeDefaultFields } from '../utils.js';

const size = 32;

interface Fill {
	xf: number;
	yf: number;
	pattern: string;
}

export const fillPatterns = new Map<number, { name: string; fill: Fill | undefined }>([
	[0, { name: 'solid', fill: undefined }],
	[1, { name: 'diagonal', fill: { xf: 1, yf: 1, pattern: '00002552' } }],
	[2, { name: 'diagonal-thin', fill: { xf: 1, yf: 1, pattern: '0252' } }]
]);

export class MapLayerFill extends MapLayer<LayerFill> {
	color = writable('#ff0000');
	opacity = writable(1);
	pattern = writable(0);

	static readonly defaultStyle: StateStyle = {
		color: '#ff0000',
		opacity: 1,
		pattern: 0
	};

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'fill',
			{},
			{
				'fill-color': Color.parse(get(this.color)).asHex(),
				'fill-opacity': get(this.opacity)
			}
		);

		const updatePattern = () => {
			const fill = fillPatterns.get(get(this.pattern))?.fill ?? undefined;
			const color = Color.parse(get(this.color));

			if (fill == null) {
				this.updatePaint('fill-color', color);
				this.updatePaint('fill-pattern', undefined);
				return;
			}

			const { xf, yf, pattern: p } = fill;
			const alpha = p.split('').map((c) => parseInt(c, 10) * 51);
			const length = alpha.length;

			const data = new Uint8ClampedArray(size * size * 4);
			const c = color.asRGB().asArray();

			for (let y = 0; y < size; y++) {
				for (let x = 0; x < size; x++) {
					const v = x * xf + y * yf;
					const i = (y * size + x) * 4;
					data[i] = c[0];
					data[i + 1] = c[1];
					data[i + 2] = c[2];
					data[i + 3] = alpha[v % length];
				}
			}

			const name = 'fill-pattern-' + this.id;
			if (this.map.hasImage(name)) this.map.removeImage(name);
			this.map.addImage(name, { width: size, height: size, data });
			this.updatePaint('fill-pattern', name);
		};

		this.color.subscribe(() => updatePattern());
		this.pattern.subscribe(() => updatePattern());
		this.opacity.subscribe((value) => this.updatePaint('fill-opacity', value));
	}

	getState(): StateStyle | undefined {
		return removeDefaultFields(
			{
				color: get(this.color),
				opacity: get(this.opacity),
				pattern: get(this.pattern)
			},
			MapLayerFill.defaultStyle
		);
	}

	setState(state: StateStyle) {
		if (state.color) this.color.set(state.color);
		if (state.opacity) this.opacity.set(state.opacity);
		if (state.pattern) this.pattern.set(state.pattern);
	}

	getGeoJSONProperties(): GeoJSON.GeoJsonProperties {
		return {
			'fill-color': get(this.color),
			'fill-opacity': get(this.opacity),
			'fill-pattern': fillPatterns.get(get(this.pattern))?.name
		};
	}

	setGeoJSONProperties(properties: GeoJSON.GeoJsonProperties): void {
		if (properties == null) return;
		if (properties['fill-color']) this.color.set(properties['fill-color']);
		if (properties['fill-opacity']) this.opacity.set(properties['fill-opacity']);
		if (properties['fill-pattern']) {
			const pattern = fillPatterns
				.entries()
				.find(([, { name }]) => name === properties['fill-pattern']);
			if (pattern) this.pattern.set(pattern[0]);
		}
	}
}
