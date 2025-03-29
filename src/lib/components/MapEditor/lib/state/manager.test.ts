import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StateManager } from './manager.js';
import type { GeometryManager } from '../geometry_manager.js';
import { MockGeometryManager } from '../__mocks__/geometry_manager.js';

describe('StateManager', () => {
	let geometryManager: MockGeometryManager;
	let stateManager: StateManager;

	beforeEach(() => {
		geometryManager = new MockGeometryManager();
		stateManager = new StateManager(geometryManager as unknown as GeometryManager);
	});

	describe('getHash', () => {
		it('should return a base64 compressed hash of the geometry manager state', async () => {
			geometryManager.getState.mockReturnValue({ label: 'test' });
			const result = await stateManager.getHash();
			expect(geometryManager.getState).toHaveBeenCalled();
			expect(result).toBe('s2EpSS0uYQAA');
		});
	});

	describe('setHash', () => {
		it('should set the geometry manager state from a base64 compressed hash', async () => {
			await stateManager.setHash('s2EpSS0uYQAA');
			expect(geometryManager.setState).toHaveBeenCalledWith({ label: 'test' });
		});

		it('should not set the state if the hash is empty', async () => {
			await stateManager.setHash('');
			expect(geometryManager.setState).not.toHaveBeenCalled();
		});

		it('should handle errors gracefully', async () => {
			const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
			await stateManager.setHash('invalidHash');
			expect(consoleErrorSpy).toHaveBeenCalledWith(expect.any(Error));
			consoleErrorSpy.mockRestore();
		});
	});
});
