import { describe, it, expect, vi, beforeEach, type Mock, type Mocked } from 'vitest';
import { writable, type Writable } from 'svelte/store';
import { SelectionHandler } from './selection.js';
import { MockMap } from '../../../__mocks__/map.js';
import type maplibregl from 'maplibre-gl';
import type { GeometryManagerInteractive } from './geometry_manager_interactive.js';
import type { Cursor } from './cursor.js';
import type { StateManager } from './state/manager.js';
import type { AbstractElement } from './element/abstract.js';

function createSelectionNode(index = 0, transparent = false, coordinates = [0, 0]) {
	return { index, transparent, coordinates };
}

describe('SelectionHandler', () => {
	let handler: SelectionHandler;
	let mockMap: MockMap;
	let mockCursor: Mocked<Cursor>;
	let mockState: Mocked<StateManager>;
	let mockElements: Writable<AbstractElement[]>;
	let mockManager: GeometryManagerInteractive;

	beforeEach(() => {
		mockMap = new MockMap();
		mockCursor = {
			togglePrecise: vi.fn()
		} as unknown as Mocked<Cursor>;
		mockState = {
			log: vi.fn()
		} as unknown as Mocked<StateManager>;
		mockElements = writable([]);
		mockManager = {
			map: mockMap,
			cursor: mockCursor,
			state: mockState,
			elements: mockElements
		} as unknown as GeometryManagerInteractive;

		vi.clearAllMocks();
		mockElements.set([]);
		handler = new SelectionHandler(mockManager);
	});

	it('should initialize with undefined selectedElement', () => {
		let value;
		handler.selectedElement.subscribe((v) => (value = v))();
		expect(value).toBeUndefined();
	});

	it('selectElement sets selected element and updates nodes', () => {
		const selectMock = vi.fn();
		const element = {
			select: selectMock,
			getSelectionNodes: vi.fn().mockReturnValue([])
		} as unknown as AbstractElement;
		mockElements.set([element]);
		handler.selectElement(element);
		let value;
		handler.selectedElement.subscribe((v) => (value = v))();
		expect(value).toBe(element);
		expect(selectMock).toHaveBeenCalledWith(true);
	});

	it('selectElement deselects previous element', () => {
		const selectMock1 = vi.fn();
		const selectMock2 = vi.fn();
		const element1 = {
			select: selectMock1,
			getSelectionNodes: vi.fn().mockReturnValue([])
		} as unknown as AbstractElement;
		const element2 = {
			select: selectMock2,
			getSelectionNodes: vi.fn().mockReturnValue([])
		} as unknown as AbstractElement;
		mockElements.set([element1, element2]);
		handler.selectElement(element1);
		handler.selectElement(element2);
		expect(selectMock1).toHaveBeenCalledWith(false);
		expect(selectMock2).toHaveBeenCalledWith(true);
	});

	it('updateSelectionNodes sets data on selectionNodes source', () => {
		const setDataMock = vi.fn();
		mockMap.getSource.mockReturnValue({ setData: setDataMock } as unknown as maplibregl.Source);
		const selectionNode = createSelectionNode(1, true, [1, 2]);
		const element = {
			getSelectionNodes: vi.fn().mockReturnValue([selectionNode])
		};
		handler.selectedElement.set(element as unknown as AbstractElement);
		handler.updateSelectionNodes();
		expect(setDataMock).toHaveBeenCalledWith({
			type: 'FeatureCollection',
			features: [
				{
					type: 'Feature',
					properties: { index: 1, opacity: 0.3 },
					geometry: { type: 'Point', coordinates: [1, 2] }
				}
			]
		});
	});

	it('updateSelectionNodes does nothing if no selected element', () => {
		const setDataMock = vi.fn();
		mockMap.getSource.mockReturnValue({ setData: setDataMock } as unknown as maplibregl.Source);
		handler.selectedElement.set(undefined);
		handler.updateSelectionNodes();
		expect(setDataMock).toHaveBeenCalledWith({
			type: 'FeatureCollection',
			features: []
		});
	});

	describe('handle mouse events', () => {
		it('should handle mouseenter', () => {
			mockMap.emit('mouseenter');
			expect(mockCursor.togglePrecise).toHaveBeenCalledExactlyOnceWith('selection_nodes');
		});

		it('should handle mouseleave', () => {
			mockMap.emit('mouseleave');
			expect(mockCursor.togglePrecise).toHaveBeenCalledExactlyOnceWith('selection_nodes', false);
		});

		it('should call selectElement on click if shiftKey is not pressed', () => {
			const selectElementSpy = vi.spyOn(handler, 'selectElement');
			const event = { originalEvent: { shiftKey: false }, preventDefault: vi.fn() };
			mockMap.emit('click', event);
			expect(selectElementSpy).toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalled();
		});

		it('should not call selectElement on click if shiftKey is pressed', () => {
			const selectElementSpy = vi.spyOn(handler, 'selectElement');
			const event = { originalEvent: { shiftKey: true }, preventDefault: vi.fn() };
			mockMap.emit('click', event);
			expect(selectElementSpy).not.toHaveBeenCalled();
			expect(event.preventDefault).toHaveBeenCalled();
		});
	});

	describe('handle mousedown', () => {
		let element: Mocked<AbstractElement>;
		let deleteMock: Mock;
		let updateMock: Mock;

		beforeEach(() => {
			deleteMock = vi.fn();
			updateMock = vi.fn();
			element = {
				getSelectionNodeUpdater: vi.fn().mockReturnValue({
					update: updateMock,
					delete: deleteMock
				}),
				getSelectionNodes: vi.fn().mockReturnValue([])
			} as unknown as Mocked<AbstractElement>;
			handler.selectedElement.set(element);
		});

		it('should handle mousedown', () => {
			const event = { point: {}, originalEvent: { shiftKey: false }, preventDefault: vi.fn() };
			mockMap.emit('mousedown', event);
			expect(event.preventDefault).toHaveBeenCalled();
			expect(mockMap.queryRenderedFeatures).toHaveBeenCalledWith(event.point, { layers: ['selection_nodes'] });
		});

		it('should not call getSelectionNodeUpdater if no selected element on mousedown', () => {
			handler.selectedElement.set(undefined);
			const event = { point: {}, originalEvent: { shiftKey: false }, preventDefault: vi.fn() };
			mockMap.emit('mousedown', event);
		});

		it('should do nothing if getSelectionNodeUpdater returns null', () => {
			element.getSelectionNodeUpdater.mockReturnValue(undefined);
			mockMap.queryRenderedFeatures.mockReturnValue([
				{ properties: { foo: 1 } } as unknown as maplibregl.MapGeoJSONFeature
			]);
			const event = { point: {}, originalEvent: { shiftKey: false }, preventDefault: vi.fn() };
			mockMap.emit('mousedown', event);
			expect(element.getSelectionNodeUpdater).toHaveBeenCalled();
		});

		it('should delete node and update selection nodes if shiftKey is pressed on mousedown', () => {
			const updateSelectionNodesMock = vi.spyOn(handler, 'updateSelectionNodes');
			mockMap.queryRenderedFeatures.mockReturnValue([
				{ properties: { foo: 1 } } as unknown as maplibregl.MapGeoJSONFeature
			]);
			const event = { point: {}, originalEvent: { shiftKey: true }, preventDefault: vi.fn() };
			mockMap.emit('mousedown', event);
			expect(deleteMock).toHaveBeenCalled();
			expect(updateSelectionNodesMock).toHaveBeenCalled();
		});

		it('should handle node dragging on mousedown without shiftKey', () => {
			mockMap.queryRenderedFeatures.mockReturnValue([
				{ properties: { foo: 1 } } as unknown as maplibregl.MapGeoJSONFeature
			]);
			const event = { point: {}, originalEvent: { shiftKey: false }, preventDefault: vi.fn() };
			mockMap.emit('mousedown', event);

			// Simulate mousemove
			const moveEvent = { lngLat: { lng: 10, lat: 20 }, preventDefault: vi.fn() };
			mockMap.emit('mousemove', moveEvent);
			expect(updateMock).toHaveBeenCalledWith(10, 20);

			// Simulate mouseup
			mockMap.emit('mouseup');
			expect(mockState.log).toHaveBeenCalled();
		});
	});
});
