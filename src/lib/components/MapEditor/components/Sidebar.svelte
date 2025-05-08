<script lang="ts">
	import '../style/button.scss';
	import Editor from './Editor.svelte';
	import type { GeometryManager } from '../lib/geometry_manager.js';
	import SidebarPanel from './SidebarPanel.svelte';
	import PanelShareMap from './PanelShareMap.svelte';

	const { geometryManager, width }: { geometryManager: GeometryManager; width: number } = $props();

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

<div class="sidebar" style="width: {width}px;">
	<div style="margin-bottom: 36px;">
		<div class="flex flex-two">
			<button class="btn" onclick={() => history.undo()} disabled={!$undoEnabled}>Undo</button>
			<button class="btn" onclick={() => history.redo()} disabled={!$redoEnabled}>Redo</button>
		</div>
		<div class="flex flex-one">
			<button class="btn" onclick={() => panelShareMap?.open()}>Share Map</button>
			<PanelShareMap bind:this={panelShareMap} bind:state={geometryManager.state} />
		</div>
		<SidebarPanel title="Import/Export" open={false}>
			<div class="flex flex-one">
				<button class="btn" onclick={importGeoJSON}>Import GeoJSON</button>
				<button class="btn" onclick={exportGeoJSON}>Export GeoJSON</button>
			</div>
		</SidebarPanel>
		<SidebarPanel title="Add new">
			<div class="flex flex-two">
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewMarker())}
					>Marker</button
				>
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewLine())}
					>Line</button
				>
				<button class="btn" onclick={() => activeElement.set(geometryManager.addNewPolygon())}
					>Polygon</button
				>
				<button class="btn" disabled>Circle</button>
			</div>
		</SidebarPanel>
		<Editor element={$activeElement} />
		<SidebarPanel title="Actions" disabled={!$activeElement}>
			<div class="flex flex-two">
				<button
					class="btn"
					onclick={() => {
						$activeElement!.delete();
						geometryManager.state.log();
					}}>Delete</button
				>
			</div>
		</SidebarPanel>
		<SidebarPanel title="Help" open={false}>
			Submit bugs and feature requests as
			<a
				id="github_link"
				href="https://github.com/versatiles-org/node-versatiles-svelte/issues"
				target="_blank"
				aria-label="Repository on GitHub">GitHub issues</a
			>
		</SidebarPanel>
	</div>
</div>

<style>
	.sidebar {
		--color-btn: #368;
		--color-green: #484;
		--color-bg: #fff;
		--color-text: #000;
		--gap: 10px;
		--border-radius: 3px;

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
		width: 200px;

		.flex {
			--gap: 5px;
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--gap);
			justify-content: space-between;
			margin: var(--gap) 0 var(--gap);
			width: 100%;
		}
		.flex-two button {
			flex-grow: 1;
			flex-basis: 0;
			width: 40%;
		}

		.flex-one button {
			width: 100%;
		}
	}

	a {
		color: var(--fg-color);
	}
</style>
