import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element/abstract.js';
import { MarkerElement } from './element/marker.js';
import type maplibregl from 'maplibre-gl';
import type { MapMouseEvent } from 'maplibre-gl';
import { LineElement } from './element/line.js';
import type { SelectionNode } from './element/types.js';
import { PolygonElement } from './element/polygon.js';
import { Cursor } from './cursor.js';

export class GeometryManager {
	public readonly elements: Writable<AbstractElement[]>;
	public readonly map: maplibregl.Map;
	public readonly activeElement: Writable<AbstractElement | undefined> = writable(undefined);
	public readonly canvas: HTMLElement;
	public readonly cursor: Cursor;

	private readonly selectionNodes: maplibregl.GeoJSONSource;

	constructor(map: maplibregl.Map) {
		this.elements = writable([]);
		this.map = map;
		this.canvas = this.map.getCanvasContainer();
		this.cursor = new Cursor(this.canvas);

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
			const element = get(this.activeElement)!;
			if (element == undefined) return;

			const feature = map.queryRenderedFeatures(e.point, { layers: ['selection_nodes'] })[0];
			const selectedNode = element.getSelectionNodeUpdater(feature.properties);
			if (selectedNode == undefined) return;

			e.preventDefault();

			if (e.originalEvent.shiftKey) return selectedNode.delete();

			const onMove = (e: MapMouseEvent) => {
				e.preventDefault();
				selectedNode.update(e.lngLat.lng, e.lngLat.lat);
				this.drawSelectionNodes(element.getSelectionNodes());
			};

			map.on('mousemove', onMove);
			map.once('mouseup', () => map.off('mousemove', onMove));
		});
		map.on('mouseenter', 'selection_nodes', () => this.cursor.precise(true));
		map.on('mouseleave', 'selection_nodes', () => this.cursor.precise(false));
		map.on('click', (e) => {
			this.setActiveElement(undefined);
			e.preventDefault();
		});
	}

	public setActiveElement(element: AbstractElement | undefined) {
		const elements = get(this.elements);
		if (element && elements.includes(element)) {
			this.drawSelectionNodes(element.getSelectionNodes());
			elements.forEach((e) => (e.isActive = e.isSelected = e == element));
		} else {
			this.drawSelectionNodes([]);
			elements.forEach((e) => {
				e.isActive = true;
				e.isSelected = false;
			});
		}

		this.activeElement.set(element);
	}

	private drawSelectionNodes(nodes: SelectionNode[]) {
		this.selectionNodes.setData({
			type: 'FeatureCollection',
			features: nodes.map((n) => ({
				type: 'Feature',
				properties: { index: n.index, opacity: n.transparent ? 0.3 : 1 },
				geometry: { type: 'Point', coordinates: n.coordinates }
			}))
		});
	}

	public getElement(index: number): AbstractElement {
		return get(this.elements)[index];
	}

	public getNewMarker(): AbstractElement {
		const element = new MarkerElement(this, this.newName('Marker '));
		this.addElement(element);
		return element;
	}

	public getNewLine(): AbstractElement {
		const element = new LineElement(this, this.newName('Line '));
		this.addElement(element);
		return element;
	}

	public getNewPolygon(): AbstractElement {
		const element = new PolygonElement(this, this.newName('Polygon '));
		this.addElement(element);
		return element;
	}

	private addElement(element: AbstractElement) {
		this.elements.update((elements) => [...elements, element]);
	}

	public deleteElement(element: AbstractElement) {
		this.elements.update((elements) => elements.filter((e) => e !== element));
		if (get(this.activeElement) === element) this.setActiveElement(undefined);
	}

	private newName(prefix: string): string {
		const set = new Set<number>();
		const elements = get(this.elements);
		elements.forEach((e) => {
			const name = e.name;
			if (!name.startsWith(prefix)) return;
			const index = name.substring(prefix.length);
			if (!/^[0-9]+/.test(index)) return;
			set.add(parseInt(index, 10));
		});
		for (let i = 1; i <= elements.length + 1; i++) {
			if (!set.has(i)) return prefix + i;
		}
		throw new Error('Unreachable');
	}
}
