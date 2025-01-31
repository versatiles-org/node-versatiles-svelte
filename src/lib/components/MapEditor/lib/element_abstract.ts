import type { Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';
import { MapLayer } from './map_layer.js';
import type { ElementPoint, LayerFill, LayerLine, LayerSymbol, SelectionNode } from './types.js';
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

	protected randomPositions(name: string, length: number): ElementPoint[] {
		let seed = name
			.split('')
			.reduce((acc, char) => (acc * 0x101 + char.charCodeAt(0)) % 0x100000000, 0);

		const points: ElementPoint[] = [];
		for (let i = 0; i < length; i++) {
			const xr = random() * 0.5 + 0.25;
			const yr = random() * 0.5 + 0.25;

			const bounds = this.map.getBounds();
			points.push([
				(1 - xr) * bounds.getWest() + xr * bounds.getEast(),
				(1 - yr) * bounds.getSouth() + yr * bounds.getNorth()
			]);
		}

		return points;

		function random(): number {
			for (let i = 0; i < 10; i++) seed = ((Math.cos(seed * 3.14 + 0.0159) + 1.1) * 9631) % 1;
			return seed;
		}
	}

	abstract getFeature(): Feature;
	abstract getSelectionNodes(): SelectionNode[];
	abstract getSelectionNodeUpdater(
		properties?: Record<string, unknown>
	): ((lng: number, lat: number) => void) | undefined;
}
