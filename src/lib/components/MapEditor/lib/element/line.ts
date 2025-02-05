import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath, ElementPoint, SelectionNode } from '../types.js';
import { getMiddlePoint } from '../utils.js';
import { MapLayerLine } from '../map_layer/line.js';

export class LineElement extends AbstractElement {
	public readonly style: MapLayerLine['style'];
	protected layer: MapLayerLine;

	protected path: ElementPath = [
		[0, 0],
		[0, 0]
	];

	constructor(manager: GeometryManager, name: string, line?: ElementPath) {
		super(manager, name);
		this.path = line ?? this.randomPositions(name, 2);
		this.layer = new MapLayerLine(this.map, 'line' + this.slug, this.getSourceId());
		this.layer.onClick.push(() => this.manager.setActiveElement(this));
		this.style = this.layer.style;
		this.source.setData(this.getFeature());
	}

	getFeature(): GeoJSON.Feature<GeoJSON.LineString> {
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'LineString', coordinates: this.path }
		};
	}

	getSelectionNodes(): SelectionNode[] {
		const points: SelectionNode[] = [];
		for (let i = 0; i < this.path.length; i++) {
			points.push({ index: i, coordinates: this.path[i] });
			if (i === this.path.length - 1) continue;
			points.push({
				index: i + 0.5,
				transparent: true,
				coordinates: getMiddlePoint(this.path[i], this.path[i + 1])
			});
		}
		return points;
	}

	getSelectionNodeUpdater(
		properties?: Record<string, unknown>
	): ((lng: number, lat: number) => void) | undefined {
		if (properties == undefined) return;
		const index = properties.index as number;
		let point: ElementPoint;
		if (index % 1 === 0) {
			point = this.path[index];
		} else {
			const i = Math.ceil(index);
			this.path.splice(i, 0, [0, 0]);
			point = this.path[i];
		}

		return (lng: number, lat: number) => {
			point[0] = lng;
			point[1] = lat;
			this.source.setData(this.getFeature());
		};
	}
}
