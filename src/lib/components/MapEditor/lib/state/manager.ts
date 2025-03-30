import type { GeometryManager } from '../geometry_manager.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';

export class StateManager {
	geometryManager: GeometryManager;
	constructor(geometryManager: GeometryManager) {
		this.geometryManager = geometryManager;
	}

	public getHash(): string {
		const writer = new StateWriter();
		writer.writeRoot(this.geometryManager.getState());
		return writer.asBase64();
	}

	public setHash(hash: string) {
		if (!hash) return;
		try {
			const state = StateReader.fromBase64(hash).readRoot();
			this.geometryManager.setState(state);
		} catch (error) {
			console.error(error);
		}
	}
}
