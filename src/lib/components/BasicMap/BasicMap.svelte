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
		emptyStyle = false,
		onMapInit,
		onMapLoad
	}: {
		style?: string;
		styleOptions?: Parameters<typeof getMapStyle>[0];
		mapOptions?: Partial<MapOptions>;
		map?: maplibre.Map;
		emptyStyle?: boolean;
		onMapInit?: (map: maplibre.Map, maplibre: typeof import('maplibre-gl')) => void;
		onMapLoad?: (map: maplibre.Map, maplibre: typeof import('maplibre-gl')) => void;
	} = $props();

	let container: HTMLDivElement;
	let triggeredMapReady = false;

	$effect(() => {
		if (container) init();
	});

	async function init(): Promise<void> {
		if (map) return;

		if (styleOptions.darkMode == null) styleOptions.darkMode = isDarkMode(container);

		container.style.setProperty('--bg-color', styleOptions.darkMode ? '#000' : '#fff');
		container.style.setProperty('--fg-color', styleOptions.darkMode ? '#fff' : '#000');

		let style = undefined;

		if (!emptyStyle) {
			style = getMapStyle(styleOptions);
			style.transition = { duration: 0, delay: 0 };
		}

		map = new maplibre.Map({
			container,
			style,
			renderWorldCopies: false,
			dragRotate: false,
			attributionControl: { compact: false },
			fadeDuration: 0,
			...mapOptions
		});

		if (onMapInit) onMapInit(map, maplibre);

		map.on('idle', checkMapReady);

		function checkMapReady() {
			if (triggeredMapReady) return;
			if (!map!.loaded()) return;
			triggeredMapReady = true;
			if (onMapLoad) onMapLoad(map!, maplibre);
			setTimeout(() => console.log('map_ready'), 100);
		}
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
