import { Color } from '@versatiles/style';
import { BASE64_CHARS, CHAR_CODE2VALUE } from './constants.js';
import { StateReader } from './reader.js';
import type {
	StateElementCircle,
	StateElementLine,
	StateElementMarker,
	StateElementPolygon,
	StateMetadata,
	StateRoot,
	StateStyle
} from './types.js';

export class StateWriter {
	bits: boolean[] = [];

	constructor() {}

	asBase64(): string {
		const reader = new StateReader(this.bits);
		const chars = [];
		while (!reader.ended()) {
			chars.push(BASE64_CHARS[reader.read6pack()]);
		}
		return chars.join('');
	}

	asBitString(): string {
		return this.bits.map((bit) => (bit ? '1' : '0')).join('');
	}

	writeBit(value: boolean) {
		this.bits.push(value);
	}

	writeInteger(value: number, bits: number) {
		if (value % 1 !== 0) throw new Error('value must be an integer');
		for (let i = bits - 1; i >= 0; i--) {
			this.bits.push((value & (1 << i)) > 0);
		}
		return value;
	}

	writeVarint(value: number, signed?: true) {
		if (value % 1 !== 0) throw new Error('value must be an integer');

		if (signed) {
			value = value < 0 ? ((-1 - value) << 1) | 1 : value << 1;
		} else {
			if (value < 0) throw new Error('Unsigned varint cannot be negative');
		}
		while (true) {
			this.writeInteger(value & 0x1f, 5);
			value >>= 5;
			this.writeBit(value >= 1);
			if (value < 1) break;
		}
	}

	writeArray<T>(array: T[], cb: (v: T) => void) {
		const length = array.length;
		this.writeVarint(length);
		for (let i = 0; i < length; i++) cb(array[i]);
	}

	writePoint(point: [number, number], resolutionInMeters: number = 1) {
		if (!resolutionInMeters || resolutionInMeters < 1) resolutionInMeters = 1;

		const scale = Math.round(1e5 / resolutionInMeters);
		this.writeVarint(Math.round(point[0] * scale), true);
		this.writeVarint(Math.round(point[1] * scale), true);
	}

	writePoints(points: [number, number][], resolutionInMeters: number = 1) {
		this.writeVarint(points.length);
		const scale = Math.round(1e5 / resolutionInMeters);
		let x = 0;
		let y = 0;
		points.forEach((point) => {
			const xi = Math.round(point[0] * scale);
			const yi = Math.round(point[1] * scale);
			this.writeVarint(xi - x, true);
			this.writeVarint(yi - y, true);
			x = xi;
			y = yi;
		});
	}

	writeRoot(root: StateRoot) {
		// Write the version
		this.writeInteger(0, 3);

		this.writeMap(root.map);
		this.writeMetadata(root.meta);

		root.elements.forEach((element) => {
			switch (element.type) {
				case 'marker':
					this.writeInteger(1, 3);
					this.writeElementMarker(element);
					break;
				case 'line':
					this.writeInteger(2, 3);
					this.writeElementLine(element);
					break;
				case 'polygon':
					this.writeInteger(3, 3);
					this.writeElementPolygon(element);
					break;
				case 'circle':
					this.writeInteger(4, 3);
					this.writeElementCircle(element);
					break;
			}
		});
	}

	writeMap(map: StateRoot['map']) {
		if (!map) {
			return this.writeBit(false);
		}

		this.writeBit(true);

		const value = Math.round(Math.log2(map.radius) * 40);
		const radius = Math.pow(2, value / 40);
		this.writeInteger(value, 10);
		// effective resolution of coordinates is 1000 times the visible radius
		this.writePoint(map.center, radius / 1e3);

		this.writeBit(false); // additional map data not supported yet
	}

	writeMetadata(metadata?: StateMetadata) {
		if (!metadata || Object.keys(metadata).length === 0) {
			return this.writeBit(false);
		}

		this.writeBit(true);
		//if (metadata.heading) {
		//	this.writeInteger(1, 6);
		//	this.writeString(metadata.heading);
		//}
		this.writeInteger(0, 6);
	}

	writeElementMarker(element: StateElementMarker) {
		this.writePoint(element.point);
		if (element.style) {
			this.writeBit(true);
			this.writeStyle(element.style);
		} else {
			this.writeBit(false);
		}
		this.writeBit(false); // tooltip not supported yet
		return element;
	}

	writeElementLine(element: StateElementLine) {
		this.writePoints(element.points);
		if (element.style) {
			this.writeBit(true);
			this.writeStyle(element.style);
		} else {
			this.writeBit(false);
		}
		this.writeBit(false); // tooltip not supported yet
		return element;
	}

	writeElementPolygon(element: StateElementPolygon) {
		this.writePoints(element.points);
		if (element.style) {
			this.writeBit(true);
			this.writeStyle(element.style);
		} else {
			this.writeBit(false);
		}
		if (element.strokeStyle) {
			this.writeBit(true);
			this.writeStyle(element.strokeStyle);
		} else {
			this.writeBit(false);
		}
		this.writeBit(false); // tooltip not supported yet
	}

	writeElementCircle(element: StateElementCircle) {
		this.writePoint(element.point);
		this.writeVarint(Math.round(element.radius));

		if (element.style) {
			this.writeBit(true);
			this.writeStyle(element.style);
		} else {
			this.writeBit(false);
		}

		if (element.strokeStyle) {
			this.writeBit(true);
			this.writeStyle(element.strokeStyle);
		} else {
			this.writeBit(false);
		}

		this.writeBit(false); // tooltip not supported yet
	}

	writeStyle(style: StateStyle) {
		if (style.halo != null) {
			this.writeInteger(1, 4);
			this.writeVarint(Math.round(style.halo * 10));
		}
		if (style.opacity != null) {
			this.writeInteger(2, 4);
			this.writeVarint(Math.round(style.opacity * 100));
		}
		if (style.pattern != null) {
			this.writeInteger(3, 4);
			this.writeVarint(style.pattern);
		}
		if (style.rotate != null) {
			this.writeInteger(4, 4);
			this.writeVarint(style.rotate, true);
		}
		if (style.size != null) {
			this.writeInteger(5, 4);
			this.writeVarint(Math.round(style.size * 10));
		}
		if (style.width != null) {
			this.writeInteger(6, 4);
			this.writeVarint(Math.round(style.width * 10));
		}
		if (style.align != null) {
			this.writeInteger(7, 4);
			this.writeVarint(style.align);
		}
		if (style.color != null) {
			this.writeInteger(8, 4);
			this.writeColor(style.color);
		}
		if (style.label != null) {
			this.writeInteger(9, 4);
			this.writeString(style.label);
		}
		if (style.visible === false) {
			this.writeInteger(10, 4);
		}
		this.writeInteger(0, 4);
	}

	writeColor(color: string) {
		const rgb = Color.parse(color).asRGB();
		this.writeInteger(rgb.r, 8);
		this.writeInteger(rgb.g, 8);
		this.writeInteger(rgb.b, 8);
		if (rgb.a == 1) {
			this.bits.push(false);
		} else {
			this.bits.push(true);
			this.writeInteger(Math.round(rgb.a * 255), 8);
		}
	}

	writeString(value: string) {
		const charCodes = value.split('').map((c) => c.charCodeAt(0));
		this.writeVarint(charCodes.length);
		charCodes.forEach((c) => this.writeVarint(c < 128 ? CHAR_CODE2VALUE[c] : c));
		return value;
	}
}
