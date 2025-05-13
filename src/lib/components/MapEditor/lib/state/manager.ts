import type { GeometryManagerInteractive } from '../geometry_manager_interactive.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';
import type { StateMetadata } from './types.js';
import { StateHistory } from './history.js';

export class StateManager {
	public geometryManager: GeometryManagerInteractive;
	private disableLogging: boolean = false;
	public readonly history: StateHistory;

	constructor(geometryManager: GeometryManagerInteractive) {
		this.geometryManager = geometryManager;
		this.history = new StateHistory(geometryManager.getState());
	}

	public getHash(additionalMeta?: StateMetadata): string {
		const writer = new StateWriter();
		const state = this.geometryManager.getState();

		if (additionalMeta) {
			state.meta ??= {};
			const keys = Object.keys(additionalMeta) as (keyof StateMetadata)[];
			for (const key of keys) {
				if (additionalMeta[key] == null) continue;
				state.meta[key] = additionalMeta[key];
			}
		}

		writer.writeRoot(state);
		return writer.asBase64();
	}

	public setHash(hash: string) {
		if (!hash) return;
		try {
			const state = StateReader.fromBase64(hash).readRoot();

			this.disableLogging = true;
			this.geometryManager.setState(state);
			this.disableLogging = false;

			this.history.reset(state);
		} catch (error) {
			console.error(error);
		}
	}

	public log() {
		if (this.disableLogging) return;
		this.history.push(this.geometryManager.getState());
	}

	public undo() {
		this.geometryManager.setState(this.history.undo());
	}

	public redo() {
		this.geometryManager.setState(this.history.redo());
	}
}
