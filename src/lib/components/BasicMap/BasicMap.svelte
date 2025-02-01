<!-- BasicMap.svelte -->
<script lang="ts">
	import type { Map as MaplibreMapType, MapOptions } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getMapStyle, isDarkMode } from '$lib/utils/map_style.js';

	// Props
	let {
		style = 'position:absolute; left:0px; top:0px; width:100%; height:100%;',
		styleOptions = { transitionDuration: 0 },
		mapOptions = {},
		map = $bindable(),
		onMapInit,
		onMapLoad
	}: {
		style?: string;
		styleOptions?: Parameters<typeof getMapStyle>[1];
		mapOptions?: Partial<MapOptions>;
		map?: MaplibreMapType;
		onMapInit?: (map: MaplibreMapType) => void;
		onMapLoad?: (map: MaplibreMapType) => void;
	} = $props();

	let container: HTMLDivElement;

	$effect(() => {
		if (container) init();
	});

	async function init(): Promise<void> {
		if (map) return;

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
			fadeDuration: 0,
			...mapOptions
		});

		if (onMapInit) onMapInit(map);

		map.on('load', () => {
			if (onMapLoad) onMapLoad(map!);
		});
	}
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
