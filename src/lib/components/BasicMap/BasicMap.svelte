<!-- BasicMap.svelte -->
<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getMapStyle, isDarkMode } from '$lib/utils/style.js';

	export let style: string = 'position:absolute;left:0px;top:0px;width:100%;height:100%;';
	export let mapContainer: HTMLDivElement | undefined = undefined;
	export let map: MaplibreMapType | undefined = undefined;
	export let renderWorldCopies: boolean = false;
	export let dragRotate: boolean = false;
	export let darkMode = false;
	
	$: {
		if (mapContainer) {
			mapContainer.style.setProperty('--bg-color', darkMode ? '#000' : '#fff');
			mapContainer.style.setProperty('--fg-color', darkMode ? '#fff' : '#000');
		}
	}

	onMount(() => init());

	async function init() {
		let MaplibreMap: typeof MaplibreMapType | undefined = undefined;
		await Promise.all([(async () => (MaplibreMap = (await import('maplibre-gl')).Map))()]);
		if (MaplibreMap == null) throw Error();
		initMap(MaplibreMap);
	}

	function initMap(MaplibreMap: typeof MaplibreMapType) {
		if (!mapContainer) throw Error();
		darkMode = isDarkMode(mapContainer);
		map = new MaplibreMap({
			container: mapContainer,
			style: getMapStyle(darkMode),
			renderWorldCopies,
			dragRotate,
			attributionControl: { compact: false }
		});
		return () => map?.remove();
	}
</script>

<div class="map" {style} bind:this={mapContainer}></div>

<style>
	.map :global(.maplibregl-ctrl-attrib) {
		background-color: color-mix(in srgb, var(--bg-color) 50%, transparent) !important;
		color: var(--fg-color) !important;
		opacity: 0.5;
		font-size: 0.85em;
		line-height: normal !important;
	}
	.map :global(.maplibregl-ctrl-attrib-inner) {
		padding: 0 0.2em !important;
	}
	.map :global(.maplibregl-ctrl-attrib a) {
		color: var(--fg-color) !important;
	}
</style>
