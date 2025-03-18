import type { LayerFill, LayerLine, LayerSymbol } from './types.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';

type LayerSpec = LayerFill | LayerLine | LayerSymbol;
type Events = 'click' | 'mousedown' | 'mousemove' | 'mouseup';
type MouseEventHandler = (event: maplibregl.MapMouseEvent) => void;

export abstract class MapLayer<T extends LayerSpec> {
	private layout = {} as T['layout'];
	private paint = {} as T['paint'];

	protected readonly id: string;
	public readonly manager: GeometryManager;
	protected readonly map: maplibregl.Map;

	public eventHandlers = new Map<Events, MouseEventHandler[]>();
	public isSelected = false;

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
			{ id: this.id, source, type, layout, paint } as maplibregl.LayerSpecification,
			'selection_nodes'
		);

		this.addEvents();
	}

	on(event: Events, handler: MouseEventHandler) {
		if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
		this.eventHandlers.get(event)!.push(handler);
	}

	off(event: Events, handler: MouseEventHandler) {
		if (!this.eventHandlers.has(event)) return;
		const handlers = this.eventHandlers.get(event)!;
		this.eventHandlers.set(
			event,
			handlers.filter((h) => h !== handler)
		);
	}

	private dispatchEvent(event: Events, e: maplibregl.MapMouseEvent) {
		const handlers = this.eventHandlers.get(event);
		if (handlers) handlers.forEach((handler) => handler(e));
	}

	private addEvents() {
		this.map.on('mouseenter', this.id, () => {
			if (this.isSelected) this.manager.cursor.toggleGrab(this.id);
			this.manager.cursor.toggleHover(this.id);
		});
		this.map.on('mouseleave', this.id, () => {
			if (this.isSelected) this.manager.cursor.toggleGrab(this.id, false);
			this.manager.cursor.toggleHover(this.id, false);
		});
		this.map.on('click', this.id, (e) => {
			this.dispatchEvent('click', e);
			if (this.isSelected) this.manager.cursor.toggleGrab(this.id);
			this.manager.cursor.toggleHover(this.id);
			e.preventDefault();
		});
		this.map.on('mousedown', this.id, (e) => {
			if (this.manager.cursor.isPrecise()) return;
			this.dispatchEvent('mousedown', e);
		});
		this.map.on('mouseup', this.id, (e) => this.dispatchEvent('mouseup', e));
		this.map.on('mousemove', this.id, (e) => this.dispatchEvent('mousemove', e));
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

	abstract getState(): StateObject | undefined;
	abstract getGeoJSONProperties(): GeoJSON.GeoJsonProperties;
	abstract setGeoJSONProperties(properties: GeoJSON.GeoJsonProperties): void;
}
