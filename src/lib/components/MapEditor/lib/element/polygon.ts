import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath } from './types.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';
import type { StateElementPolygon } from '../state/types.js';

export class PolygonElement extends AbstractPathElement {
	public readonly fillLayer: MapLayerFill;
	public readonly strokeLayer: MapLayerLine;

	constructor(manager: GeometryManager, polygon?: ElementPath) {
		super(manager, false);
		this.path = polygon ?? this.randomPositions(3);

		this.fillLayer = new MapLayerFill(manager, 'fill' + this.slug, this.sourceId);
		this.fillLayer.on('click', () => this.manager.selectElement(this));
		this.fillLayer.on('mousedown', (e) => {
			if (!this.isSelected) return;
			this.handleDrag(e);
		});

		this.strokeLayer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.strokeLayer.on('click', () => this.manager.selectElement(this));

		this.source.setData(this.getFeature());
	}

	public select(value: boolean) {
		super.select(value);
		this.fillLayer.isSelected = value;
		this.strokeLayer.isSelected = value;
	}

	getFeature(includeProperties = false): GeoJSON.Feature<GeoJSON.Polygon> {
		return {
			type: 'Feature',
			properties: includeProperties
				? { ...this.fillLayer.getGeoJSONProperties(), ...this.strokeLayer.getGeoJSONProperties() }
				: {},
			geometry: { type: 'Polygon', coordinates: [[...this.path, this.path[0]]] }
		};
	}

	destroy(): void {
		this.fillLayer.destroy();
		this.strokeLayer.destroy();
		this.map.removeSource(this.sourceId);
	}

	getState(): StateElementPolygon {
		return {
			type: 'polygon',
			points: this.path,
			style: this.fillLayer.getState(),
			strokeStyle: this.strokeLayer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateElementPolygon) {
		const element = new PolygonElement(manager, state.points);
		if (state.style) element.fillLayer.setState(state.style);
		if (state.strokeStyle) element.strokeLayer.setState(state.strokeStyle);
		return element;
	}

	static fromGeoJSON(manager: GeometryManager, feature: GeoJSON.Feature<GeoJSON.Polygon>) {
		const coordinates = feature.geometry.coordinates[0].slice(0, -1) as ElementPath;
		const element = new PolygonElement(manager, coordinates as ElementPath);
		element.fillLayer.setGeoJSONProperties(feature.properties);
		element.strokeLayer.setGeoJSONProperties(feature.properties);
		return element;
	}
}
