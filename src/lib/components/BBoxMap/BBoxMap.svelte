<script lang="ts">
	import type { CameraOptions, Map as MaplibreMapType } from 'maplibre-gl';
	import AutoComplete from './AutoComplete.svelte';
	import { getCountryName } from '$lib/utils/location.js';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import { isDarkMode } from '$lib/utils/map_style.js';
	import { loadBBoxes } from './BBoxMap.js';
	import { BBoxDrawer, isSameBBox, type BBox } from './lib/bbox.js';

	let { selectedBBox = $bindable() }: { selectedBBox?: BBox } = $props();
	const startTime = Date.now();
	let bboxDrawer: BBoxDrawer | undefined;
	let map: MaplibreMapType | undefined = $state();
	let bboxes: { key: string; value: BBox }[] | undefined = $state();
	let mapContainer: HTMLElement;

	$effect(() => setBBox(selectedBBox));

	async function onMapInit(_map: MaplibreMapType) {
		map = _map;
		mapContainer = map.getContainer();
		map.setPadding({ top: 42, right: 10, bottom: 15, left: 10 });
		bboxes = await loadBBoxes();
		const bbox = selectedBBox || [-180, -85, 180, 85];
		bboxDrawer = new BBoxDrawer(map!, bbox, isDarkMode(mapContainer) ? '#FFFFFF' : '#000000');
		bboxDrawer.bbox.subscribe(setBBox);
		if (selectedBBox) setBBox(selectedBBox);
	}

	function setBBox(bbox?: BBox) {
		if (!map || !bbox) return;

		if (!selectedBBox || !isSameBBox(selectedBBox, bbox)) {
			selectedBBox = bbox;
		}

		if (!bboxDrawer) return;

		if (!isSameBBox(bboxDrawer.getBBox(), bbox)) {
			bboxDrawer.setBBox(bbox);
		}

		const transform = map.cameraForBounds(bboxDrawer.getBounds()) as CameraOptions;
		if (transform == null) return;
		transform.zoom = transform.zoom ?? 0 - 0.5;
		transform.bearing = 0;
		transform.pitch = 0;

		if (Date.now() - startTime < 3000) {
			map.jumpTo(transform);
		} else {
			map.flyTo({ ...transform, essential: true, speed: 5 });
		}
	}

	function getInitialInputText() {
		// When an initial bbox is supplied, we skip the country pre‑fill
		if (selectedBBox) {
			const area = (selectedBBox[2] - selectedBBox[0]) * (selectedBBox[3] - selectedBBox[1]);
			if (area < 60000) return '';
		}
		let query = getCountryName() ?? '';
		switch (query) {
			case 'France':
				query = 'France, métropolitaine';
				break;
		}
		return query;
	}
</script>

<div class="container">
	{#if bboxes}
		<div class="input">
			<AutoComplete
				items={bboxes}
				placeholder="Find country, region or city …"
				change={(bbox) => (selectedBBox = bbox)}
				initialInputText={getInitialInputText()}
			/>
		</div>
	{/if}
	<BasicMap {onMapInit}></BasicMap>
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
