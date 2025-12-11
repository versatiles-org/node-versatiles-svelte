<script lang="ts">
	import '../style/index.scss';
	import Editor from './Editor.svelte';
	import SidebarPanel from './SidebarPanel.svelte';
	import DialogShareMap from './DialogShare.svelte';
	import PanelFile from './PanelFile.svelte';
	import type { GeometryManagerInteractive } from '../lib/geometry_manager_interactive.js';

	const { geometryManager }: { geometryManager: GeometryManagerInteractive } = $props();

	let panelShareMap: DialogShareMap | null = null;
	const history = $derived(geometryManager.state);
	const undoEnabled = $derived(geometryManager.state.history.undoEnabled);
	const redoEnabled = $derived(geometryManager.state.history.redoEnabled);
	const activeElement = $derived(geometryManager.selection.selectedElement);

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

	function addNewElement(type: 'marker' | 'line' | 'polygon' | 'circle') {
		activeElement.set(geometryManager.addNewElement(type));
	}
</script>

<div class="sidebar">
	<div style="margin-bottom: 36px;">
		<div class="grid2">
			<button class="btn" onclick={() => history.undo()} disabled={!$undoEnabled}>Undo</button>
			<button class="btn" onclick={() => history.redo()} disabled={!$redoEnabled}>Redo</button>
		</div>
		<hr class="thick" />
		<SidebarPanel title="Map">
			<PanelFile manager={geometryManager} />
			<div class="grid1">
				<button class="btn" onclick={() => panelShareMap?.open()}>Share/Embed</button>
				<DialogShareMap bind:this={panelShareMap} bind:state={() => geometryManager.state, () => {}} />
			</div>
		</SidebarPanel>
		<hr class="thick" />
		<SidebarPanel title="Import/Export" open={false}>
			<label
				>GeoJSON:
				<div class="grid2">
					<button class="btn" onclick={importGeoJSON}>Import</button>
					<button class="btn" onclick={exportGeoJSON} data-testid="btnExportGeoJSON">Export</button>
				</div>
			</label>
		</SidebarPanel>
		<hr class="thick" />
		<SidebarPanel title="Add new">
			<div class="grid2">
				<button class="btn" onclick={() => addNewElement('marker')}>Marker</button>
				<button class="btn" onclick={() => addNewElement('line')}>Line</button>
				<button class="btn" onclick={() => addNewElement('polygon')}>Polygon</button>
				<button class="btn" onclick={() => addNewElement('circle')}>Circle</button>
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
		background: color-mix(in srgb, var(--color-bg) 80%, transparent);
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
