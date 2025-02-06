<script lang="ts">
	import type { Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	import Editor from './Editor.svelte';
	import { GeometryManager } from './lib/geometry_manager.js';
	import type { AbstractElement } from './lib/element/abstract.js';
	import { onMount } from 'svelte';

	let showSidebar = $state(false);

	onMount(() => {
		const inIframe = window.self !== window.top;
		if (!inIframe) showSidebar = true;
	});

	let map: MaplibreMapType | undefined = $state();
	let geometryManager: GeometryManager | undefined = $state();
	let elements = $state([]) as AbstractElement[];

	let activeElement: AbstractElement | undefined = $state(undefined);

	function onMapInit(_map: MaplibreMapType) {
		map = _map;
		map.on('load', async () => {
			geometryManager = new GeometryManager(map!);
			geometryManager.elements.subscribe((value) => (elements = value));
			geometryManager.activeElement.subscribe((value) => (activeElement = value));
		});
	}

	$effect(() => geometryManager?.setActiveElement(activeElement));
</script>

<div class="page">
	<div class="container">
		<BasicMap {onMapInit} styleOptions={{ disableDarkMode: true }}></BasicMap>
	</div>
	{#if showSidebar && geometryManager}
		<div class="sidebar" style="--gap: 10px;">
			<div style="min-height: calc(100vh - 1.5em);">
				<div class="label">Add new:</div>
				<div class="row flex">
					<input
						type="button"
						value="Marker"
						onclick={() => (activeElement = geometryManager?.getNewMarker())}
					/>
					<input
						type="button"
						value="Line"
						onclick={() => (activeElement = geometryManager?.getNewLine())}
					/>
					<input
						type="button"
						value="Polygon"
						onclick={() => (activeElement = geometryManager?.getNewPolygon())}
					/>
				</div>
				<hr />
				<div class="row">
					<select
						size="5"
						style="width: 100%;"
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
					<Editor element={activeElement} />
				{/if}
			</div>
			<div class="footer">
				<a href="https://github.com/versatiles-org/node-versatiles-svelte" target="_blank"
					>Improve on GitHub</a
				>
			</div>
		</div>
		<style lang="scss">
			.page {
				.sidebar {
					width: 200px;
					height: 100%;
					position: absolute;
					top: 0;
					right: 0;
					background-color: #eee;
					overflow-y: scroll;
					box-sizing: border-box;
					padding: 0 var(--gap);
					border-left: 0.5px solid rgba(0, 0, 0, 0.5);

					.row {
						margin-bottom: var(--gap);
					}

					.flex {
						display: flex;
						justify-content: space-between;
						input {
							flex-grow: 0;
						}
					}

					.footer {
						text-align: right;
						font-size: 0.8em;
						a {
							color: #000;
							text-decoration: none;
							opacity: 0.3;
							&:hover {
								opacity: 1;
							}
						}
					}
				}
				.container {
					width: calc(100% - 200px);
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
