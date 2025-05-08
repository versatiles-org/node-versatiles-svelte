<script lang="ts">
	import type { CameraOptions, Map as MaplibreMapType } from 'maplibre-gl';
	import AutoComplete from './AutoComplete.svelte';
	import { getCountryName } from '$lib/utils/location.js';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import { isDarkMode } from '$lib/utils/map_style.js';
	import type { BBox } from 'geojson';
	import { loadBBoxes } from './BBoxMap.js';
	import { BBoxDrawer } from './lib/bbox.js';

	let { selectedBBox = $bindable() }: { selectedBBox?: BBox } = $props();
	const startTime = Date.now();
	let bboxDrawer: BBoxDrawer;
	let map: MaplibreMapType | undefined = $state();
	let bboxes: { key: string; value: BBox }[] | undefined = $state();
	let mapContainer: HTMLElement;

	async function onMapLoad(_map: MaplibreMapType) {
		map = _map;
		mapContainer = map.getContainer();
		map.setPadding({ top: 31 + 5, right: 5, bottom: 5, left: 5 });
		bboxDrawer = new BBoxDrawer(map!, [-180, -86, 180, 86], isDarkMode(mapContainer) ? '#FFFFFF' : '#000000');
		bboxes = await loadBBoxes();
		bboxDrawer.bbox.subscribe((bbox) => {
			selectedBBox = bbox;
		});
	}

	function flyToBBox(bbox: BBox) {
		if (!map || !bbox) return;

		bboxDrawer.setGeometry(bbox);

		const transform = map.cameraForBounds(bboxDrawer.getBounds()) as CameraOptions;
		if (transform == null) return;
		transform.zoom = transform.zoom ?? 0 - 0.5;
		transform.bearing = 0;
		transform.pitch = 0;

		if (Date.now() - startTime < 1000) {
			map.jumpTo(transform);
		} else {
			map.flyTo({ ...transform, essential: true, speed: 5 });
		}
	}
</script>

<div class="container">
	{#if bboxes}
		<div class="input">
			<AutoComplete
				items={bboxes}
				placeholder="Find country, region or city …"
				change={(bbox) => flyToBBox(bbox)}
				initialInputText={getCountryName() ?? ''}
			/>
		</div>
	{/if}
	<BasicMap {onMapLoad}></BasicMap>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
	.input {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
		right: 0.5em;
		z-index: 10;
	}
</style>
