import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element/abstract.js';
import { MarkerElement } from './element/marker.js';
import { LineElement } from './element/line.js';
import type { SelectionNode } from './element/types.js';
import { PolygonElement } from './element/polygon.js';
import { Cursor } from './cursor.js';
import type { StateObject } from './state/types.js';
import { StateWriter } from './state/writer.js';
import { StateReader } from './state/reader.js';
import { SymbolLibrary } from './symbols.js';

export class GeometryManager {
	public readonly elements: Writable<AbstractElement[]>;
	public readonly map: maplibregl.Map;
	public readonly selectedElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly canvas: HTMLElement;
	public readonly cursor: Cursor;
	public readonly symbolLibrary: SymbolLibrary;

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

			e.preventDefault();

			if (e.originalEvent.shiftKey) {
				selectedNode.delete();
				this.drawSelectionNodes();
				this.saveState();
			} else {
				const onMove = (e: maplibregl.MapMouseEvent) => {
					e.preventDefault();
					selectedNode.update(e.lngLat.lng, e.lngLat.lat);
					this.drawSelectionNodes();
				};

				map.on('mousemove', onMove);
				map.once('mouseup', () => {
					this.saveState();
					map.off('mousemove', onMove);
				});
			}
		});

		map.on('mouseenter', 'selection_nodes', () => this.cursor.precise(true));
		map.on('mouseleave', 'selection_nodes', () => this.cursor.precise(false));

		map.on('click', (e) => {
			if (!e.originalEvent.shiftKey) this.selectElement(undefined);
			e.preventDefault();
		});

		map.on('moveend', () => this.saveState());

		const hash = location.hash.slice(1);
		if (hash) this.loadState(hash);
	}

	public selectElement(element: AbstractElement | undefined) {
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

	public getState(): StateObject {
		const center = this.map.getCenter();
		return {
			map: {
				point: [center.lng, center.lat],
				zoom: this.map.getZoom()
			},
			elements: get(this.elements).map((element) => element.getState())
		};
	}

	public async saveState() {
		const writer = new StateWriter();
		writer.writeObject(this.getState());
		location.hash = await writer.getBase64compressed();
	}

	public async loadState(hash: string) {
		if (!hash) return;
		try {
			const reader = await StateReader.fromBase64compressed(hash);
			const state = reader.readObject();
			if (!state) return;

			if (state.map?.zoom) this.map.setZoom(state.map.zoom);
			if (state.map?.point) {
				this.map.setCenter({ lng: state.map.point[0], lat: state.map.point[1] });
			}

			if (state.elements) {
				this.elements.set(
					state.elements.map((element) => {
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
					})
				);
			}
		} catch (error) {
			console.error(error);
		}
	}

	public getElement(index: number): AbstractElement {
		return get(this.elements)[index];
	}

	public addNewMarker(): AbstractElement {
		const element = new MarkerElement(this);
		this.addElement(element);
		return element;
	}

	public addNewLine(): AbstractElement {
		const element = new LineElement(this);
		this.addElement(element);
		return element;
	}

	public addNewPolygon(): AbstractElement {
		const element = new PolygonElement(this);
		this.addElement(element);
		return element;
	}

	private addElement(element: AbstractElement) {
		this.elements.update((elements) => [...elements, element]);
		this.saveState();
	}

	public deleteElement(element: AbstractElement) {
		this.elements.update((elements) => elements.filter((e) => e !== element));
		if (get(this.selectedElement) === element) this.selectElement(undefined);
		this.saveState();
	}
}
