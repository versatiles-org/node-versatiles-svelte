import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element/abstract.js';
import { MarkerElement } from './element/marker.js';
import { LineElement } from './element/line.js';
import type { SelectionNode } from './element/types.js';
import { PolygonElement } from './element/polygon.js';
import { Cursor } from './cursor.js';
import { SymbolLibrary } from './symbols.js';
import { StateManager } from './state/manager.js';
import type { StateRoot } from './state/types.js';

export type ExtendedGeoJSON = GeoJSON.FeatureCollection & {
	map?: { center: [number, number]; zoom: number };
};

export class GeometryManager {
	public readonly elements: Writable<AbstractElement[]>;
	public readonly map: maplibregl.Map;
	public readonly selectedElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly canvas: HTMLElement;
	public readonly cursor: Cursor;
	public readonly symbolLibrary: SymbolLibrary;
	public readonly state = new StateManager(this);

	private readonly selectionNodes: maplibregl.GeoJSONSource;

	constructor(map: maplibregl.Map) {
		this.elements = writable([]);
		this.map = map;
		this.canvas = this.map.getCanvasContainer();
		this.cursor = new Cursor(this.canvas);
		this.symbolLibrary = new SymbolLibrary(map);

		map.addSource('selection_nodes', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		this.selectionNodes = map.getSource('selection_nodes')!;

		map.addLayer({
			id: 'selection_nodes',
			source: 'selection_nodes',
			type: 'circle',
			layout: {},
			paint: {
				'circle-color': '#ffffff',
				'circle-opacity': ['get', 'opacity'],
				'circle-radius': 3,
				'circle-stroke-color': '#000000',
				'circle-stroke-opacity': ['get', 'opacity'],
				'circle-stroke-width': 1
			}
		});

		map.on('mousedown', 'selection_nodes', (e) => {
			const element = get(this.selectedElement)!;
			if (element == undefined) return;

			const feature = map.queryRenderedFeatures(e.point, { layers: ['selection_nodes'] })[0];
			const selectedNode = element.getSelectionNodeUpdater(feature.properties);
			if (selectedNode == undefined) return;

			// @ts-expect-error ensure that the event is ignored by other layers
			e.ignore = true;
			e.preventDefault();

			if (e.originalEvent.shiftKey) {
				selectedNode.delete();
				this.drawSelectionNodes();
			} else {
				const onMove = (e: maplibregl.MapMouseEvent) => {
					e.preventDefault();
					selectedNode.update(e.lngLat.lng, e.lngLat.lat);
					this.drawSelectionNodes();
				};

				map.on('mousemove', onMove);
				map.once('mouseup', () => map.off('mousemove', onMove));
			}
		});

		map.on('mouseenter', 'selection_nodes', () => {
			this.cursor.togglePrecise('selection_nodes');
		});
		map.on('mouseleave', 'selection_nodes', () => {
			this.cursor.togglePrecise('selection_nodes', false);
		});

		map.on('click', (e) => {
			if (!e.originalEvent.shiftKey) this.selectElement(undefined);
			e.preventDefault();
		});
	}

	public selectElement(element: AbstractElement | undefined) {
		if (element == get(this.selectedElement)) return;
		const elements = get(this.elements);
		elements.forEach((e) => e.select(e == element));
		this.selectedElement.set(element);
		this.drawSelectionNodes();
	}

	public drawSelectionNodes() {
		const nodes: SelectionNode[] = get(this.selectedElement)?.getSelectionNodes() ?? [];
		this.selectionNodes.setData({
			type: 'FeatureCollection',
			features: nodes.map((n) => ({
				type: 'Feature',
				properties: { index: n.index, opacity: n.transparent ? 0.3 : 1 },
				geometry: { type: 'Point', coordinates: n.coordinates }
			}))
		});
	}

	public getState(): StateRoot {
		const center = this.map.getCenter();
		return {
			map_center: [center.lng, center.lat],
			map_zoom: this.map.getZoom(),
			elements: get(this.elements).map((element) => element.getState())
		};
	}

	public setState(state: StateRoot) {
		if (!state) return;

		this.selectElement(undefined);
		this.elements.update((elements) => {
			elements.forEach((e) => e.destroy());
			return [];
		});

		this.map.setZoom(state.map_zoom);
		this.map.setCenter({
			lng: state.map_center[0],
			lat: state.map_center[1]
		});

		if (state.elements) {
			const elements = state.elements.map((element) => {
				switch (element.type) {
					case 'marker':
						return MarkerElement.fromState(this, element);
					case 'line':
						return LineElement.fromState(this, element);
					case 'polygon':
						return PolygonElement.fromState(this, element);
					default:
						throw new Error('Unknown element type');
				}
			});
			this.elements.set(elements);
		}
	}

	public getElement(index: number): AbstractElement {
		return get(this.elements)[index];
	}

	public addNewMarker(): MarkerElement {
		const element = new MarkerElement(this);
		this.appendElement(element);
		return element;
	}

	public addNewLine(): LineElement {
		const element = new LineElement(this);
		this.appendElement(element);
		return element;
	}

	public addNewPolygon(): PolygonElement {
		const element = new PolygonElement(this);
		this.appendElement(element);
		return element;
	}

	private appendElement(element: AbstractElement) {
		this.elements.update((elements) => [...elements, element]);
	}

	public removeElement(element: AbstractElement) {
		if (get(this.selectedElement) === element) this.selectElement(undefined);
		this.elements.update((elements) => elements.filter((e) => e !== element));
	}

	public getGeoJSON(): GeoJSON.FeatureCollection {
		const center = this.map.getCenter();
		return {
			type: 'FeatureCollection',
			map: {
				center: [center.lng, center.lat],
				zoom: this.map.getZoom()
			},
			features: get(this.elements).map((element) => element.getFeature(true))
		} as GeoJSON.FeatureCollection;
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
		for (const feature of geojson.features) {
			let element: AbstractElement;
			switch (feature.geometry.type) {
				case 'Point':
					element = MarkerElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.Point>);
					break;
				case 'LineString':
					element = LineElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.LineString>);
					break;
				case 'Polygon':
					element = PolygonElement.fromGeoJSON(this, feature as GeoJSON.Feature<GeoJSON.Polygon>);
					break;
				default:
					throw new Error(`Unknown geometry type "${feature.geometry.type}"`);
			}
			this.appendElement(element);
		}
	}
}
