import { compress, uint8ArrayToBase64 } from '../utils.js';

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

	getBase64(): string {
		return uint8ArrayToBase64(this.getBuffer());
	}

	async getBase64compressed(): Promise<string> {
		return uint8ArrayToBase64(await compress(this.getBuffer()));
	}

	getBuffer(): Uint8Array {
		return this.buffer.slice(0, this.offset);
	}
}
