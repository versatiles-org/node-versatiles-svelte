export class Cursor {
	private readonly element: HTMLElement;

	#hover = 0;
	#precise = 0;
	#grab = 0;

	constructor(element: HTMLElement) {
		this.element = element;
		this.update();
	}

	private update() {
		if (this.#precise > 0) return (this.element.style.cursor = 'crosshair');
		if (this.#grab > 0) return (this.element.style.cursor = 'grab');
		if (this.#hover > 0) return (this.element.style.cursor = 'pointer');
		this.element.style.cursor = 'default';
	}

	public hover(increase: boolean) {
		this.#hover = Math.max(0, this.#hover + (increase ? 1 : -1));
		this.update();
	}

	public precise(increase: boolean) {
		this.#precise = Math.max(0, this.#precise + (increase ? 1 : -1));
		this.update();
	}

	public grab(increase: boolean) {
		this.#grab = Math.max(0, this.#grab + (increase ? 1 : -1));
		this.update();
	}
}
