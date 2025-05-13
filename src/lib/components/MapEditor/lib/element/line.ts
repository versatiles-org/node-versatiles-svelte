import type { GeometryManager } from '../geometry_manager.js';
import type { GeoPath } from '../utils/types.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';
import type { StateElementLine } from '../state/types.js';

export class LineElement extends AbstractPathElement {
	public readonly layer: MapLayerLine;

	constructor(manager: GeometryManager, line?: GeoPath) {
		super(manager, true);
		this.path = line ?? this.randomPositions(2);

		this.layer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.layer.on('click', () => this.manager.selectElement(this));
		this.layer.on('mousedown', (e) => {
			if (!this.isSelected) return;
			if ('ignore' in e && e.ignore) return;
			this.handleDrag(e);
		});

		this.source.setData(this.getFeature());
	}

	public select(value: boolean) {
		super.select(value);
		this.layer.isSelected = value;
	}

	getFeature(includeProperties: boolean = false): GeoJSON.Feature<GeoJSON.LineString> {
		return {
			type: 'Feature',
			properties: includeProperties ? this.layer.getGeoJSONProperties() : {},
			geometry: { type: 'LineString', coordinates: this.path }
		};
	}

	destroy(): void {
		this.layer.destroy();
		this.map.removeSource(this.sourceId);
	}

	getState(): StateElementLine {
		return {
			type: 'line',
			points: this.path,
			style: this.layer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateElementLine) {
		const element = new LineElement(manager, state.points);
		if (state.style) element.layer.setState(state.style);
		return element;
	}

	static fromGeoJSON(manager: GeometryManager, feature: GeoJSON.Feature<GeoJSON.LineString>) {
		const element = new LineElement(manager, feature.geometry.coordinates as GeoPath);
		element.layer.setGeoJSONProperties(feature.properties);
		return element;
	}
}
