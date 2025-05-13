<script lang="ts">
	import type { GeometryManagerInteractive } from '../lib/geometry_manager_interactive.js';
	import Dialog from './DialogFile.svelte';

	const { manager }: { manager: GeometryManagerInteractive } = $props();

	const defaultFilename = 'default.mapjson';
	let filename = defaultFilename;
	const useFileAPI = false;
	let dialog: Dialog | undefined = undefined;
	const disabledSave = $state(false);

	async function newFile(): Promise<void> {
		if (!(await dialog?.askCreateNew())) return;
		manager.clear();
		filename = defaultFilename;
	}

	async function openFile(): Promise<void> {
		if (!dialog) return;

		const fileInput = document.createElement('input');
		fileInput.type = 'file';
		fileInput.accept = '.mapjson';
		fileInput.onchange = async (event: Event) => {
			const target = event.target as HTMLInputElement;
			if (!target.files || target.files.length === 0) return;
			const file = target.files[0];
			filename = file.name;
			const reader = new FileReader();
			reader.onload = () => {
				manager.loadState(JSON.parse(reader.result as string));
			};
			reader.readAsText(file);
		};
		fileInput.click();
	}

	async function saveFile(): Promise<void> {}

	async function downloadFile(): Promise<void> {
		if (!dialog) return;
		const response = await dialog.askDownloadFilename(filename);
		if (!response) return;
		filename = response;

		const state = manager.getState();
		const blob = new Blob([JSON.stringify(state)], { type: 'application/json' });
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
