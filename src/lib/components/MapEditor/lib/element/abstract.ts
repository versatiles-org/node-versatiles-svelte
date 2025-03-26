import type { ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';

export abstract class AbstractElement {
	protected readonly canvas: HTMLElement;
	protected readonly manager: GeometryManager;
	protected readonly map: maplibregl.Map;
	protected readonly source: maplibregl.GeoJSONSource;
	protected readonly slug = '_' + Math.random().toString(36).slice(2);
	protected isSelected = false;
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
		for (let i = 0; i < length; i++) {
			const xr = Math.random() * 0.5 + 0.25;
			const yr = Math.random() * 0.5 + 0.25;

			const bounds = this.map.getBounds();
			points.push([
				(1 - xr) * bounds.getWest() + xr * bounds.getEast(),
				(1 - yr) * bounds.getSouth() + yr * bounds.getNorth()
			]);
		}

		return points;
	}

	public delete() {
		this.manager.removeElement(this);
		this.destroy();
	}

	abstract destroy(): void;
	abstract getFeature(includeProperties: boolean): GeoJSON.Feature;
	abstract getSelectionNodes(): SelectionNode[];
	abstract getSelectionNodeUpdater(
		properties?: Record<string, unknown>
	): SelectionNodeUpdater | undefined;
	abstract getState(): StateObject;
}
