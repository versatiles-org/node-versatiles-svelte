import type { LayerSpecification } from 'maplibre-gl';
import type { LayerFill, LayerLine, LayerSymbol } from '../types.js';
import { Color } from '@versatiles/style';

type LayerSpec = LayerFill | LayerLine | LayerSymbol;

export class MapLayer<T extends LayerSpec> {
	private readonly map: maplibregl.Map;
	private readonly id: string;
	private layoutProperties = {} as T['layout'];
	private paintProperties = {} as T['paint'];
	public onClick: (() => void)[] = [];
	protected canvas: HTMLElement;
	protected isActive = true;

	constructor(map: maplibregl.Map, id: string) {
		this.map = map;
		this.id = id;
		this.canvas = map.getCanvas();
	}

	addLayer(
		source: string,
		type: 'symbol' | 'line' | 'fill',
		layout: T['layout'],
		paint: T['paint']
	) {
		this.layoutProperties = layout;
		this.paintProperties = paint;

		this.map.addLayer(
			{ id: this.id, source, type, layout, paint } as LayerSpecification,
			'selection_nodes'
		);

		this.addEvents();
	}

	addEvents() {
		this.map.on('mouseenter', this.id, () => {
			if (this.isActive) this.canvas.style.cursor = 'pointer';
		});
		this.map.on('mouseleave', this.id, () => {
			if (this.isActive) this.canvas.style.cursor = 'default';
		});
		this.map.on('click', this.id, (e) => {
			if (this.isActive) {
				e.preventDefault();
			}
		});
	}

	setPaint(paint: T['paint']) {
		if (paint === undefined) return;
		const keys = new Set(
			Object.keys(paint).concat(Object.keys(this.paintProperties)) as (keyof T['paint'])[]
		);
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
		const keys = new Set(
			Object.keys(layout).concat(Object.keys(this.layoutProperties)) as (keyof T['layout'])[]
		);
		for (const key of keys.values()) this.updateLayout(key, (layout as T['layout'])[key]);
	}

	updateLayout<K extends keyof T['layout'], V extends T['layout'][K]>(key: K, value: V) {
		if (this.layoutProperties[key] == value) return;
		this.map.setLayoutProperty(this.id, key as string, value);
		this.layoutProperties[key] = value;
	}
}
