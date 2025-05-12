import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath, ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import { MapLayerFill } from '../map_layer/fill.js';
import { MapLayerLine } from '../map_layer/line.js';
import type { StateElementCircle } from '../state/types.js';
import { AbstractElement } from './abstract.js';

const EARTH_RADIUS = 6371000; // Radius of the Earth in meters

export class CircleElement extends AbstractElement {
	public readonly fillLayer: MapLayerFill;
	public readonly strokeLayer: MapLayerLine;
	public point: ElementPoint;
	public radius: number;

	constructor(manager: GeometryManager, point?: ElementPoint, radius?: number) {
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
			...this.getPoints([0, 90, 180, 270]).map((coordinates, index) => ({
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
		const steps = 72;
		const bearings = Array.from({ length: steps + 1 }, (_, i) => -(i / steps) * 360);
		const coordinates = this.getPoints(bearings);

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
			GeoJSON.Polygon,
			{
				'circle-center-x': number;
				'circle-center-y': number;
				'circle-radius': number;
			}
		>
	) {
		const properties = feature.properties;
		const center = [properties['circle-center-x'], properties['circle-center-y']] as ElementPoint;
		const radius = properties['circle-radius'];

		const element = new CircleElement(manager, center, radius);
		element.fillLayer.setGeoJSONProperties(properties);
		element.strokeLayer.setGeoJSONProperties(properties);
		return element;
	}

	getPoints(bearings: number[]): ElementPath {
		const center = this.point;
		const radius = this.radius;
		const radians = radius / EARTH_RADIUS;
		const lng1 = degreesToRadians(center[0]);
		const lat1 = degreesToRadians(center[1]);

		return bearings.map((bearing) => {
			const bearingRad = degreesToRadians(bearing);
			const lat2 = Math.asin(
				Math.sin(lat1) * Math.cos(radians) + Math.cos(lat1) * Math.sin(radians) * Math.cos(bearingRad)
			);
			const lng2 =
				lng1 +
				Math.atan2(
					Math.sin(bearingRad) * Math.sin(radians) * Math.cos(lat1),
					Math.cos(radians) - Math.sin(lat1) * Math.sin(lat2)
				);
			return [radiansToDegrees(lng2), radiansToDegrees(lat2)];
		});
	}
}

function distance(point1: ElementPoint, point2: ElementPoint): number {
	const lat1 = degreesToRadians(point1[1]);
	const lat2 = degreesToRadians(point2[1]);
	const deltaLat = degreesToRadians(point2[1] - point1[1]);
	const deltaLng = degreesToRadians(point2[0] - point1[0]);

	const a =
		Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
		Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

	return EARTH_RADIUS * c; // Distance in meters
}

function degreesToRadians(degrees: number): number {
	return ((degrees % 360) * Math.PI) / 180;
}
function radiansToDegrees(radians: number): number {
	return ((radians / Math.PI) % 2) * 180;
}
