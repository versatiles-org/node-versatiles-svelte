import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from './manager.js';
import { GeometryManagerInteractive } from '../geometry_manager_interactive.js';
import type { StateRoot } from './types.js';
import { get } from 'svelte/store';
import { MockMap } from '../../../../__mocks__/map.js';

describe('StateManager', () => {
	let geometryManager: GeometryManagerInteractive;
	let stateManager: StateManager;
	const state1: StateRoot = {
		map: {
			center: [1, 2],
			radius: 16
		},
		elements: [{ type: 'marker', point: [3, 4], style: { label: 'test' } }]
	};
	const state2: StateRoot = {
		map: {
			center: [3, 4],
			radius: 1024
		},
		elements: [
			{
				type: 'line',
				points: [
					[3, 4],
					[5, 6]
				],
				style: { color: '#f00' }
			}
		]
	};

	function getStatus(): [boolean, boolean, number, number, number, number] {
		return [
			get(stateManager.history.undoEnabled),
			get(stateManager.history.redoEnabled),
			stateManager.history['history'].length,
			stateManager.history['index'],
			vi.mocked(geometryManager.getState).mock.calls.length,
			vi.mocked(geometryManager.setState).mock.calls.length
		];
	}

	beforeEach(() => {
		const map = new MockMap();

		geometryManager = new GeometryManagerInteractive(map as unknown as maplibregl.Map);
		vi.spyOn(geometryManager, 'getState');
		vi.spyOn(geometryManager, 'setState');

		stateManager = new StateManager(geometryManager as unknown as GeometryManagerInteractive);
	});

	describe('getHash/setHash', () => {
		it('should return a base64 compressed hash of the geometry manager state', () => {
			geometryManager.setState(state1);
			const hash = stateManager.getHash();
			expect(geometryManager.getState).toHaveBeenCalled();
			expect(hash).toBe('G2haCUQgg-pyAot4ZIECOEA');
		});

		it('should set the geometry manager state from a base64 compressed hash', () => {
			geometryManager.setState(state1);
			const hash = stateManager.getHash();

			stateManager.setHash(hash);
			expect(geometryManager.setState).toHaveBeenCalledWith(state1);
		});

		it('should not set the state if the hash is empty', () => {
			stateManager.setHash('');
			expect(geometryManager.setState).not.toHaveBeenCalled();
		});

		it('should handle errors gracefully', () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			stateManager.setHash('invalidHash');
			expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
			consoleErrorSpy.mockRestore();
		});
	});

	describe('undo/redo', () => {
		it('should undo and redo', () => {
			expect(getStatus()).toStrictEqual([false, false, 1, 0, 1, 0]);

			vi.mocked(geometryManager.getState).mockReturnValueOnce(state1);
			stateManager.log();
			expect(getStatus()).toStrictEqual([true, false, 2, 0, 2, 0]);

			vi.mocked(geometryManager.getState).mockReturnValueOnce(state2);
			stateManager.log();
			expect(getStatus()).toStrictEqual([true, false, 3, 0, 3, 0]);

			stateManager.undo();
			expect(geometryManager.setState).toHaveBeenCalledWith(state1);
			expect(getStatus()).toStrictEqual([true, true, 3, 1, 3, 1]);

			stateManager.redo();
			expect(geometryManager.setState).toHaveBeenCalledWith(state2);
			expect(getStatus()).toStrictEqual([true, false, 3, 0, 3, 2]);
		});

		it('should not undo if there is no previous state', () => {
			expect(getStatus()).toStrictEqual([false, false, 1, 0, 1, 0]);
			stateManager.undo();
			expect(getStatus()).toStrictEqual([false, false, 1, 0, 1, 1]);
		});

		it('should not redo if there is no next state', () => {
			expect(getStatus()).toStrictEqual([false, false, 1, 0, 1, 0]);
			stateManager.redo();
			expect(getStatus()).toStrictEqual([false, false, 1, 0, 1, 1]);
		});
	});

	describe('log', () => {
		it('should log the current state and update history', () => {
			geometryManager.setState(state1);

			stateManager.log();
			expect(geometryManager.getState).toHaveBeenCalled();
			expect(getStatus()).toStrictEqual([true, false, 2, 0, 2, 1]);
		});

		it('should trim history if it exceeds the maximum length', () => {
			geometryManager.setState(state1);

			for (let i = 0; i < 101; i++) {
				stateManager.log();
			}

			expect(stateManager.history['history'].length).toBeLessThanOrEqual(100);
			expect(getStatus()).toStrictEqual([true, false, 100, 0, 102, 1]);
		});
	});
});
