import type { GeometryManager } from '../geometry_manager.js';
import type { SelectionNode, SelectionNodeUpdater } from './types.js';
import type { GeoPoint } from '../utils/types.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';
import type { StateElementCircle } from '../state/types.js';
import { AbstractElement } from './abstract.js';
import { circle, distance } from '../utils/geometry.js';

export class CircleElement extends AbstractElement {
	public readonly fillLayer: MapLayerFill;
	public readonly strokeLayer: MapLayerLine;
	public point: GeoPoint;
	public radius: number;

	constructor(manager: GeometryManager, point?: GeoPoint, radius?: number) {
		super(manager);
		this.point = point ?? this.randomPositions(1)[0];
		this.radius = radius ?? this.randomRadius();

		this.fillLayer = new MapLayerFill(manager, 'fill' + this.slug, this.sourceId);
		this.fillLayer.on('click', () => this.manager.selectElement(this));

		this.strokeLayer = new MapLayerLine(manager, 'line' + this.slug, this.sourceId);
		this.strokeLayer.on('click', () => this.manager.selectElement(this));

		this.source.setData(this.getFeature());
	}

	getSelectionNodes(): SelectionNode[] {
		return [
			{ index: -1, coordinates: this.point },
			...circle(this.point, this.radius, 4).map((coordinates, index) => ({
				index,
				transparent: true,
				coordinates
			}))
		];
	}

	getSelectionNodeUpdater(properties?: Record<string, unknown>): SelectionNodeUpdater | undefined {
		if (properties == undefined) return;
		if ((properties.index as number) < 0) {
			return {
				update: (lng: number, lat: number) => {
					this.point[0] = lng;
					this.point[1] = lat;
					this.source.setData(this.getFeature(false));
				},
				delete: () => this.delete()
			};
		} else {
			return {
				update: (lng: number, lat: number) => {
					this.radius = distance([lng, lat], this.point);
					this.source.setData(this.getFeature(false));
				},
				delete: () => this.delete()
			};
		}
	}

	public select(value: boolean) {
		super.select(value);
		this.fillLayer.isSelected = value;
		this.strokeLayer.isSelected = value;
	}

	getFeature(includeProperties = false): GeoJSON.Feature<GeoJSON.Polygon> {
		const coordinates = circle(this.point, this.radius, 72);
		coordinates.push(coordinates[0]); // Close the circle

		return {
			type: 'Feature',
			properties: includeProperties
				? {
						...this.fillLayer.getGeoJSONProperties(),
						...this.strokeLayer.getGeoJSONProperties(),
						'circle-center-x': this.point[0],
						'circle-center-y': this.point[1],
						'circle-radius': this.radius
					}
				: {},
			geometry: { type: 'Polygon', coordinates: [coordinates] }
		};
	}

	getGeoJSON(): GeoJSON.Feature<GeoJSON.Point> {
		return {
			type: 'Feature',
			properties: {
				...this.fillLayer.getGeoJSONProperties(),
				...this.strokeLayer.getGeoJSONProperties(),
				subType: 'Circle',
				radius: this.radius
			},
			geometry: { type: 'Point', coordinates: this.point }
		};
	}

	destroy(): void {
		this.fillLayer.destroy();
		this.strokeLayer.destroy();
		this.map.removeSource(this.sourceId);
	}

	getState(): StateElementCircle {
		return {
			type: 'circle',
			point: this.point,
			radius: this.radius,
			style: this.fillLayer.getState(),
			strokeStyle: this.strokeLayer.getState()
		};
	}

	static fromState(manager: GeometryManager, state: StateElementCircle) {
		const element = new CircleElement(manager, state.point, state.radius);
		if (state.style) element.fillLayer.setState(state.style);
		if (state.strokeStyle) element.strokeLayer.setState(state.strokeStyle);
		return element;
	}

	static fromGeoJSON(
		manager: GeometryManager,
		feature: GeoJSON.Feature<
			GeoJSON.Point,
			{
				radius: number;
			}
		>
	) {
		const properties = feature.properties;
		const center = feature.geometry.coordinates as GeoPoint;
		const radius = feature.properties.radius;

		const element = new CircleElement(manager, center, radius);
		element.fillLayer.setGeoJSONProperties(properties);
		element.strokeLayer.setGeoJSONProperties(properties);
		return element;
	}
}
