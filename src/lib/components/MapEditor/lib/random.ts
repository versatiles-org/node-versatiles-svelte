import { Color } from '@versatiles/style';

export class Random {
	private seed: number;

	constructor(str: string) {
		this.seed = str
			.split('')
			.reduce((acc, char) => (acc * 0x101 + char.charCodeAt(0)) % 0x100000000, 0);
	}

	random(): number {
		for (let i = 0; i < 10; i++)
			this.seed = ((Math.cos(this.seed * 3.14 + 0.0159) + 1.1) * 9631) % 1;
		return this.seed;
	}

	randomColor(): string {
		const c = new Color.HSL(this.random() * 360, 80, 50).asHex();
		console.log(c);
		return c;
	}
}
