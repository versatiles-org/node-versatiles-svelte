<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import { onMount } from 'svelte';
	import Sidebar from './components/Sidebar.svelte';
	import { getCountryBoundingBox } from '$lib/utils/location.js';
	import { GeometryManager } from './lib/geometry_manager.js';

	let showSidebar = $state(false);

	onMount(() => {
		const inIframe = window.self !== window.top;
		if (!inIframe) showSidebar = true;
	});

	let geometryManager: GeometryManager | undefined = $state();

	function onMapInit(map: MaplibreMapType, maplibre: typeof import('maplibre-gl')) {
		map.addControl(new maplibre.AttributionControl({ compact: true }), 'bottom-left');

		geometryManager = new GeometryManager(map);

		let hash = location.hash.slice(1);
		if (!hash) hash = window.frameElement?.getAttribute('data') ?? '';
		if (hash) {
			geometryManager.state.setHash(hash);
		} else {
			const bbox = getCountryBoundingBox();
			if (bbox) map.fitBounds(bbox, { padding: 20, animate: false });
		}

		addEventListener('hashchange', () => geometryManager!.state.setHash(location.hash.slice(1)));
	}
</script>

<div class="page">
	<div class="container">
		<BasicMap
			{onMapInit}
			emptyStyle={true}
			mapOptions={{ attributionControl: false }}
			styleOptions={{ darkMode: false }}
		></BasicMap>
	</div>
	{#if showSidebar && geometryManager}
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
	.page,
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
	.page {
		--color-blue: #368;
		--color-green: #484;
		--color-bg: #fff;
		--color-text: #000;
		--btn-gap: 5px;
		--gap: 10px;
		--border-radius: 3px;
	}
	:global(.maplibregl-ctrl-attrib) {
		display: flex;
		align-items: center;
	}
</style>
