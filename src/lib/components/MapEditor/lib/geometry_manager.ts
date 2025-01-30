import { get, writable, type Writable } from 'svelte/store';
import type { AbstractElement } from './element_abstract.js';
import { MarkerElement } from './element_marker.js';
import type maplibregl from 'maplibre-gl';


export class GeometryManager {
	public elements: Writable<AbstractElement[]>;
	private map: maplibregl.Map;


	constructor(map: maplibregl.Map) {
		this.elements = writable([]);
		this.map = map;
	}

	public getElement(index: number): AbstractElement {
		return get(this.elements)[index];
	}

	public getNewMarker(): AbstractElement {
		const c = this.map.getCenter();
		const element = new MarkerElement(this.map, this.newName('Marker '), [c.lng, c.lat])
		this.addElement(element);
		return element;
	}

	private addElement(element: AbstractElement) {
		this.elements.update(elements => [...elements, element]);
	}

	private newName(prefix: string): string {
		const set = new Set<number>();
		const elements = get(this.elements);
		elements.forEach(e => {
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

