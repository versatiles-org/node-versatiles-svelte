import { get, writable } from 'svelte/store';
import type { LayerFill } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';

const size = 32;

interface Pattern {
	xf: number;
	yf: number;
	pattern: string;
}

export const fillPatterns = new Map<string, Pattern | undefined>([
	['solid', undefined],
	['diagonal', { xf: 1, yf: 1, pattern: '00002552' }],
	['diagonal-thin', { xf: 1, yf: 1, pattern: '0252' }]
]);

export class MapLayerFill extends MapLayer<LayerFill> {
	public readonly style = {
		color: writable('#ff0000'),
		opacity: writable(1),
		pattern: writable('solid')
	};

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'fill',
			{},
			{
				'fill-color': Color.parse(get(this.style.color)).asHex(),
				'fill-opacity': get(this.style.opacity)
			}
		);

		const updatePattern = () => {
			const pattern = fillPatterns.get(get(this.style.pattern)) ?? undefined;
			const color = Color.parse(get(this.style.color));

			if (pattern == null) {
				this.updatePaint('fill-color', color);
				this.updatePaint('fill-pattern', undefined);
				return;
			}

			const { xf, yf, pattern: p } = pattern;
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

		this.style.color.subscribe(() => updatePattern());
		this.style.pattern.subscribe(() => updatePattern());
		this.style.opacity.subscribe((value) => this.updatePaint('fill-opacity', value));
	}
}
