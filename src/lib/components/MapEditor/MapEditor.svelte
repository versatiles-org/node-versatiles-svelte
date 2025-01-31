<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	import Editor from './Editor.svelte';
	import { GeometryManager } from './lib/geometry_manager.js';
	import type { AbstractElement } from './lib/element_abstract.js';
	import { onMount } from 'svelte';

	let showSidebar = $state(false);

	onMount(() => {
		const inIframe = window.self !== window.top;
		if (!inIframe) showSidebar = true;
	});

	let mapContainer: HTMLDivElement | undefined = $state();
	let map: MaplibreMapType | undefined = $state();
	let geometryManager: GeometryManager | undefined = $state();
	let elements = $state([]) as AbstractElement[];

	let activeElement: AbstractElement | undefined = $state(undefined);

	function handleMapReady(event: CustomEvent) {
		map = event.detail.map as MaplibreMapType;
		map.on('load', async () => {
			geometryManager = new GeometryManager(map!);
			geometryManager.elements.subscribe((value) => (elements = value));
			geometryManager.activeElement.subscribe((value) => (activeElement = value));
		});
	}

	function clickNewMarker() {
		activeElement = geometryManager?.getNewMarker();
	}

	$effect(() => geometryManager?.setActiveElement(activeElement));
</script>

<div class="page">
	<div class="container">
		<BasicMap
			{map}
			bind:container={mapContainer}
			on:mapReady={handleMapReady}
			styleOptions={{ disableDarkMode: true }}
		></BasicMap>
	</div>
	{#if showSidebar && geometryManager}
		<div class="sidebar" style="--gap: 10px;">
			<div class="row">
				<input type="button" value="new marker" onclick={clickNewMarker} />
			</div>
			<hr />
			<div class="row">
				<select
					size="5"
					bind:value={
						() => elements.indexOf(activeElement!), (index) => (activeElement = elements[index])
					}
				>
					{#each elements as element, index}
						<option value={index}>{element.name}</option>
					{/each}
				</select>
			</div>
			{#if activeElement != null}
				<hr />
				<div class="editor">
					<Editor element={activeElement} />
				</div>
			{/if}
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
					margin-bottom: var(--gap);
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
