<script lang="ts">
	import '../style/index.scss';
	import Editor from './Editor.svelte';
	import type { GeometryManager } from '../lib/geometry_manager.js';
	import SidebarPanel from './SidebarPanel.svelte';
	import PanelShareMap from './DialogShare.svelte';
	import File from './File.svelte';

	const { geometryManager }: { geometryManager: GeometryManager } = $props();

	let panelShareMap: PanelShareMap | null = null;
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
					geometryManager.state.log();
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

<div class="sidebar">
	<div style="margin-bottom: 36px;">
		<div class="grid2">
			<button class="btn" onclick={() => history.undo()} disabled={!$undoEnabled}>Undo</button>
			<button class="btn" onclick={() => history.redo()} disabled={!$redoEnabled}>Redo</button>
		</div>
		<hr class="thick" />
		<SidebarPanel title="File">
			<File manager={geometryManager} />
		</SidebarPanel>
		<hr class="thick" />
		<SidebarPanel title="Import/Export" open={false}>
			<div class="grid1">
				<button class="btn" onclick={() => panelShareMap?.open()}>Share Map</button>
				<PanelShareMap bind:this={panelShareMap} bind:state={() => geometryManager.state, () => {}} />
			</div>
			<label
				>GeoJSON:
				<div class="grid2">
					<button class="btn" onclick={importGeoJSON}>Import</button>
					<button class="btn" onclick={exportGeoJSON}>Export</button>
				</div>
			</label>
		</SidebarPanel>
		<hr class="thick" />
		<SidebarPanel title="Add new">
			<div class="grid2">
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewMarker())}>Marker</button>
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewLine())}>Line</button>
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewPolygon())}>Polygon</button>
				<button class="btn" disabled>Circle</button>
			</div>
		</SidebarPanel>
		<hr class="thick" />
		<Editor element={$activeElement} />
		<hr class="thick" />
		<SidebarPanel title="Actions" disabled={!$activeElement}>
			<div class="grid2">
				<button
					class="btn"
					onclick={() => {
						$activeElement!.delete();
						geometryManager.state.log();
					}}>Delete</button
				>
			</div>
		</SidebarPanel>
		<hr class="thick" />
		<SidebarPanel title="Help" open={false}>
			<p>
				Submit bugs and feature requests as
				<a
					id="github_link"
					href="https://github.com/versatiles-org/node-versatiles-svelte/issues"
					target="_blank"
					aria-label="Repository on GitHub">GitHub Issues</a
				>
			</p>
		</SidebarPanel>
	</div>
</div>

<style>
	.sidebar {
		background-color: rgb(from var(--color-bg) r g b/ 0.7);
		backdrop-filter: blur(10px);
		box-sizing: border-box;
		color: var(--color-text);
		font-size: 0.8em;
		height: 100%;
		overflow-y: scroll;
		padding: var(--gap);
		position: absolute;
		right: 0;
		top: 0;
		width: 250px;
	}

	a {
		color: var(--fg-color);
	}
</style>
