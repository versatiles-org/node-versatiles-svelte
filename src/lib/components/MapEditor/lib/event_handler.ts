type Callback = () => void;

export class EventHandler {
	private index = 0;
	private events = new Map<string, Map<number, Callback>>();

	constructor() {}

	emit(event: string) {
		this.events.get(event)?.forEach((callback) => callback());
	}

	on(name: string, callback: () => void): number {
		if (!callback) throw new Error('Callback is required');
		if (!this.events.has(name)) this.events.set(name, new Map());
		this.index++;
		this.events.get(name)!.set(this.index, callback);
		return this.index;
	}

	once(name: string, callback: () => void): number {
		if (!callback) throw new Error('Callback is required');
		const index = this.on(name, () => {
			this.off(name, index);
			callback();
		});
		return index;
	}

	off(name: string, index?: number) {
		if (!this.events.has(name)) return;
		if (index) {
			this.events.get(name)?.delete(index);
		} else {
			this.events.delete(name);
		}
	}

	clear() {
		this.events.clear();
	}
}
