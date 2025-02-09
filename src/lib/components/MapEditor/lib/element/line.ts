import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath } from './types.js';
import { MapLayerLine } from '../map_layer/line.js';
import { AbstractPathElement } from './abstract_path.js';
import type { StateObject } from '../state/types.js';

export class LineElement extends AbstractPathElement {
	public readonly layer: MapLayerLine;
	public readonly path: ElementPath;

	constructor(manager: GeometryManager, line?: ElementPath) {
		super(manager, true);
		this.path = line ?? this.randomPositions(2);
		this.layer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.layer.onClick.push(() => this.manager.setActiveElement(this));
		this.source.setData(this.getFeature());
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

	getState(): StateObject {
		return {
			type: 'line',
			points: this.path,
			style: this.layer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateObject) {
		const element = new LineElement(manager, state.points);
		if (state.style) element.layer.setState(state.style);
		return element;
	}
}
