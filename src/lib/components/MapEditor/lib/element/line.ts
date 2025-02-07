import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath } from './types.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';

export class LineElement extends AbstractPathElement {
	public readonly layer: MapLayerLine;

	constructor(manager: GeometryManager, name: string, line?: ElementPath) {
		super(manager, name, true);
		this.path = line ?? this.randomPositions(name, 2);
		this.layer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.layer.onClick.push(() => this.manager.setActiveElement(this));
		this.source.setData(this.getFeature());
	}

	public set isActive(value: boolean) {
		this.layer.isActive = value;
	}

	public set isSelected(value: boolean) {
		this.layer.isSelected = value;
	}

	getFeature(): GeoJSON.Feature<GeoJSON.LineString> {
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'LineString', coordinates: this.path }
		};
	}

	destroy(): void {
		this.layer.destroy();
		this.map.removeSource(this.sourceId);
	}
}
