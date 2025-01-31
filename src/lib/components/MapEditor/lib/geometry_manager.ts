import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element_abstract.js';
import { MarkerElement } from './element_marker.js';
import type maplibregl from 'maplibre-gl';
import type { MapMouseEvent } from 'maplibre-gl';

export class GeometryManager {
	public readonly elements: Writable<AbstractElement[]>;
	public readonly map: maplibregl.Map;
	public readonly activeElement: Writable<AbstractElement | undefined> = writable(undefined);
	private readonly selection_nodes: maplibregl.GeoJSONSource;
	private readonly canvas: HTMLElement;

	constructor(map: maplibregl.Map) {
		this.elements = writable([]);
		this.map = map;
		this.canvas = this.map.getCanvasContainer();

		map.addSource('selection_nodes', {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		});
		this.selection_nodes = map.getSource('selection_nodes')!;
		map.addLayer({
			id: 'selection_nodes',
			source: 'selection_nodes',
			type: 'circle',
			layout: {},
			paint: {
				'circle-color': '#ffffff',
				'circle-radius': 4,
				'circle-stroke-width': 1.5,
				'circle-stroke-color': '#000000'
			}
		});
		map.on('mousedown', 'selection_nodes', (e) => {
			const element = get(this.activeElement)!;
			if (element == undefined) return;

			const feature = map.queryRenderedFeatures(e.point, { layers: ['selection_nodes'] })[0];
			const dragged_index = feature.properties.index;
			if (dragged_index == undefined) return;

			e.preventDefault();

			const onMove = (e: MapMouseEvent) => {
				e.preventDefault();
				this.canvas.style.cursor = 'grabbing';
				element.updateSelectionNode(dragged_index, [e.lngLat.lng, e.lngLat.lat]);
				this.selection_nodes.setData({
					type: 'FeatureCollection',
					features: element.getSelectionNodes()
				});
			};

			const onUp = () => {
				map.off('mousemove', onMove);
				this.canvas.style.cursor = 'default';
			};

			map.once('mouseup', onUp);
			map.on('mousemove', onMove);
		});
		map.on('mouseover', 'selection_nodes', () => (this.canvas.style.cursor = 'move'));
		map.on('mouseout', 'selection_nodes', () => (this.canvas.style.cursor = 'default'));
		map.on('click', (e) => {
			this.setActiveElement(undefined);
			e.preventDefault();
		});
	}

	public setActiveElement(element: AbstractElement | undefined) {
		if (element) {
			if (!get(this.elements).includes(element)) throw new Error('Element not in list');
			this.selection_nodes.setData({
				type: 'FeatureCollection',
				features: element.getSelectionNodes()
			});
		} else {
			this.selection_nodes.setData({ type: 'FeatureCollection', features: [] });
		}
		this.activeElement.set(element);
	}

	public getElement(index: number): AbstractElement {
		return get(this.elements)[index];
	}

	public getNewMarker(): AbstractElement {
		const element = new MarkerElement(this, this.newName('Marker '));
		this.addElement(element);
		return element;
	}

	private addElement(element: AbstractElement) {
		this.elements.update((elements) => [...elements, element]);
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
		for (let i = 0; i <= elements.length; i++) {
			if (!set.has(i)) return prefix + i;
		}
		throw new Error('Unreachable');
	}
}
