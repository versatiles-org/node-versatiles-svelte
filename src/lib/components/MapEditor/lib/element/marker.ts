import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import { MapLayerSymbol } from '../map_layer/symbol.js';
import type { StateObject } from '../state/types.js';

export class MarkerElement extends AbstractElement {
	public readonly layer: MapLayerSymbol;

	private point: ElementPoint = [0, 0];

	constructor(manager: GeometryManager, point?: ElementPoint) {
		super(manager);
		this.point = point ?? this.randomPositions(1)[0];

		this.layer = new MapLayerSymbol(manager, 'symbol' + this.slug, this.sourceId);
		this.layer.on('click', () => this.manager.selectElement(this));
		this.source.setData(this.getFeature());
	}

	public select(value: boolean) {
		super.select(value);
		this.layer.isSelected = value;
	}

	getFeature(): GeoJSON.Feature<GeoJSON.Point> {
		return {
			type: 'Feature',
			properties: {},
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

	getState(): StateObject {
		return {
			type: 'marker',
			point: this.point,
			style: this.layer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateObject) {
		const element = new MarkerElement(manager, state.point);
		if (state.style) element.layer.setState(state.style);
		return element;
	}
}
