<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import Sidebar from './components/Sidebar.svelte';
	import { getCountryBoundingBox } from '$lib/utils/location.js';
	import { GeometryManager } from './lib/geometry_manager.js';
	import { GeometryManagerInteractive } from './lib/geometry_manager_interactive.js';
	import { StateReader } from './lib/state/reader.js';

	let {
		onMapLoad
	}: {
		onMapLoad?: (map: MaplibreMapType, maplibre: typeof import('maplibre-gl')) => void;
	} = $props();

	let showSidebar = $state(false);
	let geometryManager: GeometryManager | GeometryManagerInteractive | undefined = $state();

	function onMapInit(map: MaplibreMapType, maplibre: typeof import('maplibre-gl')) {
		showSidebar = window.self === window.top;

		const padding = 10;
		map.setPadding({
			top: padding,
			right: padding + (showSidebar ? 250 : 0),
			bottom: padding,
			left: padding
		});

		map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-left');

		if (showSidebar) {
			geometryManager = new GeometryManagerInteractive(map);
		} else {
			geometryManager = new GeometryManager(map);
		}

		let hash = location.hash.slice(1);
		if (!hash) hash = window.frameElement?.getAttribute('data') ?? '';
		if (hash) {
			readHash(hash);
		} else {
			const bbox = getCountryBoundingBox();
			if (bbox) map.fitBounds(bbox, { animate: false });
		}

		addEventListener('hashchange', () => readHash(location.hash.slice(1)));

		function readHash(hash: string) {
			if (!geometryManager) return;
			const stateReader = StateReader.fromBase64(hash);
			geometryManager.loadState(stateReader.readRoot());
		}
	}
</script>

<div class="page">
	<div class="container">
		<BasicMap
			{onMapInit}
			{onMapLoad}
			emptyStyle={true}
			mapOptions={{ attributionControl: false }}
			styleOptions={{ darkMode: false }}
		></BasicMap>
	</div>
	{#if showSidebar && geometryManager && geometryManager.isInteractive()}
		<Sidebar {geometryManager} />

		<style>
			.page .container {
				width: 100%;
				position: absolute;
				top: 0;
				left: 0;
			}
		</style>
	{/if}
</div>

<style>
	.page {
		--color-blue: #158;
		--color-green: #1a1;
		--color-bg: #fff;
		--color-text: #000;
		--btn-gap: 5px;
		--gap: 10px;
		--border-radius: 1em;
	}

	.page,
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}

	:global(.maplibregl-ctrl-attrib) {
		display: flex;
		align-items: center;
	}
</style>
