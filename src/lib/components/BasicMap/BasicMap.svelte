<!-- BasicMap.svelte -->
<script lang="ts">
	import type { Map as MaplibreMapType, MapOptions } from 'maplibre-gl';
	import { onMount, createEventDispatcher } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getMapStyle, isDarkMode } from '$lib/utils/map_style.js';
	import type { StyleBuilderOptions } from '@versatiles/style';

	// Props
	export let style: string = 'position:absolute; left:0px; top:0px; width:100%; height:100%;';
	export let container: HTMLDivElement | undefined = undefined;
	export let map: MaplibreMapType | undefined = undefined;
	export let styleOptions: Parameters<typeof getMapStyle>[1] = {};
	export let mapOptions: Partial<MapOptions> = {};

	// Create the event dispatcher
	const dispatch = createEventDispatcher();

	onMount(async (): Promise<void> => {
		let MaplibreMap: typeof MaplibreMapType = (await import('maplibre-gl')).Map;

		if (!container) throw Error();

		const darkMode = isDarkMode(container);
		container.style.setProperty('--bg-color', darkMode ? '#000' : '#fff');
		container.style.setProperty('--fg-color', darkMode ? '#fff' : '#000');

		map = new MaplibreMap({
			container,
			style: getMapStyle(darkMode, styleOptions),
			renderWorldCopies: false,
			dragRotate: false,
			attributionControl: { compact: false },
			...mapOptions
		});

		dispatch('mapReady', { map });
	});
</script>

<div class="map" {style} bind:this={container}></div>

<style>
	.map :global(.maplibregl-ctrl-attrib) {
		background-color: color-mix(in srgb, var(--bg-color) 50%, transparent) !important;
		color: var(--fg-color) !important;
		opacity: 0.5;
		font-size: 0.85em;
		line-height: normal !important;
	}
	.map :global(.maplibregl-ctrl-attrib a) {
		color: var(--fg-color) !important;
	}
</style>
