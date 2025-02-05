import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath, ElementPoint, SelectionNode } from '../types.js';
import { getMiddlePoint } from '../utils.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';

export class PolygonElement extends AbstractElement {
	private readonly fillLayer: MapLayerFill;
	private readonly strokeLayer: MapLayerLine;
	public readonly fillStyle: MapLayerFill['style'];
	public readonly strokeStyle: MapLayerLine['style'];

	private path: ElementPath;

	constructor(manager: GeometryManager, name: string, polygon?: ElementPath) {
		super(manager, name);
		this.path = polygon ?? this.randomPositions(name, 3);

		this.fillLayer = new MapLayerFill(manager, 'fill' + this.slug, this.sourceId);
		this.fillLayer.onClick.push(() => this.manager.setActiveElement(this));
		this.fillStyle = this.fillLayer.style;

		this.strokeLayer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.strokeLayer.onClick.push(() => this.manager.setActiveElement(this));
		this.strokeStyle = this.strokeLayer.style;

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

	getSelectionNodes(): SelectionNode[] {
		const points: SelectionNode[] = [];
		for (let i = 0; i < this.path.length; i++) {
			points.push({ index: i, coordinates: this.path[i] });
			const j = (i + 1) % this.path.length;
			points.push({
				index: i + 0.5,
				transparent: true,
				coordinates: getMiddlePoint(this.path[i], this.path[j])
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
