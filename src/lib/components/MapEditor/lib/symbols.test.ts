import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSymbol, getSymbolIndexByName, SymbolLibrary } from './symbols.js';
import { MockMap } from '../../../__mocks__/map.js';

describe('getSymbol', () => {
	it('should return the correct symbol for a given index', () => {
		const symbol = getSymbol(1);
		expect(symbol).toEqual({
			index: 1,
			name: 'airplane',
			image: 'basics:icon-airfield'
		});
	});

	it('should return the default symbol for an unknown index', () => {
		const symbol = getSymbol(999);
		expect(symbol).toEqual({
			index: 38,
			name: 'flag',
			image: 'basics:icon-embassy',
			offset: [0, 0]
		});
	});
});

describe('getSymbolIndexByName', () => {
	it('should return the correct index for a given symbol name', () => {
		const index = getSymbolIndexByName('airplane');
		expect(index).toBe(1);
	});

	it('should return undefined for an unknown symbol name', () => {
		const index = getSymbolIndexByName('unknown');
		expect(index).toBeUndefined();
	});
});

describe('SymbolLibrary', () => {
	let map: MockMap;
	let symbolLibrary: SymbolLibrary;

	beforeEach(() => {
		map = new MockMap();
		symbolLibrary = new SymbolLibrary(map as unknown as maplibregl.Map);
	});

	it('should return the correct symbol for a given index', () => {
		const symbol = symbolLibrary.getSymbol(1);
		expect(symbol).toEqual({
			index: 1,
			name: 'airplane',
			image: 'basics:icon-airfield'
		});
	});

	it('should draw the symbol on the canvas', () => {
		const ctx = {
			putImageData: vi.fn()
		} as unknown as CanvasRenderingContext2D;
		const canvas = {
			getContext: vi.fn(() => ctx),
			width: 100,
			height: 100
		} as unknown as HTMLCanvasElement;

		class MyImageData {
			constructor(data: Uint8ClampedArray, width: number, height: number) {
				expect(data.length).toBe(100 * 100 * 4);
				expect(width).toBe(100);
				expect(height).toBe(100);
			}
		}

		// @ts-expect-error Mocking globalThis
		globalThis.ImageData = MyImageData;

		vi.spyOn(map, 'getImage').mockReturnValue({
			sdf: false,
			data: {
				data: new Uint8ClampedArray(50 * 50 * 4),
				width: 50,
				height: 50
			}
		});

		symbolLibrary.drawSymbol(canvas, 1);
		expect(map.getImage).toBeCalledWith('basics:icon-airfield');
		expect(canvas.getContext).toBeCalledWith('2d');
		expect(ctx.putImageData).toBeCalledWith(expect.any(MyImageData), 0, 0);
	});

	it('should return the list of all symbols', () => {
		const symbols = symbolLibrary.asList();
		expect(symbols.length).toBeGreaterThan(0);
		expect(symbols[0]).toEqual({
			index: 0,
			name: 'none'
		});
	});
});
