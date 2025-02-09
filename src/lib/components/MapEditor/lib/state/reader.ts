import { base64ToUint8Array, decompress } from '../utils.js';
import type { StateObject } from './types.js';

export class StateReader {
	private buffer: Uint8Array;
	private offset: number = 0;

	constructor(buffer: Uint8Array | number[]) {
		if (buffer instanceof Uint8Array) {
			this.buffer = buffer;
		} else if (Array.isArray(buffer)) {
			this.buffer = new Uint8Array(buffer);
		} else {
			throw new TypeError('Invalid buffer type');
		}
	}

	readByte(): number {
		if (this.offset >= this.buffer.length) {
			throw new RangeError('Attempt to read past end of buffer');
		}
		return this.buffer[this.offset++];
	}

	readUnsignedInteger(): number {
		let result = 0,
			shift = 0,
			byte: number;

		do {
			if (this.offset >= this.buffer.length) {
				throw new RangeError('Unexpected end of buffer while reading integer');
			}
			byte = this.readByte();
			result |= (byte & 0x7f) << shift;
			shift += 7;
		} while (byte & 0x80);

		return result;
	}

	readSignedInteger(): number {
		const result = this.readUnsignedInteger();
		if (result & 1) {
			return -((result + 1) / 2);
		} else {
			return result / 2;
		}
	}

	readString(): string {
		const length = this.readUnsignedInteger();
		let str = '';
		for (let i = 0; i < length; i++) {
			str += String.fromCharCode(this.readUnsignedInteger());
		}
		return str;
	}

	static async fromBase64compressed(base64: string): Promise<StateReader> {
		return new StateReader(await decompress(base64ToUint8Array(base64)));
	}

	static async fromBase64(base64: string): Promise<StateReader> {
		return new StateReader(base64ToUint8Array(base64));
	}

	readObject(): StateObject {
		const state: StateObject = {};
		while (true) {
			const key = this.readByte();
			if (key === 0) break;

			switch (key) {
				case 10:
					state.map = this.readObject();
					break;
				case 11:
					state.style = this.readObject();
					break;
				case 12:
					state.strokeStyle = this.readObject();
					break;
				case 20:
					{
						const length = this.readUnsignedInteger();
						state.elements = Array.from({ length }, () => this.readObject());
					}
					break;
				case 30:
					state.point = [this.readSignedInteger() / 1e5, this.readSignedInteger() / 1e5];
					break;
				case 31:
					{
						const count = this.readUnsignedInteger();
						const x = this.readDifferential(count);
						const y = this.readDifferential(count);
						state.points = Array.from({ length: count }, (_, i) => [x[i] / 1e5, y[i] / 1e5]);
					}
					break;
				case 40:
					state.color = this.readColor();
					break;
				case 50:
					state.type = this.readType();
					break;
				case 60:
					state.label = this.readString();
					break;
				case 70:
					state.halo = this.readUnsignedInteger();
					break;
				case 71:
					state.opacity = this.readUnsignedInteger();
					break;
				case 72:
					state.pattern = this.readUnsignedInteger();
					break;
				case 73:
					state.rotate = this.readUnsignedInteger();
					break;
				case 74:
					state.size = this.readUnsignedInteger();
					break;
				case 75:
					state.width = this.readUnsignedInteger();
					break;
				case 76:
					state.zoom = this.readUnsignedInteger();
					break;
				default:
					throw new Error(`Invalid state key: ${key}`);
			}
		}
		return state;
	}

	readDifferential(count: number): number[] {
		const values: number[] = [];
		if (count === 0) return values;
		let value = this.readSignedInteger();
		values.push(value);
		for (let i = 1; i < count; i++) {
			value += +this.readSignedInteger();
			values.push(value);
		}
		return values;
	}

	readColor(): string {
		const r = this.readByte();
		const g = this.readByte();
		const b = this.readByte();
		return `rgb(${r},${g},${b})`;
	}

	readType(): string {
		const type = this.readByte();
		switch (type) {
			case 0:
				return 'marker';
			case 1:
				return 'line';
			case 2:
				return 'polygon';
			default:
				throw new Error(`Invalid type: ${type}`);
		}
	}
}
