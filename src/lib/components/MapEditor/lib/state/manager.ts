import { writable } from 'svelte/store';
import type { GeometryManager } from '../geometry_manager.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';
import type { StateMetadata, StateRoot } from './types.js';

const MAXLENGTH = 100;

export class StateManager {
	public geometryManager: GeometryManager;
	private disableLogging: boolean = false;

	constructor(geometryManager: GeometryManager) {
		this.geometryManager = geometryManager;
		this.resetHistory(geometryManager.getState());
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

			this.resetHistory(state);
		} catch (error) {
			console.error(error);
		}
	}

	// History of state hashes
	// The first element is the most recent state
	private history: string[] = [];
	// The index of the current state in the history
	// 0 means the most recent state
	// 1 means the second most recent state
	private historyIndex: number = 0;

	public undoEnabled = writable(false);
	public redoEnabled = writable(false);

	private resetHistory(state: StateRoot) {
		this.history = [];
		this.historyIndex = 0;
		this.pushHistory(state);
	}

	private pushHistory(state: StateRoot) {
		state.map = undefined; // Remove map state from history
		if (this.historyIndex > 0) {
			this.history.splice(0, this.historyIndex);
			this.historyIndex = 0;
		}
		this.history.unshift(JSON.stringify(state));

		// Remove old history
		if (this.history.length > MAXLENGTH) {
			this.history.length = MAXLENGTH;
		}
		this.updateButtons();
	}

	private popHistory() {
		this.disableLogging = true;
		const state = this.history[this.historyIndex];
		this.geometryManager.setState(JSON.parse(state));
		this.disableLogging = false;
		this.updateButtons();
	}

	public log() {
		if (this.disableLogging) return;
		this.pushHistory(this.geometryManager.getState());
	}

	public undo() {
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			this.popHistory();
		}
	}

	public redo() {
		if (this.historyIndex > 0) {
			this.historyIndex--;
			this.popHistory();
		}
	}

	private updateButtons() {
		this.undoEnabled.set(this.historyIndex < this.history.length - 1);
		this.redoEnabled.set(this.historyIndex > 0);
	}
}
