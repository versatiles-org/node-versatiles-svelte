import type { Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';
import { MapLayer } from './map_layer.js';
import type { ElementPoint, LayerFill, LayerLine, LayerSymbol, SelectionNode } from './types.js';
import type { GeometryManager } from './geometry_manager.js';

export abstract class AbstractElement<T extends LayerSymbol | LayerFill | LayerLine = LayerSymbol | LayerFill | LayerLine> {
	public name: string;

	protected canvas: HTMLElement;
	protected manager: GeometryManager;
	protected map: maplibregl.Map;
	protected layer: MapLayer<T>;
	protected source: maplibregl.GeoJSONSource;

	private isActive = true;

	private slug = '_' + Math.random().toString(36).slice(2);

	constructor(manager: GeometryManager, name: string, type: 'symbol' | 'fill' | 'line') {
		this.manager = manager;
		this.map = manager.map;
		this.canvas = this.map.getCanvasContainer();
		this.name = name;

		this.map.addSource('source' + this.slug, { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
		this.source = this.map.getSource('source' + this.slug)!;

		this.layer = new MapLayer(this.map, type + this.slug, 'source' + this.slug, type);
		this.map.on('mouseenter', this.layer.id, () => {
			if (this.isActive) this.canvas.style.cursor = 'pointer';
		});
		this.map.on('mouseleave', this.layer.id, () => {
			if (this.isActive) this.canvas.style.cursor = 'default';
		});
		this.map.on('click', this.layer.id, (e) => {
			if (this.isActive) {
				this.manager.setActiveElement(this);
				e.preventDefault();
			}
		});
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
