import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath } from './types.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';
import type { StateObject } from '../state/types.js';

export class PolygonElement extends AbstractPathElement {
	public readonly fillLayer: MapLayerFill;
	public readonly strokeLayer: MapLayerLine;

	constructor(manager: GeometryManager, polygon?: ElementPath) {
		super(manager, false);
		this.path = polygon ?? this.randomPositions(3);

		this.fillLayer = new MapLayerFill(manager, 'fill' + this.slug, this.sourceId);
		this.fillLayer.onClick.push(() => this.manager.setActiveElement(this));

		this.strokeLayer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.strokeLayer.onClick.push(() => this.manager.setActiveElement(this));

		this.source.setData(this.getFeature());
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

	getState(): StateObject {
		return {
			type: 'polygon',
			points: this.path,
			style: this.fillLayer.getState(),
			strokeStyle: this.strokeLayer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateObject) {
		const element = new PolygonElement(manager, state.points);
		if (state.style) element.fillLayer.setState(state.style);
		if (state.strokeStyle) element.strokeLayer.setState(state.strokeStyle);
		return element;
	}
}
