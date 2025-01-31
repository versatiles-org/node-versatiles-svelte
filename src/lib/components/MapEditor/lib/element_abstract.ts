import type { Feature, Point } from 'geojson';
import type maplibregl from 'maplibre-gl';
import { MapLayer } from './map_layer.js';
import type { LayerFill, LayerLine, LayerSymbol } from './types.js';
import type { GeometryManager } from './geometry_manager.js';

export abstract class AbstractElement {
	public name: string;

	protected canvas: HTMLElement;
	protected manager: GeometryManager;
	protected map: maplibregl.Map;

	private slug = '_' + Math.random().toString(36).slice(2);

	constructor(manager: GeometryManager, name: string) {
		this.manager = manager;
		this.map = manager.map;
		this.canvas = this.map.getCanvasContainer();
		this.name = name;
	}

	protected addSource(feature: Feature): maplibregl.GeoJSONSource {
		this.map.addSource('source' + this.slug, { type: 'geojson', data: feature });
		return this.map.getSource('source' + this.slug)!;
	}

	protected addLayer(type: 'symbol'): MapLayer<LayerSymbol>;
	protected addLayer(type: 'fill'): MapLayer<LayerFill>;
	protected addLayer(type: 'line'): MapLayer<LayerLine>;
	protected addLayer<T extends LayerSymbol | LayerFill | LayerLine>(
		type: 'symbol' | 'fill' | 'line'
	): MapLayer<T> {
		const layer = new MapLayer(this.map, type + this.slug, 'source' + this.slug, type);

		this.map.on('mouseenter', layer.id, () => (this.canvas.style.cursor = 'pointer'));
		this.map.on('mouseleave', layer.id, () => (this.canvas.style.cursor = 'default'));
		this.map.on('click', layer.id, (e) => {
			this.manager.setActiveElement(this);
			e.preventDefault();
		});

		return layer as MapLayer<T>;
	}

	abstract getFeature(): Feature;
	abstract getSelectionNodes(): Feature<Point>[];
	abstract updateSelectionNode(index: number, position: [number, number]): void;
}
