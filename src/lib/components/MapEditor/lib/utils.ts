import type { ElementPoint } from './element/types.js';

export function getMiddlePoint(p0: ElementPoint, p1: ElementPoint): ElementPoint {
	const y0 = lat2mercator(p0[1]);
	const y1 = lat2mercator(p1[1]);
	return [(p0[0] + p1[0]) / 2, mercator2lat((y0 + y1) / 2)];
}

export function lat2mercator(lat: number): number {
	return Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360));
}

export function mercator2lat(y: number): number {
	return ((2 * Math.atan(Math.exp(y)) - Math.PI / 2) * 180) / Math.PI;
}

export function base64ToUint8Array(base64: string): Uint8Array {
	const binaryString = atob(base64);
	return Uint8Array.from(binaryString, (c) => c.charCodeAt(0));
}

export function uint8ArrayToBase64(data: Uint8Array): string {
	const binaryString = String.fromCharCode(...data);
	return btoa(binaryString);
}

export async function compress(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data]).stream();
	const compressedStream = stream.pipeThrough(new CompressionStream('deflate-raw'));
	return new Uint8Array(await new Response(compressedStream).arrayBuffer());
}

export async function decompress(data: Uint8Array): Promise<Uint8Array> {
	const stream = new Blob([data]).stream();
	const decompressedStream = stream.pipeThrough(new DecompressionStream('deflate-raw'));
	const arrayBuffer = await new Response(decompressedStream).arrayBuffer();
	return new Uint8Array(arrayBuffer);
}
