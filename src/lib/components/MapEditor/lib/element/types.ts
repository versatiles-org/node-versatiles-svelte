import type { GeoPoint } from '../utils/types.js';

export interface SelectionNode {
	coordinates: GeoPoint;
	index: number;
	transparent?: boolean;
}

export interface SelectionNodeUpdater {
	update: (lng: number, lat: number) => void;
	delete: () => void;
}
