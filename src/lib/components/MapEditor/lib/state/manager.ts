import { writable } from 'svelte/store';
import type { GeometryManager } from '../geometry_manager.js';
import { StateReader } from './reader.js';
import { StateWriter } from './writer.js';
import type { StateRoot } from './types.js';

const MAXLENGTH = 100;

export class StateManager {
	geometryManager: GeometryManager;
	constructor(geometryManager: GeometryManager) {
		this.geometryManager = geometryManager;
		this.resetHistory();
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
			this.resetHistory();
		} catch (error) {
			console.error(error);
		}
	}

	// History of state hashes
	// The first element is the most recent state
	private history: StateRoot[] = [];
	// The index of the current state in the history
	// 0 means the most recent state
	// 1 means the second most recent state
	private historyIndex: number = 0;

	public undoEnabled = writable(false);
	public redoEnabled = writable(false);

	private resetHistory() {
		this.history = [this.geometryManager.getState()];
		this.historyIndex = 0;
		this.updateButtons();
	}

	public log() {
		const state = this.geometryManager.getState();
		state.map = undefined; // Remove map state from history
		if (this.historyIndex > 0) {
			this.history.splice(0, this.historyIndex);
			this.historyIndex = 0;
		}
		this.history.unshift(state);

		// Remove old history
		if (this.history.length > MAXLENGTH) {
			this.history.length = MAXLENGTH;
		}
		this.updateButtons();
	}

	public undo() {
		if (this.historyIndex < this.history.length - 1) {
			this.historyIndex++;
			const state = this.history[this.historyIndex];
			this.geometryManager.setState(state);
			this.updateButtons();
		}
	}

	public redo() {
		if (this.historyIndex > 0) {
			this.historyIndex--;
			const state = this.history[this.historyIndex];
			this.geometryManager.setState(state);
			this.updateButtons();
		}
	}

	private updateButtons() {
		this.undoEnabled.set(this.historyIndex < this.history.length - 1);
		this.redoEnabled.set(this.historyIndex > 0);
	}
}
