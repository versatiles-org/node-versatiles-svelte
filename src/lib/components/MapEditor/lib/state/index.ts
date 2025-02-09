import type { StateObject } from './types.js';

export function defaultState(value: StateObject, def: StateObject): StateObject | undefined {
	const entries = Object.entries(value).filter(([k, v]) => {
		if (v === undefined) return false;
		if (v === def[k]) return false;
		return true;
	});
	if (entries.length === 0) return undefined;
	return Object.fromEntries(entries);
}
