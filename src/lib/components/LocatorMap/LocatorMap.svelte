<!-- LocatorMap.svelte -->
<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	import SpriteLibrary from '$lib/utils/sprite_library.js';
	import { MarkerDrawer } from '$lib/utils/draw/marker.js';

	let mapContainer: HTMLDivElement;
	let map: MaplibreMapType;
	let spriteLibrary = new SpriteLibrary();
	let markers = [];

	function handleMapReady(event: CustomEvent) {
		map = event.detail.map;
		map.on('load', async () => {
			const list = await spriteLibrary.getSpriteList();
			markers.push(new MarkerDrawer(map, { point: [25, 22] }));
		});
	}
</script>

<div class="container">
	<BasicMap {map} bind:container={mapContainer} on:mapReady={handleMapReady}></BasicMap>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
</style>
