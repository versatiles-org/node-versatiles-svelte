import { describe, it, expect } from 'vitest';
import { StateReader } from './reader.js';
import type { StateRoot, StateStyle } from './types.js';
import { StateWriter } from './writer.js';

describe('StateReader', () => {
	const path: [number, number][] = [
		[13.3709716796875, 52.51837158203125],
		[13.36962890625, 52.51568603515625],
		[13.351318359375, 52.5145263671875],
		[13.35089111328125, 52.5147705078125],
		[13.35040283203125, 52.51507568359375],
		[13.349609375, 52.51507568359375],
		[13.34912109375, 52.5147705078125],
		[13.3489990234375, 52.514404296875],
		[13.34918212890625, 52.51409912109375],
		[13.349609375, 52.513916015625],
		[13.3502197265625, 52.5137939453125],
		[13.3511962890625, 52.509521484375],
		[13.3519287109375, 52.5067138671875]
	];

	describe('fromBase64', () => {
		it('should create a StateReader instance from a valid base64 string', () => {
			function test(base64: string): number[] {
				const reader = StateReader.fromBase64(base64);
				const values = [];
				for (let i = 0; i < base64.length; i++) values.push(reader.readInteger(6));
				expect(reader.ended()).toBe(true);
				return values;
			}
			expect(test('A')).toStrictEqual([0]);
			expect(test('B')).toStrictEqual([1]);
			expect(test('ABCEIQg89-_')).toStrictEqual([0, 1, 2, 4, 8, 16, 32, 60, 61, 62, 63]);
		});

		it('should throw an error for an invalid base64 string', () => {
			const base64 = '#'; // Invalid character
			expect(() => StateReader.fromBase64(base64)).toThrowError(
				'Invalid character in base64 string: #'
			);
		});
	});

	describe('readBit', () => {
		it('should read a single bit and increment the offset', () => {
			const reader = StateReader.fromBitString('0101');
			expect(reader.readBit()).toBe(false);
			expect(reader.readBit()).toBe(true);
			expect(reader.readBit()).toBe(false);

			expect(reader.ended()).toBe(false);
			expect(reader.readBit()).toBe(true);

			expect(reader.ended()).toBe(true);
			expect(() => reader.readBit()).toThrowError('End of bits');
		});
	});

	describe('readInteger', () => {
		it('should read an unsigned integer', () => {
			function test(bits: string): number {
				const reader = StateReader.fromBitString(bits);
				const value = reader.readInteger(bits.length);
				expect(reader.ended()).toBe(true);
				return value;
			}
			expect(test('0000')).toBe(0);
			expect(test('0001')).toBe(1);
			expect(test('0011')).toBe(3);
			expect(test('0111')).toBe(7);
			expect(test('1000')).toBe(8);
			expect(test('1100')).toBe(12);
			expect(test('1110')).toBe(14);
			expect(test('1111')).toBe(15);
		});

		it('should read a signed integer', () => {
			function test(bits: string): number {
				const reader = StateReader.fromBitString(bits);
				const value = reader.readInteger(bits.length, true);
				expect(reader.ended()).toBe(true);
				return value;
			}
			expect(test('0000')).toBe(0);
			expect(test('0001')).toBe(1);
			expect(test('0011')).toBe(3);
			expect(test('0111')).toBe(7);
			expect(test('1000')).toBe(-8);
			expect(test('1100')).toBe(-4);
			expect(test('1110')).toBe(-2);
			expect(test('1111')).toBe(-1);
		});

		it('should read integer from writer correctly', () => {
			function test(value: number, bits: number, signed?: true) {
				const writer = new StateWriter();
				writer.writeInteger(value, bits);
				const reader = new StateReader(writer.bits);
				expect(reader.readInteger(bits, signed)).toBe(value);
				expect(reader.ended()).toBe(true);
			}
			test(0, 4);
			test(1, 4);
			test(3, 4);
			test(7, 4);
			test(14, 4);
			test(15, 4);
			test(255, 8);
			test(-128, 8, true);
			test(-1, 8, true);
		});
	});

	describe('readVarint', () => {
		it('should read an unsigned varint', () => {
			function test(bits: string): number {
				const reader = StateReader.fromBitString(bits);
				const value = reader.readVarint();
				expect(reader.ended()).toBe(true);
				return value;
			}
			expect(test('000000')).toBe(0);
			expect(test('000010')).toBe(1);
			expect(test('000100')).toBe(2);
			expect(test('001000')).toBe(4);
			expect(test('010000')).toBe(8);
			expect(test('100000')).toBe(16);
			expect(test('000001000010')).toBe(32);
		});

		it('should read a signed varint', () => {
			function test(bits: string): number {
				const reader = StateReader.fromBitString(bits);
				const value = reader.readVarint(true);
				expect(reader.ended()).toBe(true);
				return value;
			}
			expect(test('111110')).toBe(-16);
			expect(test('011110')).toBe(-8);
			expect(test('001110')).toBe(-4);
			expect(test('000110')).toBe(-2);
			expect(test('000010')).toBe(-1);
			expect(test('000000')).toBe(0);
			expect(test('000100')).toBe(1);
			expect(test('001000')).toBe(2);
			expect(test('010000')).toBe(4);
			expect(test('100000')).toBe(8);

			expect(test('111111000010')).toBe(-32);
			expect(test('000001000010')).toBe(16);
			expect(test('000001000100')).toBe(32);
		});

		it('should read varint from writer correctly', () => {
			function test(value: number, signed?: true) {
				const writer = new StateWriter();
				writer.writeVarint(value, signed);
				const reader = new StateReader(writer.bits);
				expect(reader.readVarint(signed)).toBe(value);
				expect(reader.ended()).toBe(true);
			}
			test(0);
			test(1);
			test(65535);
			test(65536);
			test(65535, true);
			test(65536, true);
			test(-65535, true);
			test(-65536, true);
		});
	});

	describe('readArray', () => {
		it('should read an array of elements', () => {
			const reader = StateReader.fromBitString('000110110');
			const array = reader.readArray(() => reader.readBit());
			expect(array).toEqual([true, true, false]);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readPoint', () => {
		it('should read a point with default level', () => {
			expect(StateReader.fromBitString('00000000000000000').readPoint(-2)).toStrictEqual([0, 0]);
			expect(StateReader.fromBitString('10100110010100110').readPoint(-2)).toStrictEqual([
				-180, -90
			]);
			expect(StateReader.fromBitString('01011010001011010').readPoint(-2)).toStrictEqual([180, 90]);
		});

		it('should write and read points correctly', () => {
			function test(x: number, y: number, bits: number) {
				const writer = new StateWriter();
				writer.writePoint([x, y], bits);
				const reader = new StateReader(writer.bits);
				const point = reader.readPoint(bits);
				expect(reader.ended()).toBe(true);
				return point;
			}
			expect(test(-180, -90, -2)).toStrictEqual([-180, -90]);
			expect(test(180, 90, -2)).toStrictEqual([180, 90]);

			expect(test(0.4, 3.1, 1)).toStrictEqual([0.375, 3.125]);
		});
	});
	describe('readPoints', () => {
		it('should write and read point arrays correctly', () => {
			const writer = new StateWriter();
			writer.writePoints(path, 12);
			expect(writer.asBase64().length).toBe(41);
			const reader = new StateReader(writer.bits);

			expect(reader.readPoints(12)).toStrictEqual(path);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readRoot', () => {
		it('should read a root state', () => {
			const reader = StateReader.fromBitString('000000000000000000000000000000000');
			const root = reader.readRoot();
			expect(root).toStrictEqual({ elements: [] });
		});

		it('should read a root object correctly', () => {
			const root: StateRoot = {
				map: {
					zoom: 10,
					center: [1, 2]
				},
				elements: [
					{
						type: 'marker',
						point: [3, 4],
						style: { halo: 1.2, opacity: 3.4, color: '#FF0000' }
					},
					{
						type: 'line',
						points: [
							[5, 6],
							[7, 8]
						]
					},
					{
						type: 'polygon',
						points: path,
						style: { halo: 1.5, opacity: 0.8, color: '#0000FF64' },
						strokeStyle: { halo: 1.5, opacity: 0.8, color: '#FFFF00' }
					}
				]
			};
			const writer = new StateWriter();
			writer.writeRoot(root);
			expect(writer.asBase64()).toBe(
				'KgAEAACAAQDAAAEAACLBUqR_gAABiAgg0Agg4AggoAggoI1C-_WEiuLKY-V-p-qJeReECF-EiEeMB-EeE8-FgeFiFdCI8CQ_ECM-tF4oRIAAD_sgReKESP__AAA'
			);
			const reader = new StateReader(writer.bits);
			expect(reader.readRoot()).toStrictEqual(root);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readStyle', () => {
		it('should read a style object', () => {
			const reader = StateReader.fromBitString('00010000100000');
			const style = reader.readStyle();
			expect(style).toStrictEqual({ halo: 0.1 });
			expect(reader.ended()).toBe(true);
		});

		it('should read a style correctly', () => {
			const style: StateStyle = {
				halo: 1.5,
				opacity: 0.8,
				pattern: 3,
				rotate: -45,
				size: 2.5,
				width: 2.3,
				align: 4,
				label: 'test',
				invisible: true,
				color: '#C400FF42'
			};
			const writer = new StateWriter();
			writer.writeStyle(style);
			const reader = new StateReader(writer.bits);
			expect(reader.readStyle()).toStrictEqual(style);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readString', () => {
		it('should read a string', () => {
			const reader = StateReader.fromBase64('S4CUUmNEA9DtCxfvC');
			expect(reader.readString()).toBe('Teddy: 🧸');
			expect(reader.ended()).toBe(true);
		});

		it('should write and read a string', () => {
			const text =
				'Hello, world, 🌍, וועלט, მოსოფელი, دنیا, ܥܠܡܐ, ലോകം, العالم, دنی, 世界, ދުނިޔެ, Sè-kài, ពិភពលោក, ലോകം,';
			const writer = new StateWriter();
			writer.writeString(text);
			const reader = new StateReader(writer.bits);
			expect(reader.readString()).toBe(text);
			expect(reader.ended()).toBe(true);
		});
	});
});
