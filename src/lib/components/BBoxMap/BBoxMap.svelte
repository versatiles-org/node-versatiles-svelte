<!-- BBoxMap.svelte -->
<script lang="ts">
	import type { CameraOptions, Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import AutoComplete from '$lib/components/BBoxMap/AutoComplete.svelte';
	import { getCountryName } from '$lib/utils/location.js';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	import { isDarkMode } from '$lib/utils/map_style.js';
	import type { BBox } from 'geojson';
	import { loadBBoxes } from './BBoxMap.js';
	import { BBoxDrawer } from '$lib/utils/draw/bbox.js';

	let { selectedBBox = $bindable() } = $props();
	const startTime = Date.now();
	let bbox: BBoxDrawer;
	let map: MaplibreMapType | undefined = $state();
	let bboxes: { key: string; value: BBox }[] | undefined = $state();
	let mapContainer: HTMLElement;

	function onMapInit(_map: MaplibreMapType) {
		map = _map;
		mapContainer = map.getContainer();

		map.setPadding({ top: 31 + 5, right: 5, bottom: 5, left: 5 });

		map.on('load', async () => {
			bbox = new BBoxDrawer(
				map!,
				[-180, -86, 180, 86],
				isDarkMode(mapContainer) ? '#FFFFFF' : '#000000'
			);
			bboxes = await loadBBoxes();
		});
	}

	function setBBox(newBBox: BBox) {
		selectedBBox = newBBox;
		if (bbox && map) {
			bbox.setGeometry(newBBox);

			const transform = map.cameraForBounds(bbox.getBounds()) as CameraOptions;
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
	}
</script>

<div class="container">
	{#if bboxes}
		<div class="input">
			<AutoComplete
				items={bboxes}
				placeholder="Find country, region or city …"
				change={setBBox}
				initialInputText={getCountryName() ?? ''}
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
