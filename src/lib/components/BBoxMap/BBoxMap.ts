import type { Feature, GeoJSON, Position } from 'geojson';
import type { LngLat, Point } from 'maplibre-gl';

export type BBox = [number, number, number, number];
export type BBoxDrag = '0_' | '1_' | '_0' | '_1' | '00' | '01' | '10' | '11' | false;

export function getBBoxDrag(point: Point, bboxPixel: BBox): BBoxDrag {
	const maxDistance = 5;

	const { x, y } = point;
	const [x0, y0, x1, y1] = bboxPixel;

	// Don't think outside the box
	if (x < x0 - maxDistance) return false;
	if (x > x1 + maxDistance) return false;
	if (y < y0 - maxDistance) return false;
	if (y > y1 + maxDistance) return false;

	const drag: [boolean, boolean, boolean, boolean] = [
		Math.abs(x0 - x) < maxDistance,
		Math.abs(y0 - y) < maxDistance,
		Math.abs(x1 - x) < maxDistance,
		Math.abs(y1 - y) < maxDistance
	];

	if (drag[0] && drag[2]) {
		if (Math.abs(x0 - x) < Math.abs(x1 - x)) {
			drag[2] = false;
		} else {
			drag[0] = false;
		}
	}

	if (drag[1] && drag[3]) {
		if (Math.abs(y0 - y) < Math.abs(y1 - y)) {
			drag[3] = false;
		} else {
			drag[1] = false;
		}
	}

	if (drag[0]) {
		if (drag[1]) return '01';
		if (drag[3]) return '00';
		return '0_';
	} else if (drag[1]) {
		if (drag[2]) return '11';
		return '_1';
	} else if (drag[2]) {
		if (drag[3]) return '10';
		return '1_';
	} else if (drag[3]) {
		return '_0';
	} else return false;
}

export function dragBBox(
	bbox: BBox,
	drag: BBoxDrag,
	lngLat: LngLat
): { bbox: BBox; drag: BBoxDrag } {
	const x = Math.round(lngLat.lng * 1e3) / 1e3;
	const y = Math.round(lngLat.lat * 1e3) / 1e3;
	switch (drag) {
		case '_0':
			bbox[1] = y;
			break;
		case '_1':
			bbox[3] = y;
			break;
		case '0_':
			bbox[0] = x;
			break;
		case '00':
			bbox[0] = x;
			bbox[1] = y;
			break;
		case '01':
			bbox[0] = x;
			bbox[3] = y;
			break;
		case '1_':
			bbox[2] = x;
			break;
		case '10':
			bbox[2] = x;
			bbox[1] = y;
			break;
		case '11':
			bbox[2] = x;
			bbox[3] = y;
			break;
	}
	if (bbox[2] < bbox[0]) {
		// flip horizontal
		const t = bbox[0];
		bbox[0] = bbox[2];
		bbox[2] = t;
		switch (drag) {
			case '0_':
				drag = '1_';
				break;
			case '00':
				drag = '10';
				break;
			case '01':
				drag = '11';
				break;
			case '1_':
				drag = '0_';
				break;
			case '10':
				drag = '00';
				break;
			case '11':
				drag = '01';
				break;
		}
	}
	if (bbox[3] < bbox[1]) {
		// flip vertical
		const t = bbox[1];
		bbox[1] = bbox[3];
		bbox[3] = t;
		switch (drag) {
			case '_0':
				drag = '_1';
				break;
			case '_1':
				drag = '_0';
				break;
			case '00':
				drag = '01';
				break;
			case '01':
				drag = '00';
				break;
			case '10':
				drag = '11';
				break;
			case '11':
				drag = '10';
				break;
		}
	}
	return { drag, bbox };
}

export function getCursor(drag: BBoxDrag): string | false {
	switch (drag) {
		case '_0':
			return 'ns-resize';
		case '_1':
			return 'ns-resize';
		case '0_':
			return 'ew-resize';
		case '00':
			return 'nesw-resize';
		case '01':
			return 'nwse-resize';
		case '1_':
			return 'ew-resize';
		case '10':
			return 'nwse-resize';
		case '11':
			return 'nesw-resize';
	}
	return false;
}

export function getBBoxGeometry(bbox: BBox): GeoJSON {
	return {
		type: 'FeatureCollection',
		features: [polygon(getRing([-180, -86, 180, 86]), getRing(bbox)), linestring(getRing(bbox))]
	};
	function polygon(...coordinates: Position[][]): Feature {
		return {
			type: 'Feature',
			geometry: { type: 'Polygon', coordinates },
			properties: {}
		};
	}
	function linestring(coordinates: Position[]): Feature {
		return {
			type: 'Feature',
			geometry: { type: 'LineString', coordinates },
			properties: {}
		};
	}
	function getRing(bbox: BBox): Position[] {
		const x0 = Math.min(bbox[0], bbox[2]);
		const x1 = Math.max(bbox[0], bbox[2]);
		const y0 = Math.min(bbox[1], bbox[3]);
		const y1 = Math.max(bbox[1], bbox[3]);
		return [
			[x0, y0],
			[x1, y0],
			[x1, y1],
			[x0, y1],
			[x0, y0]
		];
	}
}

export async function loadBBoxes(): Promise<{ key: string; value: BBox; }[]> {
	const data = await import('./bboxes.json');

	const bboxes = data.default.map((e) => {
		const key = e[0] as string;

		const value = e.slice(1, 5) as BBox;
		value[2] = Math.round((value[2] + value[0]) * 1e5) / 1e5;
		value[3] = Math.round((value[3] + value[1]) * 1e5) / 1e5;

		return { key, value };
	})
	
	return bboxes;
}
