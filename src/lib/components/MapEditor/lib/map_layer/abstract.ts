import type { LayerSpecification } from 'maplibre-gl';
import type { LayerFill, LayerLine, LayerSymbol } from './types.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';

type LayerSpec = LayerFill | LayerLine | LayerSymbol;

export abstract class MapLayer<T extends LayerSpec> {
	private readonly manager: GeometryManager;
	private readonly map: maplibregl.Map;
	private readonly id: string;
	private layout = {} as T['layout'];
	private paint = {} as T['paint'];

	public onClick: (() => void)[] = [];
	public isActive = true;
	public isSelected = true;

	constructor(manager: GeometryManager, id: string) {
		this.manager = manager;
		this.map = manager.map;
		this.id = id;
	}

	addLayer(
		source: string,
		type: 'symbol' | 'line' | 'fill',
		layout: T['layout'],
		paint: T['paint']
	) {
		this.layout = layout;
		this.paint = paint;

		this.map.addLayer(
			{ id: this.id, source, type, layout, paint } as LayerSpecification,
			'selection_nodes'
		);

		this.addEvents();
	}

	addEvents() {
		this.map.on('mouseenter', this.id, () => {
			if (this.isActive) {
				if (this.isSelected) this.manager.cursor.grab(true);
				this.manager.cursor.hover(true);
			}
		});
		this.map.on('mouseleave', this.id, () => {
			if (this.isActive) {
				if (this.isSelected) this.manager.cursor.grab(false);
				this.manager.cursor.hover(false);
			}
		});
		this.map.on('click', this.id, (e) => {
			if (this.isActive) {
				this.onClick.forEach((handler) => handler());
				e.preventDefault();
			}
		});
	}

	setPaint(paint: T['paint']) {
		if (paint === undefined) return;
		const keys = new Set(
			Object.keys(paint).concat(Object.keys(this.paint)) as (keyof T['paint'])[]
		);
		for (const key of keys.values()) this.updatePaint(key, (paint as T['paint'])[key]);
	}

	updatePaint<K extends keyof T['paint'], V extends T['paint'][K]>(key: K, value: V) {
		if (value instanceof Color) value = value.asString() as V;

		if (this.paint[key] == value) return;
		this.map.setPaintProperty(this.id, key as string, value);
		this.paint[key] = value;
	}

	setLayout(layout: T['layout']) {
		if (layout === undefined) return;
		const keys = new Set(
			Object.keys(layout).concat(Object.keys(this.layout)) as (keyof T['layout'])[]
		);
		for (const key of keys.values()) this.updateLayout(key, (layout as T['layout'])[key]);
	}

	updateLayout<K extends keyof T['layout'], V extends T['layout'][K]>(key: K, value: V) {
		if (this.layout[key] == value) return;
		this.map.setLayoutProperty(this.id, key as string, value);
		this.layout[key] = value;
	}

	destroy(): void {
		this.map.removeLayer(this.id);
	}
}
