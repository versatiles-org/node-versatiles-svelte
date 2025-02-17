<script lang="ts">
	import type { AbstractElement } from '../lib/element/abstract.js';
	import Editor from './Editor.svelte';
	import type { GeometryManager } from '../lib/geometry_manager.js';

	const { geometryManager, width }: { geometryManager: GeometryManager; width: number } = $props();

	let activeElement: AbstractElement | undefined = $state(undefined);
	$effect(() => geometryManager.selectElement(activeElement));

	geometryManager.selectedElement.subscribe((value) => (activeElement = value));

	function importGeoJSON() {
		const input = document.createElement('input');
		input.type = 'file';
		input.onchange = (_) => {
			if (!input.files) return alert('No file selected.');
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (evt) => {
				try {
					if (!evt.target) return alert('Failed to read file.');
					const json = JSON.parse(evt.target.result as string);
					geometryManager.addGeoJSON(json);
				} catch (error) {
					console.error(error);
					return alert('Failed to import GeoJSON. Please check the file format.');
				}
			};

			reader.onerror = () => alert('Failed to read file. Please try again.');

			reader.readAsText(file);
		};
		input.click();
	}

	function exportGeoJSON() {
		const geoJSON = geometryManager.getGeoJSON();
		const blob = new Blob([JSON.stringify(geoJSON)], { type: 'application/geo+json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('href', url);
		a.setAttribute('download', 'map.geojson');
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<div class="sidebar" style="--gap: 10px;width: {width}px;">
	<div style="min-height: calc(100vh - 2em);">
		<div class="label">GeoJSON:</div>
		<div class="row-flex">
			<input type="button" value="Import" onclick={importGeoJSON} />
			<input type="button" value="Export" onclick={exportGeoJSON} />
		</div>
		<hr />
		<div class="label">Add new:</div>
		<div class="row-flex">
			<input
				type="button"
				value="Marker"
				onclick={() => (activeElement = geometryManager.addNewMarker())}
			/>
			<input
				type="button"
				value="Line"
				onclick={() => (activeElement = geometryManager.addNewLine())}
			/>
			<input
				type="button"
				value="Polygon"
				onclick={() => (activeElement = geometryManager.addNewPolygon())}
			/>
		</div>
		{#if activeElement != null}
			<hr />
			<Editor element={activeElement} />
		{/if}
	</div>
	<div class="footer">
		<a href="https://github.com/versatiles-org/node-versatiles-svelte/issues" target="_blank">
			Add a GitHub issue.</a
		>
	</div>
</div>

<style>
	.sidebar {
		width: 200px;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		background-color: #eee;
		overflow-y: scroll;
		box-sizing: border-box;
		padding: 0.5em var(--gap) 0;
		border-left: 0.5px solid rgba(0, 0, 0, 0.5);

		hr {
			border: none;
			border-top: 0.5px solid rgba(0, 0, 0, 1);
			margin: var(--gap) 0 var(--gap);
		}

		:global(h2) {
			font-size: 0.9em;
			font-weight: normal;
			opacity: 0.5;
			padding-top: var(--gap);
			border-top: 0.5px solid rgba(0, 0, 0, 1);
			margin: var(--gap) 0 var(--gap);
			text-align: center;
		}

		:global(.row-flex) {
			margin-bottom: var(--gap);
			display: flex;
			justify-content: space-between;
			column-gap: var(--gap);
			:global(input) {
				flex-grow: 0;
			}
		}

		:global(.row-input) {
			margin: var(--gap) 0 var(--gap);
			display: flex;
			justify-content: space-between;
			align-items: center;
			& > :global(label) {
				flex-grow: 0;
			}
			& > :global(button),
			& > :global(input),
			& > :global(select) {
				width: 60%;
				flex-grow: 0;
			}
			& > :global(input[type='checkbox']) {
				width: auto;
			}
		}

		:global(label),
		:global(.label) {
			opacity: 0.7;
			font-size: 0.8em;
		}

		:global(button),
		:global(input),
		:global(select) {
			width: 100%;
			box-sizing: border-box;
			margin: 0;
		}

		:global(p) {
			font-size: 0.8em;
			opacity: 0.5;
			margin: 0.5em 0 1em;
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
</style>
