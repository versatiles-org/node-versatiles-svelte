export interface StateObject {
	[key: string]:
		| StateObject
		| StateObject[]
		| [number, number]
		| [number, number][]
		| string
		| number
		| undefined;

	/*10*/ map?: StateObject;
	/*11*/ style?: StateObject;
	/*12*/ strokeStyle?: StateObject;

	/*20*/ elements?: StateObject[];

	//### FLOATS
	/*30*/ point?: [number, number];
	/*31*/ points?: [number, number][];

	//### COLORS
	/*40*/ color?: string;

	//### LOOKUPS
	/*50*/ type?: string;

	//### STRINGS
	/*60*/ label?: string;

	//### INTEGERS
	/*70*/ halo?: number;
	/*71*/ opacity?: number;
	/*72*/ pattern?: number;
	/*73*/ rotate?: number;
	/*74*/ size?: number;
	/*75*/ width?: number;
	/*76*/ zoom?: number;
}
