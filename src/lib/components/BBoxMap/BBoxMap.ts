export async function loadBBoxes(): Promise<{ key: string; value: [number, number, number, number] }[]> {
	const data = await import('../../components/BBoxMap/bboxes.json');

	const bboxes = data.default.map((e) => {
		const key = e[0] as string;

		const value = e.slice(1, 5) as [number, number, number, number];
		value[2] = Math.round((value[2] + value[0]) * 1e5) / 1e5;
		value[3] = Math.round((value[3] + value[1]) * 1e5) / 1e5;

		return { key, value };
	});

	return bboxes;
}
