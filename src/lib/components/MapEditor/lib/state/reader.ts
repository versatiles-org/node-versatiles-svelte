import { Color } from '@versatiles/style';
import type {
	StateElementLine,
	StateElementMarker,
	StateElementPolygon,
	StateRoot,
	StateStyle
} from './types.js';
import { BASE64_CODE2BITS, CHAR_VALUE2CODE } from './constants.js';

export class StateReader {
	public bits: boolean[];
	public offset: number = 0;

	constructor(bits: boolean[]) {
		this.bits = bits;
	}

	static fromBase64(text: string): StateReader {
		const bits: boolean[] = [];
		for (let i = 0; i < text.length; i++) {
			const charCode = text.charCodeAt(i);
			const charBits = BASE64_CODE2BITS[charCode];
			if (!charBits) {
				throw new Error(`Invalid character in base64 string: ${text[i]}`);
			}
			bits.push(...charBits);
		}
		return new StateReader(bits);
	}

	static fromBitString(text: string): StateReader {
		return new StateReader(text.split('').map((c) => c === '1'));
	}

	ended(): boolean {
		return this.offset >= this.bits.length;
	}

	readBit(): boolean {
		if (this.ended()) throw new Error('End of bits');
		return this.bits[this.offset++];
	}

	readInteger(bits: number, signed?: true): number {
		try {
			let value = 0;
			for (let i = 0; i < bits; i++) {
				value <<= 1;
				if (this.readBit()) value += 1;
			}
			if (signed && value >= 1 << (bits - 1)) {
				value -= 1 << bits;
			}
			return value;
		} catch (cause) {
			throw new Error(`Error reading integer`, { cause });
		}
	}

	read6pack(): number {
		let value = 0;
		for (let i = 0; i < 6; i++) {
			value <<= 1;
			if (this.bits[this.offset++]) value += 1;
		}
		return value;
	}

	readVarint(signed?: true): number {
		try {
			let value = 0;
			let offset = 0;
			do {
				value += this.readInteger(5) << offset;
				offset += 5;
			} while (this.readBit());
			if (!signed) return value;
			return value & 1 ? -((value >> 1) + 1) : value >> 1;
		} catch (cause) {
			throw new Error(`Error reading readVarint`, { cause });
		}
	}

	readArray<T>(cb: () => T): T[] {
		try {
			const length = this.readVarint();
			const array: T[] = [];
			for (let i = 0; i < length; i++) array.push(cb());
			return array;
		} catch (cause) {
			throw new Error(`Error reading array`, { cause });
		}
	}

	readPoint(level: number = 14): [number, number] {
		try {
			const scale = Math.pow(2, level + 2);
			return [
				this.readInteger(level + 11, true) / scale,
				this.readInteger(level + 10, true) / scale
			];
		} catch (cause) {
			throw new Error(`Error reading point`, { cause });
		}
	}

	readPoints(level: number = 14): [number, number][] {
		try {
			const length = this.readVarint();
			const scale = Math.pow(2, -level - 2);
			let x = 0;
			let y = 0;
			const points: [number, number][] = [];
			for (let i = 0; i < length; i++) {
				x += this.readVarint(true);
				y += this.readVarint(true);
				points[i] = [x * scale, y * scale];
			}
			return points;
		} catch (cause) {
			throw new Error(`Error reading points`, { cause });
		}
	}

	readRoot(): StateRoot {
		try {
			const root: StateRoot = { elements: [] };

			const version = this.readInteger(3);
			if (version != 0) {
				throw new Error(`Unsupported version: ${version}`);
			}

			// Read the map element
			if (this.readBit()) {
				root.map = this.readMap();
			}

			// Read the metadata
			if (this.readBit()) {
				throw new Error(`Metadata not supported yet`);
			}

			// Read the elements
			while (true) {
				let key: number;
				try {
					key = this.readInteger(3);
				} catch (_) {
					key = 0;
				}
				switch (key) {
					case 0:
						return root;
					case 1:
						root.elements.push(this.readElementMarker());
						break;
					case 2:
						root.elements.push(this.readElementLine());
						break;
					case 3:
						root.elements.push(this.readElementPolygon());
						break;
					default:
						console.warn(`Unknown state key: ${key}`);
				}
			}
		} catch (cause) {
			throw new Error(`Error reading root`, { cause });
		}
	}

	readMap(): NonNullable<StateRoot['map']> {
		try {
			const zoom = this.readInteger(10) / 32;
			const center = this.readPoint(Math.ceil(zoom));
			return { zoom, center };
		} catch (cause) {
			throw new Error(`Error reading map`, { cause });
		}
	}

	readElementMarker(): StateElementMarker {
		try {
			const element: StateElementMarker = { type: 'marker', point: this.readPoint() };
			if (this.readBit()) element.style = this.readStyle();
			if (this.readBit()) throw new Error(`Tooltip not supported yet`);
			return element;
		} catch (cause) {
			throw new Error(`Error reading marker element`, { cause });
		}
	}

	readElementLine(): StateElementLine {
		try {
			const element: StateElementLine = { type: 'line', points: this.readPoints() };
			if (this.readBit()) element.style = this.readStyle();
			if (this.readBit()) throw new Error(`Tooltip not supported yet`);
			return element;
		} catch (cause) {
			throw new Error(`Error reading line element`, { cause });
		}
	}

	readElementPolygon(): StateElementPolygon {
		try {
			const element: StateElementPolygon = { type: 'polygon', points: this.readPoints() };
			if (this.readBit()) element.style = this.readStyle();
			if (this.readBit()) element.strokeStyle = this.readStyle();
			if (this.readBit()) throw new Error(`Tooltip not supported yet`);
			return element;
		} catch (cause) {
			throw new Error(`Error reading polygon element`, { cause });
		}
	}

	readStyle(): StateStyle {
		try {
			const style: StateStyle = {};
			while (true) {
				const key = this.readInteger(4);
				switch (key) {
					case 0:
						return style;
					case 1:
						style.halo = this.readVarint() / 10;
						break;
					case 2:
						style.opacity = this.readVarint() / 100;
						break;
					case 3:
						style.pattern = this.readVarint();
						break;
					case 4:
						style.rotate = this.readVarint(true);
						break;
					case 5:
						style.size = this.readVarint() / 10;
						break;
					case 6:
						style.width = this.readVarint() / 10;
						break;
					case 7:
						style.align = this.readVarint();
						break;
					case 8:
						style.color = this.readColor();
						break;
					case 9:
						style.label = this.readString();
						break;
					case 10:
						style.visible = false;
						break;
					default:
						throw new Error(`Invalid state key: ${key}`);
				}
			}
		} catch (cause) {
			throw new Error(`Error reading style`, { cause });
		}
	}

	readColor(): string {
		try {
			const r = this.readInteger(8);
			const g = this.readInteger(8);
			const b = this.readInteger(8);

			let a = 1;
			if (this.readBit()) a = this.readInteger(8) / 255;
			return new Color.RGB(r, g, b, a).asHex();
		} catch (cause) {
			throw new Error(`Error reading color`, { cause });
		}
	}

	readString(): string {
		try {
			const length = this.readVarint();
			const charCodes: number[] = [];
			for (let i = 0; i < length; i++) {
				const value = this.readVarint();
				charCodes.push(value < 128 ? CHAR_VALUE2CODE[value] : value);
			}
			return String.fromCharCode(...charCodes);
		} catch (cause) {
			throw new Error(`Error reading string`, { cause });
		}
	}
}
