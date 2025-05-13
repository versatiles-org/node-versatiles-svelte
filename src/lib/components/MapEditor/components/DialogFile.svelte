<script lang="ts">
	import { tick } from 'svelte';
	import Dialog from './Dialog.svelte';
	import { EventHandler } from '../lib/utils/event_handler.js';

	type Mode = 'download' | 'new' | null;
	let mode: Mode = $state(null);
	let dialog: Dialog | null = null;
	let input: HTMLInputElement | null = $state(null);
	let eventHandler = new EventHandler();

	async function openDialog(newMode: Mode) {
		if (!dialog) return;
		mode = newMode;

		dialog.eventHandler.clear();
		eventHandler.clear();

		dialog.open();
		await tick();
		dialog.getNode()?.querySelector<HTMLButtonElement>('button[data-focus]')?.focus();
		return;
	}

	async function closeDialog() {
		dialog?.close();
		dialog?.eventHandler.clear();
		eventHandler.clear();
		mode = null;
		return tick();
	}

	export async function askDownloadFilename(initialFilename: string): Promise<string | null> {
		if (!dialog) return null;
		await openDialog('download');
		initInput(initialFilename);
		const { response, value } = await getResponse(true);
		return (response && value?.trim()) || null;
	}

	export async function askCreateNew(): Promise<boolean> {
		if (!dialog) return false;
		await openDialog('new');
		const { response } = await getResponse(false);
		return response;
	}

	async function getResponse(defaultValue: boolean): Promise<{ response: boolean; value: string | null }> {
		const response = await new Promise<boolean>((resolve) => {
			if (!dialog) return resolve(false);
			dialog!.eventHandler.on('close', () => resolve(false));
			eventHandler.on('A', () => resolve(!defaultValue));
			eventHandler.on('B', () => resolve(defaultValue));
		});
		const value = input?.value ?? null;
		await closeDialog();
		return { response, value };
	}

	function emitA() {
		eventHandler.emit('A');
	}

	function emitB() {
		eventHandler.emit('B');
	}

	function initInput(value: string) {
		if (!input) return;
		input.value = value;
		input.addEventListener('keypress', (e) => {
			if (e.key === 'Enter') eventHandler.emit('B');
		});
	}
</script>

<Dialog bind:this={dialog} size="small">
	{#if mode == 'download'}
		<h2>Download File</h2>
		<label>
			File name:
			<input type="text" bind:this={input} spellcheck="false" />
		</label>
		<div class="grid2">
			<button class="btn" onclick={emitA}>Cancel</button>
			<button class="btn" onclick={emitB} data-focus>Download</button>
		</div>
	{/if}
	{#if mode == 'new'}
		<h2>New Map</h2>
		<p>Do you want to create a new map?</p>
		<div class="grid2">
			<button class="btn" onclick={emitA}>OK</button>
			<button class="btn" onclick={emitB} data-focus>Cancel</button>
		</div>
	{/if}
</Dialog>

<style>
	h2 {
		text-align: center;
		margin-top: 0;
	}
	.grid2 {
		margin: 0;
	}
	label,
	p {
		display: block;
		margin-bottom: 10px;
	}
</style>
