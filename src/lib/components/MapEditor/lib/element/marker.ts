import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { SelectionNode, SelectionNodeUpdater } from './types.js';
import { MapLayerSymbol } from '../map_layer/symbol.js';
import type { StateElementMarker } from '../state/types.js';
import type { GeoPoint } from '../utils/types.js';

export class MarkerElement extends AbstractElement {
	public readonly layer: MapLayerSymbol;

	public point: GeoPoint;

	constructor(manager: GeometryManager, point?: GeoPoint) {
		super(manager);
		this.point = point ?? this.randomPositions(1)[0];

		this.layer = new MapLayerSymbol(manager, 'symbol' + this.slug, this.sourceId);
		this.layer.on('click', () => this.manager.selection?.selectElement(this));
		this.source.setData(this.getFeature());
	}

	public select(value: boolean) {
		super.select(value);
		this.layer.isSelected = value;
	}

	getFeature(includeProperties = false): GeoJSON.Feature<GeoJSON.Point> {
		return {
			type: 'Feature',
			properties: includeProperties ? this.layer.getGeoJSONProperties() : {},
			geometry: {
				type: 'Point',
				coordinates: this.point
			}
		};
	}

	getSelectionNodes(): SelectionNode[] {
		return [{ index: 0, coordinates: this.point }];
	}

	getSelectionNodeUpdater(): SelectionNodeUpdater | undefined {
		return {
			update: (lng, lat) => {
				this.point[0] = lng;
				this.point[1] = lat;
				this.source.setData(this.getFeature());
			},
			delete: () => this.delete()
		};
	}

	destroy(): void {
		this.layer.destroy();
		this.map.removeSource(this.sourceId);
	}

	getState(): StateElementMarker {
		return {
			type: 'marker',
			point: this.point,
			style: this.layer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateElementMarker) {
		const element = new MarkerElement(manager, state.point);
		if (state.style) element.layer.setState(state.style);
		return element;
	}

	static fromGeoJSON(manager: GeometryManager, feature: GeoJSON.Feature<GeoJSON.Point>) {
		const element = new MarkerElement(manager, feature.geometry.coordinates as GeoPoint);
		element.layer.setGeoJSONProperties(feature.properties);
		return element;
	}
}
