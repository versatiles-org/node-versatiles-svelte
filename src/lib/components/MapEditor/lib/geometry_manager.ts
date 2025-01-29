import type { AbstractElement } from './element_abstract.js';
import { MarkerElement } from './element_marker.js';
import type maplibregl from 'maplibre-gl';


export class GeometryManager {
	private geometries: AbstractElement[];
	private map: maplibregl.Map;


	constructor(map: maplibregl.Map) {
		this.geometries = [];
		this.map = map;
	}

	public getNewMarker(): AbstractElement {
		const c = this.map.getCenter();
		const marker = new MarkerElement(this.map, this.newName('Marker '), [c.lng, c.lat])
		this.geometries.push(marker);
		return marker;
	}

	private newName(prefix: string): string {
		const set = new Set<number>();
		this.geometries.forEach(e => {
			if (!e.name.startsWith(prefix)) return;
			const index = e.name.substring(prefix.length);
			if (!/^[1-9][0-9]*/.test(index)) return;
			set.add(parseInt(index, 10));
		});
		for (let i = 0; i <= this.geometries.length; i++) {
			if (!set.has(i)) return prefix + i;
		}
		throw new Error('Unreachable');
	}
}

