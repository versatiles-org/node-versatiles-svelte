export class Cursor {
	private readonly element: HTMLElement;

	#precise = new Set<string>(); // Priority: high
	#grab = new Set<string>(); // Priority: medium
	#hover = new Set<string>(); // Priority: low

	constructor(element: HTMLElement) {
		this.element = element;
		this.update();
	}

	private update() {
		if (this.#precise.size > 0) return (this.element.style.cursor = 'crosshair');
		if (this.#grab.size > 0) return (this.element.style.cursor = 'grab');
		if (this.#hover.size > 0) return (this.element.style.cursor = 'pointer');
		this.element.style.cursor = 'default';
	}

	public toggleHover(id: string, add: boolean = true) {
		if (add) this.#hover.add(id);
		else this.#hover.delete(id);
		this.update();
	}

	public togglePrecise(id: string, add: boolean = true) {
		if (add) this.#precise.add(id);
		else this.#precise.delete(id);
		this.update();
	}

	public toggleGrab(id: string, add: boolean = true) {
		if (add) this.#grab.add(id);
		else this.#grab.delete(id);
		this.update();
	}

	public isPrecise() {
		return this.#precise.size > 0;
	}
}
