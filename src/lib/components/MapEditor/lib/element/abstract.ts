import type { ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateElement } from '../state/types.js';

export abstract class AbstractElement {
	protected readonly canvas: HTMLElement;
	protected readonly map: maplibregl.Map;
	protected readonly source: maplibregl.GeoJSONSource;
	protected readonly slug = '_' + Math.random().toString(36).slice(2);
	protected isSelected = false;

	public readonly manager: GeometryManager;
	public readonly sourceId = 'source' + this.slug;

	constructor(manager: GeometryManager) {
		this.manager = manager;
		this.map = manager.map;
		this.canvas = this.map.getCanvasContainer();

		this.map.addSource(this.sourceId, {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		this.source = this.map.getSource(this.sourceId)!;
	}

	public select(value: boolean) {
		this.isSelected = value;
	}

	protected randomPositions(length: number): ElementPoint[] {
		const points: ElementPoint[] = [];
		const bounds = this.map.getBounds();

		for (let i = 0; i < length; i++) {
			const xr = Math.random() * 0.5 + 0.25;
			const yr = Math.random() * 0.5 + 0.25;
			points.push([
				(1 - xr) * bounds.getWest() + xr * bounds.getEast(),
				(1 - yr) * bounds.getSouth() + yr * bounds.getNorth()
			]);
		}

		return points;
	}

	protected randomRadius(): number {
		const bounds = this.map.getBounds();
		const width = bounds.getEast() - bounds.getWest();
		const height = bounds.getNorth() - bounds.getSouth();
		return Math.sqrt(width * height) * 10000;
	}

	public delete() {
		this.manager.removeElement(this);
		this.destroy();
	}

	public getGeoJSON(): GeoJSON.Feature {
		return this.getFeature(true);
	}

	abstract destroy(): void;
	abstract getFeature(includeProperties?: boolean): GeoJSON.Feature;
	abstract getSelectionNodes(): SelectionNode[];
	abstract getSelectionNodeUpdater(properties?: Record<string, unknown>): SelectionNodeUpdater | undefined;
	abstract getState(): StateElement;
}
