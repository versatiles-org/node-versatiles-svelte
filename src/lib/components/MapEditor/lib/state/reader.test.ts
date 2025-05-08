import { describe, it, expect } from 'vitest';
import { StateReader } from './reader.js';
import type { StateMetadata, StateRoot, StateStyle } from './types.js';
import { StateWriter } from './writer.js';

describe('StateReader', () => {
	const path: [number, number][] = [
		[13.37097, 52.51837],
		[13.36962, 52.51568],
		[13.35131, 52.51452],
		[13.35089, 52.51477],
		[13.3504, 52.51507],
		[13.3496, 52.51507],
		[13.34912, 52.51477],
		[13.34899, 52.5144],
		[13.34918, 52.51409],
		[13.3496, 52.51391],
		[13.35021, 52.51379],
		[13.35119, 52.50952],
		[13.35192, 52.50671]
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
			expect(StateReader.fromBitString('000000000000').readPoint(1e5)).toStrictEqual([0, 0]);
			expect(StateReader.fromBitString('001111010110100111001010').readPoint(1e5)).toStrictEqual([
				-180, -90
			]);
			expect(StateReader.fromBitString('010001010110101001001010').readPoint(1e5)).toStrictEqual([
				180, 90
			]);
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
			expect(test(-180, -90, 1e4)).toStrictEqual([-180, -90]);
			expect(test(180, 90, 1e4)).toStrictEqual([180, 90]);

			expect(test(0.4, 3.1, 1e4)).toStrictEqual([0.4, 3.1]);
		});
	});

	describe('readPoints', () => {
		it('should write and read point arrays correctly', () => {
			const writer = new StateWriter();
			writer.writePoints(path);
			expect(writer.asBase64()).toBe('alhnjE1fjBUbQzgblGPOnElCDG5C_IA_E3CyTENC7CpEHC1GuJMr0lIji');

			const reader = new StateReader(writer.bits);

			expect(reader.readPoints()).toStrictEqual(path);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readMap', () => {
		it('should write and read a map object 1', () => {
			const map: StateRoot['map'] = {
				center: [1.0085728693898135, 2.017145738779627],
				radius: 10085.53503412156
			};
			const writer = new StateWriter();
			writer.writeMap(map);
			expect(writer.asBitString()).toBe('11000010100000001100011100110000001000101001111000010');

			const reader = new StateReader(writer.bits);
			expect(reader.readMap()).toStrictEqual(map);
			expect(reader.ended()).toBe(true);
		});

		it('should write and read a map object 2', () => {
			const map: StateRoot['map'] = {
				center: [-121.013, 82.65],
				radius: 10.021315508993023
			};
			const writer = new StateWriter();
			writer.writeMap(map);
			expect(writer.asBitString()).toBe(
				'10010000101001111010111100111000101101110100001100101011101110001011110'
			);

			const reader = new StateReader(writer.bits);
			expect(reader.readMap()).toStrictEqual(map);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readMetadata', () => {
		function test(metadata0: StateMetadata | undefined, expected: string) {
			const writer = new StateWriter();
			writer.writeMetadata(metadata0);
			expect(writer.asBase64()).toBe(expected);

			const reader = new StateReader(writer.bits);

			const metadata1 = reader.readMetadata();
			if (JSON.stringify(metadata0) == '{}') metadata0 = undefined;
			expect(metadata1).toStrictEqual(metadata0);

			expect(reader.ended()).toBe(true);
		}
		it('should read undefined metadata correctly', () => {
			test(undefined, 'A');
		});
		it('should read empty metadata correctly', () => {
			test({}, 'A');
		});
		it('should read heading correctly', () => {
			test(
				{
					heading: 'AZ'
				},
				'giBhIiAA'
			);
		});
	});

	describe('readRoot', () => {
		it('should read a root state', () => {
			const reader = StateReader.fromBitString('000000000000000000000000000000000');
			const root = reader.readRoot();
			expect(root).toStrictEqual({ elements: [] });
		});

		it('should read a simple root state', () => {
			const root = {
				map: {
					center: [1, 2],
					radius: 8192
				},
				elements: [
					{
						type: 'marker',
						point: [3, 4]
					}
				]
			} as StateRoot;

			const writer = new StateWriter();
			writer.writeRoot(root);
			expect(writer.asBitString()).toBe(
				'00011000001000111101110101101110111001101011011111000010000100000111110101001110010000000101000101101111000000'
			);

			const reader = new StateReader(writer.bits);
			expect(reader.readRoot()).toStrictEqual(root);
		});

		it('should read a root object correctly', () => {
			const root: StateRoot = {
				map: {
					radius: 1024,
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
				'FkIb_SgX-1hB9TkBRbwiwVKkf4AAAIQGWHwHmckIGk1gGk1gbUsM8Ymr8YKjaGcDcox504koQY3IX5AH4m4WSYhoXYVIg4Wo1xJlekpEcUXihEgAAP-yBF4oRI__8AA'
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
				visible: false,
				color: '#C400FF42'
			};
			const writer = new StateWriter();
			writer.writeStyle(style);
			expect(writer.asBase64()).toBe('F4oRDGTMRcmuciMQA_6FJAgRwlA');

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
			expect(writer.asBase64()).toBe(
				'JGzCCSSMsAqMQSUsA5DtCbxvCsArdCrdCFfC5dCxdCsA3NI7NIDPI7NIJPIpNI1NIxNIsAfjCNlCZtCPjCsALzCBzCDzChxCsAlTGXVGrRGFRGsAPjCJlCzjCPjCJlCLlCsAfjCNlCZtCsAthmZV6sAX5CV7CF5CR7Cp5CZ7CsA2RONCyBOKsAt5Kv7Kv5Kt5K35KJ9KB5KsAlTGXVGrRGFRGs'
			);

			const reader = new StateReader(writer.bits);
			expect(reader.readString()).toBe(text);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('readColor', () => {
		it('should read a color', () => {
			const reader = StateReader.fromBitString(
				['00000000', '01111011', '11111111', '1', '00110011'].join('')
			);
			const color = reader.readColor();
			expect(color).toBe('#007BFF33');
			expect(reader.ended()).toBe(true);
		});
		it('should write and read a RGB color', () => {
			const color = '#123456';
			const writer = new StateWriter();
			writer.writeColor(color);
			expect(writer.asBitString()).toBe('0001001000110100010101100');

			const reader = new StateReader(writer.bits);
			expect(reader.readColor()).toBe(color);
			expect(reader.ended()).toBe(true);
		});
		it('should write and read a RGBA color', () => {
			const color = '#12345678';
			const writer = new StateWriter();
			writer.writeColor(color);
			expect(writer.asBitString()).toBe('000100100011010001010110101111000');

			const reader = new StateReader(writer.bits);
			expect(reader.readColor()).toBe(color);
			expect(reader.ended()).toBe(true);
		});
	});

	describe('big hashes', () => {
		it('should return demo route', () => {
			const reader = StateReader.fromBase64(
				'Foef09wuVSUziaJjnjEJhjBUvQrgvlGPODE5CjGdCnICDGvCyDEZCTElEHCxGyRMj09GfitKFFUAAABNtfjE9LfBUuJFUAACRnwiFAGWGeMT2OMFS4kVQAAJK2EGQEAyHRaYxCW4wVDkUG2AAyD0JiRVAAACykVQAAAA'
			);
			expect(reader.readRoot()).toStrictEqual({
				elements: [
					{
						points: [
							[expect.closeTo(13.37106, 5), expect.closeTo(52.51842, 5)],
							[expect.closeTo(13.36966, 5), expect.closeTo(52.51575, 5)],
							[expect.closeTo(13.3513, 5), expect.closeTo(52.51459, 5)],
							[expect.closeTo(13.35097, 5), expect.closeTo(52.51489, 5)],
							[expect.closeTo(13.3504, 5), expect.closeTo(52.51512, 5)],
							[expect.closeTo(13.34966, 5), expect.closeTo(52.51511, 5)],
							[expect.closeTo(13.34917, 5), expect.closeTo(52.51483, 5)],
							[expect.closeTo(13.34904, 5), expect.closeTo(52.5145, 5)],
							[expect.closeTo(13.34926, 5), expect.closeTo(52.51413, 5)],
							[expect.closeTo(13.34967, 5), expect.closeTo(52.51395, 5)],
							[expect.closeTo(13.35027, 5), expect.closeTo(52.51382, 5)],
							[expect.closeTo(13.35127, 5), expect.closeTo(52.50957, 5)],
							[expect.closeTo(13.3519, 5), expect.closeTo(52.50677, 5)]
						],
						style: {
							color: '#AA0000',
							width: 5
						},
						type: 'line'
					},
					{
						point: [expect.closeTo(13.35139, 5), expect.closeTo(52.50655, 5)],
						style: {
							align: 2,
							color: '#AA0000',
							label: 'End'
						},
						type: 'marker'
					},
					{
						point: [expect.closeTo(13.37097, 5), expect.closeTo(52.51871, 5)],
						style: {
							align: 2,
							color: '#AA0000',
							label: 'Start'
						},
						type: 'marker'
					},
					{
						points: [
							[expect.closeTo(13.37383, 5), expect.closeTo(52.51794, 5)],
							[expect.closeTo(13.37379, 5), expect.closeTo(52.51926, 5)],
							[expect.closeTo(13.3718, 5), expect.closeTo(52.51926, 5)],
							[expect.closeTo(13.37115, 5), expect.closeTo(52.51794, 5)]
						],
						strokeStyle: {
							color: '#AA0000',
							width: 1
						},
						style: {
							color: '#AA0000',
							pattern: 2
						},
						type: 'polygon'
					}
				],
				map: {
					center: [expect.closeTo(13.35992, 5), expect.closeTo(52.51305, 5)],
					radius: expect.closeTo(1374.79)
				}
			});
		});
	});
});
