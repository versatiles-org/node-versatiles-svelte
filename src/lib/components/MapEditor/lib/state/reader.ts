import { base64ToUint8Array, decompress } from '../utils.js';

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
}
