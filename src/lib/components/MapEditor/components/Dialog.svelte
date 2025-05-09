<script lang="ts">
	import { EventHandler } from '../lib/event_handler.js';
	import Panel from './Panel.svelte';

	let panel: Panel | null = null;
	let input: HTMLInputElement | null = null;
	let eventHandler = new EventHandler();
	let btnDownload: HTMLButtonElement | null = null;

	export async function askDownloadFilename(initialFilename: string): Promise<string | null> {
		if (!panel) return null;
		if (!input) return null;

		input.value = initialFilename;
		panel?.eventHandler.clear();
		eventHandler.clear();

		const response = await new Promise<boolean>((resolve) => {
			if (!panel) return resolve(false);
			panel.open();
			btnDownload?.focus();

			panel.eventHandler.on('close', () => resolve(false));
			eventHandler.on('cancel', () => resolve(false));
			eventHandler.on('ok', () => resolve(true));
		});

		panel?.close();
		panel?.eventHandler.clear();
		eventHandler.clear();

		if (!response) return null;
		if (!input) return null;
		const filename = input.value.trim();
		if (!filename) return null;
		return filename;
	}
</script>

<Panel bind:this={panel} size="small">
	<h2>Download File</h2>
	<p>
		<label
			>File name: <input
				type="text"
				placeholder="Enter filename"
				bind:this={input}
				spellcheck="false"
				onkeypress={(e) => {
					if (e.key === 'Enter') eventHandler.emit('ok');
				}}
			/></label
		>
	</p>
	<div class="grid2">
		<button class="btn" onclick={() => eventHandler.emit('cancel')}>Cancel</button>
		<button class="btn" onclick={() => eventHandler.emit('ok')} bind:this={btnDownload}>Download</button>
	</div>
</Panel>

<style>
	h2 {
		text-align: center;
		margin-top: 0;
	}
	.grid2 {
		margin: 0;
	}
</style>
