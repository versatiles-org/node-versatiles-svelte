import type { Feature } from 'geojson';
import type maplibregl from 'maplibre-gl';
import type { ElementPoint, SelectionNode } from '../types.js';
import type { GeometryManager } from '../geometry_manager.js';
import { Random } from '../random.js';

export abstract class AbstractElement {
	public name: string;

	protected readonly canvas: HTMLElement;
	protected readonly manager: GeometryManager;
	protected readonly map: maplibregl.Map;
	protected readonly source: maplibregl.GeoJSONSource;

	protected readonly slug = '_' + Math.random().toString(36).slice(2);
	protected readonly sourceId = 'source' + this.slug;

	constructor(manager: GeometryManager, name: string) {
		this.manager = manager;
		this.map = manager.map;
		this.canvas = this.map.getCanvasContainer();
		this.name = name;

		this.map.addSource(this.sourceId, {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		this.source = this.map.getSource(this.sourceId)!;
	}

	public abstract set isActive(value: boolean);
	public abstract set isSelected(value: boolean);

	protected randomPositions(name: string, length: number): ElementPoint[] {
		const r = new Random(name);

		const points: ElementPoint[] = [];
		for (let i = 0; i < length; i++) {
			const xr = r.random() * 0.5 + 0.25;
			const yr = r.random() * 0.5 + 0.25;

			const bounds = this.map.getBounds();
			points.push([
				(1 - xr) * bounds.getWest() + xr * bounds.getEast(),
				(1 - yr) * bounds.getSouth() + yr * bounds.getNorth()
			]);
		}

		return points;
	}

	abstract getFeature(): Feature;
	abstract getSelectionNodes(): SelectionNode[];
	abstract getSelectionNodeUpdater(
		properties?: Record<string, unknown>
	): ((lng: number, lat: number) => void) | undefined;
}
