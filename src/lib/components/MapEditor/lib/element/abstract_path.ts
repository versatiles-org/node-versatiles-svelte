import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath, ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import { getMiddlePoint, lat2mercator, mercator2lat } from '../utils.js';
import type { MapMouseEvent } from 'maplibre-gl';

export abstract class AbstractPathElement extends AbstractElement {
	public path: ElementPath = [];
	protected readonly isLine: boolean;

	constructor(manager: GeometryManager, isLine: boolean) {
		super(manager);
		this.isLine = isLine;
	}

	protected handleDrag(e: MapMouseEvent) {
		const { lng, lat } = e.lngLat;
		let x0 = lng;
		let y0 = lat2mercator(lat);
		const moveHandler = (e: MapMouseEvent) => {
			const { lng, lat } = e.lngLat;
			const y = lat2mercator(lat);
			const dx = lng - x0;
			const dy = y - y0;
			y0 = y;
			x0 = lng;
			this.path = this.path.map(([x, y]) => [x + dx, mercator2lat(lat2mercator(y) + dy)]);
			this.source.setData(this.getFeature());
			this.manager.drawSelectionNodes();
			e.preventDefault();
		};
		this.manager.map.on('mousemove', moveHandler);
		this.manager.map.once('mouseup', () => this.manager.map.off('mousemove', moveHandler));
		e.preventDefault();
	}

	getSelectionNodes(): SelectionNode[] {
		const points: SelectionNode[] = [];
		for (let i = 0; i < this.path.length; i++) {
			points.push({ index: i, coordinates: this.path[i] });
			if (this.isLine && i === this.path.length - 1) continue;
			const j = (i + 1) % this.path.length;
			points.push({
				index: i + 0.5,
				transparent: true,
				coordinates: getMiddlePoint(this.path[i], this.path[j])
			});
		}
		return points;
	}

	getSelectionNodeUpdater(properties?: Record<string, unknown>): SelectionNodeUpdater | undefined {
		if (properties == undefined) return;
		const index = properties.index as number;
		let point: ElementPoint;
		if (index % 1 === 0) {
			point = this.path[index];
		} else {
			const i = Math.floor(index);
			const j = (i + 1) % this.path.length;
			point = getMiddlePoint(this.path[i], this.path[j]);
			this.path.splice(j, 0, point);
		}

		return {
			update: (lng: number, lat: number) => {
				point[0] = lng;
				point[1] = lat;
				this.source.setData(this.getFeature());
			},
			delete: () => {
				if (this.isLine) {
					if (this.path.length <= 2) return this.delete();
				} else {
					if (this.path.length <= 3) return this.delete();
				}

				this.path.splice(index, 1);
				this.source.setData(this.getFeature());
			}
		};
	}
}
