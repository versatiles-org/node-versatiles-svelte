import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element/abstract.js';
import type { SelectionNode } from './element/types.js';
import type { GeometryManagerInteractive } from './geometry_manager_interactive.js';

export class SelectionHandler {
	public readonly selectedElement: Writable<AbstractElement | undefined> = writable(undefined);
	private selectionNodes: maplibregl.GeoJSONSource | undefined;
	private manager: GeometryManagerInteractive;

	constructor(manager: GeometryManagerInteractive) {
		this.manager = manager;
		const map = this.manager.map;

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
				this.updateSelectionNodes();
			} else {
				const onMove = (e: maplibregl.MapMouseEvent) => {
					e.preventDefault();
					selectedNode.update(e.lngLat.lng, e.lngLat.lat);
					this.updateSelectionNodes();
				};

				map.on('mousemove', onMove);
				map.once('mouseup', () => {
					map.off('mousemove', onMove);
					this.manager.state.log();
				});
			}
		});

		map.on('mouseenter', 'selection_nodes', () => {
			this.manager.cursor.togglePrecise('selection_nodes');
		});
		map.on('mouseleave', 'selection_nodes', () => {
			this.manager.cursor.togglePrecise('selection_nodes', false);
		});

		map.on('click', (e) => {
			if (!e.originalEvent.shiftKey) this.selectElement();
			e.preventDefault();
		});
	}

	public selectElement(element?: AbstractElement) {
		if (element == get(this.selectedElement)) return;
		const elements = get(this.manager.elements);
		elements.forEach((e) => e.select(e == element));
		this.selectedElement.set(element);
		this.updateSelectionNodes();
	}

	public updateSelectionNodes() {
		const nodes: SelectionNode[] = get(this.selectedElement)?.getSelectionNodes() ?? [];
		if (!this.selectionNodes) this.selectionNodes = this.manager.map.getSource('selection_nodes')!;
		this.selectionNodes?.setData({
			type: 'FeatureCollection',
			features: nodes.map((n) => ({
				type: 'Feature',
				properties: { index: n.index, opacity: n.transparent ? 0.3 : 1 },
				geometry: { type: 'Point', coordinates: n.coordinates }
			}))
		});
	}
}
