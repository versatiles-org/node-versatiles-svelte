/**
 * Callback type that accepts a payload only if the event actually carries data.
 * For data‑less events (`void` or `undefined`), the callback takes no argument.
 */
type EventCallback<T> = T extends void | undefined ? () => void : (data: T) => void;

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export class EventHandler<Events extends Record<string, unknown> = {}> {
	/** monotonically increasing id for every registered callback */
	private index = 0;

	/**
	 * Per‑event registry that keeps the correct data type for every callback
	 * (`drag` maps to `{x: number; y: number}`, `dragEnd` to the same, etc.).
	 */
	private events: {
		[K in keyof Events]?: Map<number, EventCallback<Events[K]>>;
	} = {};

	/** Emit an event (with data only if the event defines some) */
	emit<K extends keyof Events>(name: K, ...args: Events[K] extends void | undefined ? [] : [data: Events[K]]): void {
		const payload = (args as [Events[K]] | [undefined])[0] as Events[K];
		this.events[name]?.forEach((cb) => cb(payload));
	}

	/** Register a new listener; returns its numeric id so it can be removed later */
	on<K extends keyof Events>(name: K, callback: EventCallback<Events[K]>): number {
		if (!callback) throw new Error('Callback is required');
		const bucket = (this.events[name] ??= new Map());
		const id = ++this.index;
		bucket.set(id, callback);
		return id;
	}

	/** Register a listener that will fire exactly once */
	once<K extends keyof Events>(name: K, callback: EventCallback<Events[K]>): number {
		const id = this.on(name, ((data: Events[K]) => {
			this.off(name, id);
			callback(data);
		}) as EventCallback<Events[K]>);
		return id;
	}

	/** Remove a single listener by id, or all listeners for an event */
	off<K extends keyof Events>(name: K, id?: number): void {
		const bucket = this.events[name];
		if (!bucket) return;

		if (id !== undefined) {
			bucket.delete(id);
		} else {
			delete this.events[name];
		}
	}

	/** Clear the entire registry */
	clear(): void {
		for (const key in this.events) {
			delete this.events[key];
		}
	}
}
