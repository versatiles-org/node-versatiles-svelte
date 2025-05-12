import { writable } from 'svelte/store';
import type { StateRoot } from './types.js';

const MAXLENGTH = 100;

export class StateHistory {
	// History of state hashes
	// The first element is the most recent state
	private history: string[] = [];

	// The index of the current state in the history
	// 0 means the most recent state
	// 1 means the second most recent state
	private index: number = 0;

	public undoEnabled = writable(false);
	public redoEnabled = writable(false);

	constructor(state: StateRoot) {
		this.reset(state);
	}

	public reset(state: StateRoot) {
		this.history = [];
		this.index = 0;
		this.push(state);
	}

	public push(state: StateRoot) {
		state.map = undefined; // Remove map state from history
		if (this.index > 0) {
			this.history.splice(0, this.index);
			this.index = 0;
		}
		this.history.unshift(JSON.stringify(state));

		// Remove old history
		if (this.history.length > MAXLENGTH) {
			this.history.length = MAXLENGTH;
		}
		this.updateButtons();
	}

	private get(): StateRoot {
		return JSON.parse(this.history[this.index]);
	}

	public undo(): StateRoot {
		if (this.index < this.history.length - 1) this.index++;
		this.updateButtons();
		return this.get();
	}

	public redo(): StateRoot {
		if (this.index > 0) this.index--;
		this.updateButtons();
		return this.get();
	}

	private updateButtons() {
		this.undoEnabled.set(this.index < this.history.length - 1);
		this.redoEnabled.set(this.index > 0);
	}
}
