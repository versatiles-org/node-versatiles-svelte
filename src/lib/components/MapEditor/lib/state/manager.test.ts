import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from './manager.js';
import type { GeometryManager } from '../geometry_manager.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';
import type { StateRoot } from './types.js';

describe('StateManager', () => {
	let geometryManager: MockGeometryManager;
	let stateManager: StateManager;
	const mockState: StateRoot = {
		map: {
			center: [1, 2],
			zoom: 10
		},
		elements: [{ type: 'marker', point: [3, 4], style: { label: 'test' } }]
	};

	beforeEach(() => {
		geometryManager = new MockGeometryManager();
		stateManager = new StateManager(geometryManager as unknown as GeometryManager);
	});

	describe('getHash/setHash', () => {
		it('should return a base64 compressed hash of the geometry manager state', () => {
			geometryManager.getState.mockReturnValue(mockState);
			const hash = stateManager.getHash();
			expect(geometryManager.getState).toHaveBeenCalled();
			expect(hash).toBe('FQACAABAACAwAABAAAyQIEcIA');
		});

		it('should set the geometry manager state from a base64 compressed hash', () => {
			geometryManager.getState.mockReturnValue(mockState);
			const hash = stateManager.getHash();

			stateManager.setHash(hash);
			expect(geometryManager.setState).toHaveBeenCalledWith(mockState);
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
});
