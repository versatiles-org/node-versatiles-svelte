export interface StateRoot {
	map_zoom: number;
	map_center: [number, number];
	elements: StateElement[];
}

export type StateElement = StateElementMarker | StateElementLine | StateElementPolygon;

export interface StateElementMarker {
	type: 'marker';
	point: [number, number];
	style?: StateStyle;
}

export interface StateElementLine {
	type: 'line';
	points: [number, number][];
	style?: StateStyle;
}

export interface StateElementPolygon {
	type: 'polygon';
	points: [number, number][];
	style?: StateStyle;
	strokeStyle?: StateStyle;
}

export interface StateStyle {
	/*1*/ halo?: number;
	/*2*/ opacity?: number;
	/*3*/ pattern?: number;
	/*4*/ rotate?: number;
	/*5*/ size?: number;
	/*6*/ width?: number;
	/*7*/ align?: number;
	/*8*/ color?: string;
	/*9*/ label?: string;
	/*10*/ invisible?: true;
}
