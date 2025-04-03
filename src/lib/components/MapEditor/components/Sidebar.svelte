<script lang="ts">
	import Editor from './Editor.svelte';
	import type { GeometryManager } from '../lib/geometry_manager.js';

	const { geometryManager, width }: { geometryManager: GeometryManager; width: number } = $props();

	let history = geometryManager.state;
	let undoEnabled = $state(geometryManager.state.undoEnabled);
	let redoEnabled = $state(geometryManager.state.redoEnabled);
	let activeElement = geometryManager.selectedElement;

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
	<div style="margin-bottom: 36px;">
		<div class="row-flex">
			<input type="button" value="Undo" onclick={() => history.undo()} disabled={!$undoEnabled} />
			<input type="button" value="Redo" onclick={() => history.redo()} disabled={!$redoEnabled} />
		</div>
		<hr />
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
				onclick={() => activeElement.set(geometryManager.addNewMarker())}
			/>
			<input
				type="button"
				value="Line"
				onclick={() => activeElement.set(geometryManager.addNewLine())}
			/>
			<input
				type="button"
				value="Polygon"
				onclick={() => activeElement.set(geometryManager.addNewPolygon())}
			/>
		</div>
		{#if $activeElement != null}
			<hr />
			{#key $activeElement}
				<Editor element={$activeElement} />
			{/key}
		{/if}
	</div>
</div>
<a
	id="github_link"
	href="https://github.com/versatiles-org/node-versatiles-svelte/"
	target="_blank"
	aria-label="Repository on GitHub"
	>Improve on GitHub
	<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 24 24"
		><path
			fill="currentColor"
			d="M12 .297c-6.63 0-12 5.373-12 12c0 5.303 3.438 9.8 8.205 11.385c.6.113.82-.258.82-.577c0-.285-.01-1.04-.015-2.04c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729c1.205.084 1.838 1.236 1.838 1.236c1.07 1.835 2.809 1.305 3.495.998c.108-.776.417-1.305.76-1.605c-2.665-.3-5.466-1.332-5.466-5.93c0-1.31.465-2.38 1.235-3.22c-.135-.303-.54-1.523.105-3.176c0 0 1.005-.322 3.3 1.23c.96-.267 1.98-.399 3-.405c1.02.006 2.04.138 3 .405c2.28-1.552 3.285-1.23 3.285-1.23c.645 1.653.24 2.873.12 3.176c.765.84 1.23 1.91 1.23 3.22c0 4.61-2.805 5.625-5.475 5.92c.42.36.81 1.096.81 2.22c0 1.606-.015 2.896-.015 3.286c0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
		/></svg
	>
</a>

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
	}

	#github_link {
		position: absolute;
		right: 0.2em;
		bottom: 0.2em;
		color: #000;
		opacity: 0.5;
		line-height: 0;
		text-decoration: none;
		font-size: 12px;
		&:hover {
			opacity: 1;
		}
		svg {
			vertical-align: -0.3em;
		}
	}
</style>
