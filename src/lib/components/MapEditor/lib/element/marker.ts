import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import { MapLayerSymbol } from '../map_layer/symbol.js';

export class MarkerElement extends AbstractElement {
	public readonly layer: MapLayerSymbol;

	private point: ElementPoint = [0, 0];

	constructor(manager: GeometryManager, name: string, point?: ElementPoint) {
		super(manager, name);
		this.point = point ?? this.randomPositions(name, 1)[0];

		this.layer = new MapLayerSymbol(manager, 'symbol' + this.slug, this.sourceId);
		this.layer.onClick.push(() => this.manager.setActiveElement(this));
		this.source.setData(this.getFeature());
	}

	public set isActive(value: boolean) {
		this.layer.isActive = value;
	}

	public set isSelected(value: boolean) {
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
}
