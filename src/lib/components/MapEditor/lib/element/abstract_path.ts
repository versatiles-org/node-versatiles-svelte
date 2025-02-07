import { AbstractElement } from './abstract.js';
import type { GeometryManager } from '../geometry_manager.js';
import type { ElementPath, ElementPoint, SelectionNode, SelectionNodeUpdater } from './types.js';
import { getMiddlePoint } from '../utils.js';

export abstract class AbstractPathElement extends AbstractElement {
	protected path: ElementPath = [];
	protected readonly isLine: boolean;

	constructor(manager: GeometryManager, name: string, isLine: boolean) {
		super(manager, name);
		this.isLine = isLine;
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
			delete: () => this.delete()
		};
	}
}
