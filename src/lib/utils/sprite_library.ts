//const sprites = new Map<string, string>();
interface SpriteEntry {
	width: number;
	height: number;
	x: number;
	y: number;
	pixelRatio: number;
	sdf: boolean;
	id: string;
	name: string;
	group: string;
}

export class SpriteLibrary {
	private spriteList: SpriteEntry[] = [];
	private pixelRatio: number;

	constructor(pixelRatio: number = 2) {
		this.pixelRatio = pixelRatio;
	}

	async getSpriteList(): Promise<SpriteEntry[]> {
		await this.loadSpriteList();
		return this.spriteList;
	}

	private async loadSpriteList() {
		if (this.spriteList.length) return;

		const spriteGroupList = (await fetch(
			'https://tiles.versatiles.org/assets/sprites/index.json'
		).then((r) => r.json())) as string[];

		await Promise.all(
			spriteGroupList.map(async (group) => {
				const spriteGroup = (await fetch(
					`https://tiles.versatiles.org/assets/sprites/${group}/sprites@${this.pixelRatio}x.json`
				).then((r) => r.json())) as {
					[key: string]: {
						width: number;
						height: number;
						x: number;
						y: number;
						pixelRatio?: number;
						sdf?: boolean;
					};
				};
				Object.entries(spriteGroup).forEach(([name, entry]) => {
					this.spriteList.push({
						...entry,
						pixelRatio: entry.pixelRatio ?? 1,
						sdf: entry.sdf ?? false,
						id: `${group}/${name}`,
						group,
						name
					});
				});
			})
		);
	}
}

export default SpriteLibrary;
