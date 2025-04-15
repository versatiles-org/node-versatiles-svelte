import { describe, it, expect } from 'vitest';
import { StateWriter } from './writer.js';
import { StateReader } from './reader.js';

describe('StateWriter', () => {
	it('should initialize with an empty bits array', () => {
		const writer = new StateWriter();
		expect(writer.asBitString()).toBe('');
	});

	it('should write a single bit correctly', () => {
		const writer = new StateWriter();
		writer.writeBit(true);
		expect(writer.asBitString()).toBe('1');
		writer.writeBit(false);
		expect(writer.asBitString()).toBe('10');
	});

	it('should write an integer correctly', () => {
		const writer = new StateWriter();
		writer.writeInteger(3, 4);
		expect(writer.asBitString()).toBe('0011');
	});

	it('should write signed varint correctly', () => {
		function test(value: number): string {
			const writer = new StateWriter();
			writer.writeVarint(value, true);
			return writer.asBitString();
		}
		expect(test(-16)).toBe('111110');
		expect(test(-8)).toBe('011110');
		expect(test(-4)).toBe('001110');
		expect(test(-2)).toBe('000110');
		expect(test(-1)).toBe('000010');
		expect(test(0)).toBe('000000');
		expect(test(1)).toBe('000100');
		expect(test(2)).toBe('001000');
		expect(test(4)).toBe('010000');
		expect(test(8)).toBe('100000');

		expect(test(-32)).toBe('111111000010');
		expect(test(16)).toBe('000001000010');
		expect(test(32)).toBe('000001000100');
	});

	it('should write a signed varint correctly', () => {
		const writer = new StateWriter();
		writer.writeVarint(-5, true); // Encoded as signed varint
		expect(writer.asBitString()).toBe('010010'); // Example encoding
	});

	it('should write an array correctly', () => {
		const writer = new StateWriter();
		writer.writeArray([1, 2, 3], (value) => writer.writeInteger(value, 3));
		expect(writer.asBitString()).toBe('000110001010011'); // Example encoding
	});

	describe('writePoint', () => {
		it('should write a point correctly', () => {
			const writer = new StateWriter();
			writer.writePoint([0, 0]);
			expect(writer.asBase64()).toBe('AAAAAAAAA');
		});

		it('should write SW correctly', () => {
			const writer = new StateWriter();
			writer.writePoint([-180, -90], -2);
			expect(writer.asBitString()).toBe('10100110010100110');

			const reader = new StateReader(writer.bits);
			expect(reader.readInteger(9, true)).toBe(-180);
			expect(reader.readInteger(8, true)).toBe(-90);
		});

		it('should write NE correctly', () => {
			const writer = new StateWriter();
			writer.writePoint([180, 90], -2);
			expect(writer.asBitString()).toBe('01011010001011010');

			const reader = new StateReader(writer.bits);
			expect(reader.readInteger(9, true)).toBe(180);
			expect(reader.readInteger(8, true)).toBe(90);
		});
	});

	it('should write multiple points correctly', () => {
		const writer = new StateWriter();
		writer.writePoints([
			[0, 0],
			[1, 1]
		]);
		expect(writer.asBase64()).toBe('EAABBBIBBBI');
	});

	it('should write a root object correctly', () => {
		const writer = new StateWriter();
		writer.writeRoot({
			map: { zoom: 10, center: [1, 2] },
			elements: [
				{
					type: 'marker',
					point: [3, 4],
					style: { halo: 1.5, opacity: 0.8, color: '#ff0000' }
				},
				{
					type: 'line',
					points: [
						[5, 6],
						[7, 8]
					],
					style: { halo: 1.5, opacity: 0.8, color: '#00ff00' }
				},
				{
					type: 'polygon',
					points: [
						[9, 10],
						[11, 12],
						[13, 14]
					],
					style: { halo: 1.5, opacity: 0.8, color: '#0000ff' },
					strokeStyle: { halo: 1.5, opacity: 0.8, color: '#ffff00' }
				}
			]
		});
		expect(writer.asBase64()).toBe(
			'FQACAABAACAwAABAAAi8UIkf4AAAQgIINAIIOAIIKAIIKEXihEgA_wADGBBBJCBBBRCBBBQBBBQBBBQBBBQi8UIkAAB_gi8UIkf_-AA'
		);
	});

	it('should write an empty root object correctly', () => {
		const writer = new StateWriter();
		writer.writeRoot({
			map: {
				zoom: 0,
				center: [0, 0]
			},
			elements: []
		});
		expect(writer.asBitString()).toBe('000100000000000000000000000000000000');
	});

	it('should write a style correctly', () => {
		const writer = new StateWriter();
		writer.writeStyle({
			halo: 1.5,
			opacity: 0.8,
			pattern: 3,
			rotate: -45,
			size: 2.5,
			width: 2.3,
			align: 4,
			label: 'test',
			visible: false,
			color: '#ff0000'
		});
		expect(writer.asBase64()).toBe('F4oRDGTMRcmuciP8AAEkCBHCUA');
	});

	it('should write a RGB color correctly', () => {
		const writer = new StateWriter();
		writer.writeColor('#ff0000');
		expect(writer.asBase64()).toBe('_wAAA');
	});

	it('should write a RGBA color correctly', () => {
		const writer = new StateWriter();
		writer.writeColor('#ff000080');
		expect(writer.asBase64()).toBe('_wAAwA');
	});

	describe('writeString', () => {
		it('should write a string correctly', () => {
			const writer = new StateWriter();
			writer.writeString('Teddy: 🧸');
			expect(writer.asBase64()).toBe('S4CUUmNEA9DtCxfvC');
		});

		it('should have to correct bit length', () => {
			function test(text: string) {
				const writer = new StateWriter();
				writer.writeString(text);
				return writer.bits.length;
			}

			expect(test('')).toBe(6);
			expect(test('T')).toBe(12);
			expect(test('ä')).toBe(18);
			expect(test('🧸')).toBe(54);
		});
	});

	it('should convert bits to Base64 correctly', () => {
		const writer = new StateWriter();
		writer.writeInteger(63, 6);
		expect(writer.asBase64()).toBe('_');
	});
});
