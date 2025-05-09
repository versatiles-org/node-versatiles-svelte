<script lang="ts">
	import type { GeometryManager } from '../lib/geometry_manager.js';
	import Dialog from './DialogFile.svelte';

	const { manager }: { manager: GeometryManager } = $props();

	let filename = 'map.geojson';
	const useFileAPI = false;
	let dialog: Dialog | undefined = undefined;
	const disabledSave = $state(false);

	async function newFile(): Promise<void> {}

	async function openFile(): Promise<void> {}
	async function saveFile(): Promise<void> {}
	async function downloadFile(): Promise<void> {
		if (!dialog) return;
		const response = await dialog.askDownloadFilename(filename);
		if (!response) return;
		filename = response;

		const geoJSON = manager.getGeoJSON();
		const blob = new Blob([JSON.stringify(geoJSON)], { type: 'application/geo+json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('href', url);
		a.setAttribute('download', filename);
		a.click();
		URL.revokeObjectURL(url);
	}
	async function saveFileAs(): Promise<void> {}
</script>

<div class="grid2">
	<button class="btn" onclick={newFile}>New</button>
	<button class="btn" onclick={openFile}>Open…</button>
</div>
<Dialog bind:this={dialog} />
{#if useFileAPI}
	<div class="grid2">
		<button class="btn" onclick={saveFile} disabled={disabledSave}>Save</button>
		<button class="btn" onclick={saveFileAs}>Save As…</button>
	</div>
{:else}
	<div class="grid1">
		<button class="btn" onclick={downloadFile}>Download</button>
	</div>
{/if}
