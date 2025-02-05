import { Color } from '@versatiles/style';
import { AbstractElement } from './element_abstract.js';
import { get, writable } from 'svelte/store';
import type { GeometryManager } from './geometry_manager.js';
import type { ElementLine, ElementPoint, LayerFill, SelectionNode } from './types.js';
import { getMiddlePoint } from './utils.js';

export class PolygonElement extends AbstractElement<LayerFill> {
	public readonly fillColor = writable('#ff0000');
	public readonly opacity = writable(1);

	private polygon: ElementLine = [
		[0, 0],
		[0, 1],
		[1, 1]
	];

	constructor(manager: GeometryManager, name: string, polygon?: ElementLine) {
		super(manager, name, 'fill');
		this.polygon = polygon ?? this.randomPositions(name, 3);

		this.layer.setLayout({
		});
		this.layer.setPaint({
			'fill-color': Color.parse(get(this.fillColor)).asString(),
			'fill-opacity': get(this.opacity)
		});

		this.fillColor.subscribe((value) => this.layer.updatePaint('fill-color', Color.parse(value)));
		this.opacity.subscribe((value) => this.layer.updatePaint('fill-opacity', value));

		this.source.setData(this.getFeature());
	}

	getFeature(): GeoJSON.Feature<GeoJSON.Polygon> {
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'Polygon', coordinates: [[...this.polygon, this.polygon[0]]] }
		};
	}

	getSelectionNodes(): SelectionNode[] {
		const points: SelectionNode[] = [];
		for (let i = 0; i < this.polygon.length; i++) {
			points.push({ index: i, coordinates: this.polygon[i] });
			const j = (i + 1) % this.polygon.length;
			points.push({
				index: i + 0.5,
				transparent: true,
				coordinates: getMiddlePoint(this.polygon[i], this.polygon[j])
			});
		}
		return points;
	}

	getSelectionNodeUpdater(
		properties?: Record<string, unknown>
	): ((lng: number, lat: number) => void) | undefined {
		if (properties == undefined) return;
		const index = properties.index as number;
		let point: ElementPoint;
		if (index % 1 === 0) {
			point = this.polygon[index];
		} else {
			const i = Math.ceil(index);
			this.polygon.splice(i, 0, [0, 0]);
			point = this.polygon[i];
		}

		return (lng: number, lat: number) => {
			point[0] = lng;
			point[1] = lat;
			this.source.setData(this.getFeature());
		};
	}
}
