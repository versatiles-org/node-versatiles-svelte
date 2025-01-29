import type { Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';
import { MapLayer } from './map_layer.js';
import type { LayerFill, LayerLine, LayerSymbol } from './types.js';

export abstract class AbstractElement {
	public name: string;
	protected canvas:HTMLElement;
	protected map: maplibregl.Map;
	private slug = '_' + Math.random().toString(36).slice(2);

	constructor(map: maplibregl.Map, name: string) {
		this.map = map;
		this.canvas = map.getCanvasContainer();
		this.name = name;
	}

	protected addSource(feature: Feature): maplibregl.GeoJSONSource {
		this.map.addSource('source' + this.slug, { type: 'geojson', data: feature });
		return this.map.getSource('source' + this.slug)!;
	}

	protected addSymbolLayer(): MapLayer<LayerSymbol> {
		return new MapLayer(this.map, 'symbol' + this.slug, 'source' + this.slug, 'symbol');
	}

	protected addFillLayer(): MapLayer<LayerFill> {
		return new MapLayer(this.map, 'fill' + this.slug, 'source' + this.slug, 'fill');
	}

	protected addLinelLayer(): MapLayer<LayerLine> {
		return new MapLayer(this.map, 'line' + this.slug, 'source' + this.slug, 'line');
	}

	abstract getFeature(): Feature;
}
