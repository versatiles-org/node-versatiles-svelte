import { Color } from '@versatiles/style';
import { AbstractElement } from './element_abstract.js';
import { get, writable } from 'svelte/store';
import type { GeometryManager } from './geometry_manager.js';
import type { ElementLine, ElementPoint, LayerLine, SelectionNode } from './types.js';
import { getMiddlePoint } from './utils.js';

export const dashArrays = new Map<string, number[] | undefined>([
	['solid', undefined],
	['dashed', [2, 4]],
	['dotted', [0, 2]]
]);

export class LineElement extends AbstractElement<LayerLine> {
	public readonly color = writable('#ff0000');
	public readonly dashed = writable('solid');
	public readonly width = writable(2);

	private line: ElementLine = [
		[0, 0],
		[0, 0]
	];

	constructor(manager: GeometryManager, name: string, line?: ElementLine) {
		super(manager, name, 'line');
		this.line = line ?? this.randomPositions(name, 2);

		const getDashArray = (): number[] | undefined => dashArrays.get(get(this.dashed));

		this.layer.setLayout({
			'line-cap': 'round',
			'line-join': 'round'
		});
		this.layer.setPaint({
			'line-color': Color.parse(get(this.color)).asString(),
			'line-dasharray': getDashArray(),
			'line-width': get(this.width)
		});

		this.color.subscribe((value) => this.layer.updatePaint('line-color', Color.parse(value)));
		this.width.subscribe((value) => this.layer.updatePaint('line-width', value));
		this.dashed.subscribe(() => this.layer.updatePaint('line-dasharray', getDashArray()));

		this.source.setData(this.getFeature());
	}

	getFeature(): GeoJSON.Feature<GeoJSON.LineString> {
		return {
			type: 'Feature',
			properties: {},
			geometry: { type: 'LineString', coordinates: this.line }
		};
	}

	getSelectionNodes(): SelectionNode[] {
		const points: SelectionNode[] = [];
		for (let i = 0; i < this.line.length; i++) {
			points.push({ index: i, coordinates: this.line[i] });
			if (i === this.line.length - 1) continue;
			points.push({
				index: i + 0.5,
				transparent: true,
				coordinates: getMiddlePoint(this.line[i], this.line[i + 1])
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
			point = this.line[index];
		} else {
			const i = Math.ceil(index);
			this.line.splice(i, 0, [0, 0]);
			point = this.line[i];
		}

		return (lng: number, lat: number) => {
			point[0] = lng;
			point[1] = lat;
			this.source.setData(this.getFeature());
		};
	}
}
