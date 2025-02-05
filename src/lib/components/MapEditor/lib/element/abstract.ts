import type { Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';
import type { ElementPoint, SelectionNode } from '../types.js';
import type { GeometryManager } from '../geometry_manager.js';

export abstract class AbstractElement {
	public name: string;

	protected canvas: HTMLElement;
	protected manager: GeometryManager;
	protected map: maplibregl.Map;
	protected source: maplibregl.GeoJSONSource;

	protected slug = '_' + Math.random().toString(36).slice(2);

	constructor(manager: GeometryManager, name: string) {
		this.manager = manager;
		this.map = manager.map;
		this.canvas = this.map.getCanvasContainer();
		this.name = name;

		this.map.addSource(this.getSourceId(), {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		this.source = this.map.getSource(this.getSourceId())!;
	}

	protected getSourceId(): string {
		return 'source' + this.slug;
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
