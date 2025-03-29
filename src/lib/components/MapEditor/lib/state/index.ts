import type { GeometryManager } from '../geometry_manager.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';

export class StateManager {
	geometryManager: GeometryManager;
	constructor(geometryManager: GeometryManager) {
		this.geometryManager = geometryManager;
	}

	public async getHash(): Promise<string> {
		const writer = new StateWriter();
		writer.writeObject(this.geometryManager.getState());
		return await writer.getBase64compressed();
	}

	public async setHash(hash: string) {
		if (!hash) return;
		try {
			const state = (await StateReader.fromBase64compressed(hash)).readObject();
			this.geometryManager.setState(state);
		} catch (error) {
			console.error(error);
		}
	}
}
