import type { AbstractElement } from './element/abstract.js';
import type { GeometryManagerInteractive } from './geometry_manager_interactive.js';
import type { SelectionHandler } from './selection.js';
import type { StateManager } from './state/manager.js';
import type { StateRoot } from './state/types.js';
import { get, writable, type Writable } from 'svelte/store';
import { getMapStyle } from '../../../utils/map_style.js';
import { CircleElement } from './element/circle.js';
import { LineElement } from './element/line.js';
import { MarkerElement } from './element/marker.js';
import { PolygonElement } from './element/polygon.js';

export class GeometryManager {
	public readonly elements: Writable<AbstractElement[]>;
	public readonly map: maplibregl.Map;
	public readonly canvas: HTMLElement;
	public readonly state: StateManager | null = null;
	public readonly selection: SelectionHandler | null = null;

	constructor(map: maplibregl.Map) {
		this.elements = writable([]);
		this.map = map;
		this.canvas = this.map.getCanvasContainer();

		const style = getMapStyle({ darkMode: false });
		style.transition = { duration: 0, delay: 0 };

		style.sources.selection_nodes = {
			type: 'geojson',
			data: { type: 'FeatureCollection', features: [] }
		};
		style.layers.push({
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

		map.setStyle(style);
	}

	public isInteractive(): this is GeometryManagerInteractive {
		return false;
	}

	public clear() {
		this.elements.update((elements) => {
			elements.forEach((e) => e.destroy());
			return [];
		});
	}

	protected appendElement(element: AbstractElement) {
		this.elements.update((elements) => [...elements, element]);
	}

	public removeElement(element: AbstractElement) {
		this.elements.update((elements) => elements.filter((e) => e !== element));
	}

	public async loadState(state: StateRoot) {
		if (!state) return;
		this.clear();
		this.setState(state);
		this.state?.history.reset(state);
	}

	public async setState(state: StateRoot) {
		if (!state) return;

		this.clear();

		if (state.map) {
			const { center, radius } = state.map;
			const dy = (radius * 360) / 40074000;
			const dx = dy / Math.cos((center[1] * Math.PI) / 180);
			const bounds: [[number, number], [number, number]] = [
				[center[0] - dx, center[1] - dy],
				[center[0] + dx, center[1] + dy]
			];
			this.map.fitBounds(bounds, { animate: false });
		}

		if (!this.map.isStyleLoaded()) {
			await new Promise((r) => this.map.once('styledata', r));
		}

		if (state.elements) {
			const elements = state.elements.map((element) => {
				switch (element.type) {
					case 'marker':
						return MarkerElement.fromState(this, element);
					case 'line':
						return LineElement.fromState(this, element);
					case 'polygon':
						return PolygonElement.fromState(this, element);
					case 'circle':
						return CircleElement.fromState(this, element);
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
}
