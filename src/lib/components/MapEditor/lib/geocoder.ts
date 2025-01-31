export async function getLatLng(query: string): Promise<[number, number] | undefined> {
	const url = `https://photon.komoot.io/api/?${new URLSearchParams(query)}`;
	const result = await fetch(url).then((r) => r.json());
	const geometry = result?.features?.[0]?.geometry;
	if (geometry?.type !== 'Point') return;
	return geometry.coordinates;
}
