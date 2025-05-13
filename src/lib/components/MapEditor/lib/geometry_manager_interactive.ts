import { get } from 'svelte/store';
import type { AbstractElement } from './element/abstract.js';
import { CircleElement } from './element/circle.js';
import { LineElement } from './element/line.js';
import { MarkerElement } from './element/marker.js';
import { PolygonElement } from './element/polygon.js';
import { GeometryManager } from './geometry_manager.js';
import { SelectionHandler } from './selection.js';
import { flatten } from './utils/geometry.js';
import { Cursor } from './cursor.js';
import { StateManager } from './state/manager.js';
import type { StateRoot } from './state/types.js';

export type ExtendedGeoJSON = GeoJSON.FeatureCollection & {
	map?: { center: [number, number]; zoom: number };
};

export class GeometryManagerInteractive extends GeometryManager {
	public readonly selection: SelectionHandler;
	public readonly cursor: Cursor;
	public readonly state: StateManager;

	constructor(map: maplibregl.Map) {
		super(map);
		this.cursor = new Cursor(map.getCanvasContainer());
		this.selection = new SelectionHandler(this);
		this.state = new StateManager(this);
	}

	public clear() {
		this.selection.selectElement();
		super.clear();
	}

	public isInteractive(): this is GeometryManagerInteractive {
		return true;
	}

	public removeElement(element: AbstractElement) {
		this.selection.selectElement();
		super.removeElement(element);
	}

	public addNewElement(type: 'marker'): MarkerElement;
	public addNewElement(type: 'line'): LineElement;
	public addNewElement(type: 'polygon'): PolygonElement;
	public addNewElement(type: 'circle'): CircleElement;
	public addNewElement(type: 'marker' | 'line' | 'polygon' | 'circle'): AbstractElement;
	public addNewElement(type: 'marker' | 'line' | 'polygon' | 'circle'): AbstractElement {
		const AbstractClass = {
			marker: MarkerElement,
			line: LineElement,
			polygon: PolygonElement,
			circle: CircleElement
		}[type];
		const element = new AbstractClass(this);
		this.appendElement(element);
		this.selection.selectElement(element);
		return element;
	}

	public getGeoJSON(): GeoJSON.FeatureCollection {
		const center = this.map.getCenter();
		return {
			type: 'FeatureCollection',
			map: {
				center: [center.lng, center.lat],
				zoom: this.map.getZoom()
			},
			features: get(this.elements).map((element) => element.getGeoJSON())
		} as GeoJSON.FeatureCollection;
	}

	public getState(): StateRoot {
		const center = this.map.getCenter();
		const bounds = this.map.getBounds();
		const radiusDegrees =
			Math.min(
				bounds.getNorth() - bounds.getSouth(),
				(bounds.getEast() - bounds.getWest()) * Math.cos((center.lat * Math.PI) / 180)
			) / 2;
		const radius = 40074000 * (radiusDegrees / 360);
		return {
			map: {
				center: [center.lng, center.lat],
				radius
			},
			elements: get(this.elements).map((element) => element.getState())
		};
	}

	public addGeoJSON(geojson: ExtendedGeoJSON) {
		if ('map' in geojson && geojson.map) {
			const { map } = geojson;
			if (typeof map.zoom === 'number') {
				this.map.setZoom(map.zoom);
			}
			if (Array.isArray(map.center)) {
				const [lng, lat] = map.center;
				if (typeof lng === 'number' && typeof lat === 'number') {
					this.map.setCenter({ lng, lat });
				}
			}
		}

		for (const feature of flatten(geojson.features)) {
			let element: AbstractElement;
			const p = feature.properties;

			switch (feature.geometry.type) {
				case 'Point':
					if (p && p.subType == 'Circle' && p.radius != null) {
						element = CircleElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.Point, { radius: number }>);
						break;
					}
					element = MarkerElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.Point>);
					break;
				case 'LineString':
					element = LineElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.LineString>);
					break;
				case 'Polygon':
					element = PolygonElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.Polygon>);
					break;
			}
			this.appendElement(element);
		}
	}
}
