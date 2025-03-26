import { GeometryManager } from '../geometry_manager.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';

export class State {
	private geometryManager: GeometryManager;
	private lastHash = '???';
	public pause = false;

	constructor(geometryManager: GeometryManager) {
		this.geometryManager = geometryManager;
	}

	public async save() {
		if (this.pause) return;

		const writer = new StateWriter();
		writer.writeObject(this.geometryManager.getState());
		const hash = await writer.getBase64compressed();
		if (hash === this.lastHash) return;
		this.lastHash = hash;
		location.hash = hash;
	}

	public async load(hash: string) {
		if (!hash) return;
		if (hash === this.lastHash) return;
		this.lastHash = hash;
		this.pause = true;
		try {
			const reader = await StateReader.fromBase64compressed(hash);
			const state = reader.readObject();
			if (!state) return;
			this.geometryManager.setState(state);
		} catch (error) {
			console.error(error);
		}
		this.pause = false;
	}
}
