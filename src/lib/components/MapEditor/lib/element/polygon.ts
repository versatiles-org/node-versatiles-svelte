import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath } from './types.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';

export class PolygonElement extends AbstractPathElement {
	public readonly fillLayer: MapLayerFill;
	public readonly strokeLayer: MapLayerLine;

	constructor(manager: GeometryManager, name: string, polygon?: ElementPath) {
		super(manager, name, false);
		this.path = polygon ?? this.randomPositions(name, 3);

		this.fillLayer = new MapLayerFill(manager, 'fill' + this.slug, this.sourceId);
		this.fillLayer.onClick.push(() => this.manager.setActiveElement(this));

		this.strokeLayer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.strokeLayer.onClick.push(() => this.manager.setActiveElement(this));

		this.source.setData(this.getFeature());
	}

	public set isActive(value: boolean) {
		this.fillLayer.isActive = value;
		this.strokeLayer.isActive = value;
	}

	public set isSelected(value: boolean) {
		this.fillLayer.isSelected = value;
		this.strokeLayer.isSelected = value;
	}

	getFeature(): GeoJSON.Feature<GeoJSON.Polygon> {
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'Polygon', coordinates: [[...this.path, this.path[0]]] }
		};
	}

	destroy(): void {
		this.fillLayer.destroy();
		this.strokeLayer.destroy();
		this.map.removeSource(this.sourceId);
	}
}
