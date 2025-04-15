export interface StateRoot {
	map?: {
		center: [number, number];
		zoom: number;
	};
	meta?: StateMetadata;
	elements: StateElement[];
}

export type StateElement = StateElementMarker | StateElementLine | StateElementPolygon;

export interface StateElementMarker {
	type: 'marker';
	point: [number, number];
	style?: StateStyle;
	tooltip?: StateTooltip;
}

export interface StateElementLine {
	type: 'line';
	points: [number, number][];
	style?: StateStyle;
	tooltip?: StateTooltip;
}

export interface StateElementPolygon {
	type: 'polygon';
	points: [number, number][];
	style?: StateStyle;
	strokeStyle?: StateStyle;
	tooltip?: StateTooltip;
}

export interface StateStyle {
	halo?: number;
	opacity?: number;
	pattern?: number;
	rotate?: number;
	size?: number;
	width?: number;
	align?: number;
	color?: string;
	label?: string;
	visible?: boolean;
}

export interface StateMetadata {
	title?: string;
}

export interface StateTooltip {
	text?: string;
}
