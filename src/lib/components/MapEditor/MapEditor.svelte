<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import { onMount } from 'svelte';
	import Sidebar from './components/Sidebar.svelte';
	import type { GeometryManager } from './lib/geometry_manager.js';

	let showSidebar = $state(false);

	onMount(() => {
		const inIframe = window.self !== window.top;
		if (!inIframe) showSidebar = true;
	});

	let map: MaplibreMapType | undefined = $state();
	let geometryManager: GeometryManager | undefined = $state();

	function onMapInit(_map: MaplibreMapType) {
		map = _map;
		map.on('load', async () => {
			const { GeometryManager } = await import('./lib/geometry_manager.js');
			geometryManager = new GeometryManager(map!);
		});
	}
</script>

<div class="page">
	<div class="container">
		<BasicMap {onMapInit} styleOptions={{ disableDarkMode: true }}></BasicMap>
	</div>
	{#if showSidebar && geometryManager}
		<Sidebar {geometryManager} width={200} />

		<style>
			.page .container {
				width: calc(100% - 200px);
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
</style>
