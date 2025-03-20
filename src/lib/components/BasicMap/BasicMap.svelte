<script lang="ts">
	import 'maplibre-gl/dist/maplibre-gl.css';
	import { getMapStyle, isDarkMode } from '$lib/utils/map_style.js';
	import maplibre from 'maplibre-gl';
	import type { MapOptions } from 'maplibre-gl';

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
		map?: maplibre.Map;
		onMapInit?: (map: maplibre.Map) => void;
		onMapLoad?: (map: maplibre.Map) => void;
	} = $props();

	let container: HTMLDivElement;

	$effect(() => {
		if (container) init();
	});

	async function init(): Promise<void> {
		if (map) return;

		if (!container) throw Error();

		const darkMode = isDarkMode(container);
		container.style.setProperty('--bg-color', darkMode ? '#000' : '#fff');
		container.style.setProperty('--fg-color', darkMode ? '#fff' : '#000');

		const style = getMapStyle(darkMode, styleOptions);
		style.transition = { duration: 0, delay: 0 };
		map = new maplibre.Map({
			container,
			style,
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
	.map :global(canvas) {
		outline: none !important;
	}
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
