<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	//import SpriteLibrary from '$lib/utils/sprite_library.js';
	import { MarkerDrawer } from '$lib/utils/draw/marker.js';
	import { browser } from '$app/environment';
	import Editor from './Editor.svelte';

	const inIframe = browser && window.self !== window.top;
	let showSidebar = !browser || !inIframe;

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: MaplibreMapType | undefined = $state();
	//let spriteLibrary = new SpriteLibrary();
	let selectedElement: null | MarkerDrawer = $state(null);

	function handleMapReady(event: CustomEvent) {
		map = event.detail.map as MaplibreMapType;
		map.on('load', async () => {
			//const list = await spriteLibrary.getSpriteList();
			//markers.push(new MarkerDrawer(map, { point: [25, 22] }));
		});
	}

	function clickNewMarker() {
		if (!map) return;
		selectedElement = new MarkerDrawer(map);
	}
</script>

<div class="page">
	<div class="container">
		<BasicMap
			{map}
			bind:container={mapContainer}
			on:mapReady={handleMapReady}
			styleOptions={{ transitionDuration: 0 }}
		></BasicMap>
	</div>
	{#if showSidebar}
		<div class="sidebar" style="--gap: 10px;">
			<div class="row">
				<input type="button" value="new marker" onclick={clickNewMarker} />
			</div>
			<hr />
			<div class="row">
				<select></select>
			</div>
			<div class="editor">
				<Editor bind:element={selectedElement} />
			</div>
		</div>
		<style lang="scss">
			.page {
				.sidebar {
					width: 300px;
					height: 100%;
					position: absolute;
					top: 0;
					right: 0;
					min-height: 6em;
					background-color: #eee;
					overflow-y: scroll;
					box-sizing: border-box;
					padding: var(--gap);
				}
				.row {
					display: flex;
					gap: var(--gap);
					margin-bottom: var(--gap);
				}
				select {
					flex-grow: 1;
				}
				input[type='button'] {
					flex-grow: 0;
				}
				.container {
					width: calc(100% - 300px);
					height: 100%;
					position: absolute;
					top: 0;
					left: 0;
				}
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
