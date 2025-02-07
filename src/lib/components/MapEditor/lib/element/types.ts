export type ElementPoint = [number, number];
export type ElementPath = ElementPoint[];

export interface SelectionNode {
	coordinates: ElementPoint;
	index: number;
	transparent?: boolean;
}

export interface SelectionNodeUpdater {
	update: (lng: number, lat: number) => void;
	delete: () => void;
}
