export interface StateRoot {
	map?: {
		center: [number, number];
		radius: number;
	};
	meta?: StateMetadata;
	elements: StateElement[];
}

export type StateElement = StateElementMarker | StateElementLine | StateElementPolygon | StateElementCircle;

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

export interface StateElementCircle {
	type: 'circle';
	point: [number, number];
	radius: number;
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

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface StateMetadata {}

export interface StateTooltip {
	text?: string;
}
