import { Color } from '@versatiles/style';
import { compress, uint8ArrayToBase64 } from '../utils.js';
import type { StateObject } from './types.js';

const chunkSize = 65536;

export class StateWriter {
	public buffer = new Uint8Array(chunkSize);
	public offset = 0;

	constructor() {}

	writeByte(num: number) {
		if (this.offset >= this.buffer.length) {
			const newBuffer = new Uint8Array(this.buffer.length + chunkSize);
			newBuffer.set(this.buffer);
			this.buffer = newBuffer;
		}
		this.buffer[this.offset++] = num;
	}

	writeUnsignedInteger(i: number) {
		if (!Number.isSafeInteger(i)) {
			throw new RangeError(`Number out of safe integer range: ${i}`);
		}
		while (i > 0x7f) {
			this.writeByte((i & 0x7f) | 0x80);
			i >>>= 7;
		}
		this.writeByte(i);
	}

	writeSignedInteger(i: number) {
		if (!Number.isSafeInteger(i)) {
			throw new RangeError(`Number out of safe integer range: ${i}`);
		}
		this.writeUnsignedInteger(i < 0 ? -i * 2 - 1 : i * 2);
	}

	writeString(str: string) {
		const length = str.length;
		this.writeUnsignedInteger(length);
		for (let i = 0; i < length; i++) this.writeUnsignedInteger(str.charCodeAt(i));
	}

	writeBoolean(b: boolean) {
		this.writeByte(b ? 1 : 0);
	}

	getBase64(): string {
		return uint8ArrayToBase64(this.getBuffer());
	}

	async getBase64compressed(): Promise<string> {
		return uint8ArrayToBase64(await compress(this.getBuffer()));
	}

	getBuffer(): Uint8Array {
		return this.buffer.slice(0, this.offset);
	}

	writeObject(state: StateObject) {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const me = this;

		Object.entries(state).forEach(([key, value]: [string, unknown]) => {
			if (value == null) return;
			switch (key) {
				case 'map':
					writeObject(10, value);
					break;
				case 'style':
					writeObject(11, value);
					break;
				case 'strokeStyle':
					writeObject(12, value);
					break;

				case 'elements':
					if (!Array.isArray(value)) throw new Error(`Invalid elements: ${value}`);
					if (value.length === 0) return;
					this.writeByte(20);
					this.writeUnsignedInteger(value.length);
					value.forEach((element: StateObject) => this.writeObject(element));
					break;

				case 'point':
					if (!Array.isArray(value) || value.length !== 2)
						throw new Error(`Invalid point: ${value}`);
					this.writeByte(30);
					me.writeSignedInteger(Math.round(value[0] * 1e5));
					me.writeSignedInteger(Math.round(value[1] * 1e5));
					break;

				case 'points':
					if (!Array.isArray(value)) throw new Error(`Invalid points: ${value}`);
					if (value.length === 0) return;
					this.writeByte(31);
					this.writeUnsignedInteger(value.length);
					this.writeDifferential(value.map((p) => Math.round(p[0] * 1e5)));
					this.writeDifferential(value.map((p) => Math.round(p[1] * 1e5)));
					break;

				case 'color':
					this.writeByte(40);
					this.writeColor(value);
					break;

				case 'type':
					this.writeByte(50);
					switch (value) {
						case 'marker':
							this.writeByte(0);
							break;
						case 'line':
							this.writeByte(1);
							break;
						case 'polygon':
							this.writeByte(2);
							break;
						default:
							throw new Error(`Invalid type: ${value}`);
					}
					break;

				case 'label':
					if (typeof value !== 'string') throw new Error(`Invalid string: ${value}`);
					this.writeByte(60);
					this.writeString(value);
					break;

				case 'halo':
					writeInteger(70, value, 10);
					break;
				case 'opacity':
					writeInteger(71, value, 100);
					break;
				case 'pattern':
					writeInteger(72, value);
					break;
				case 'rotate':
					writeSignedInteger(73, value);
					break;
				case 'size':
					writeInteger(74, value, 10);
					break;
				case 'width':
					writeInteger(75, value, 10);
					break;
				case 'zoom':
					writeInteger(76, value, 20);
					break;
				case 'align':
					writeInteger(77, value);
					break;

				case 'visible':
					if (typeof value !== 'boolean') throw new Error(`Invalid boolean: ${value}`);
					this.writeByte(90);
					this.writeBoolean(value);
					break;

				default:
					throw new Error(`Invalid state key: ${key}`);
			}
		});
		this.writeByte(0);

		function writeObject(id: number, obj: unknown) {
			if (typeof obj !== 'object' || obj == null) throw new Error(`Invalid object: ${obj}`);
			me.writeByte(id);
			me.writeObject(obj as StateObject);
		}

		function writeInteger(id: number, obj: unknown, factor = 1) {
			if (typeof obj !== 'number') throw new Error(`Invalid number: ${obj}`);
			const value = Math.round(obj);
			if (value < 0) throw new Error(`Negative Number: ${obj}`);
			me.writeByte(id);
			me.writeUnsignedInteger(value * factor);
		}

		function writeSignedInteger(id: number, obj: unknown, factor = 1) {
			if (typeof obj !== 'number') throw new Error(`Invalid number: ${obj}`);
			const value = Math.round(obj);
			me.writeByte(id);
			me.writeSignedInteger(value * factor);
		}
	}

	writeColor(color: unknown) {
		if (typeof color !== 'string') throw new Error(`Invalid color: ${color}`);
		const c = Color.parse(color).asRGB().round().asArray();
		this.writeByte(c[0]);
		this.writeByte(c[1]);
		this.writeByte(c[2]);
	}

	writeDifferential(values: number[]) {
		if (values.length === 0) return;
		this.writeSignedInteger(values[0]);
		for (let i = 1; i < values.length; i++) {
			this.writeSignedInteger(values[i] - values[i - 1]);
		}
	}
}
