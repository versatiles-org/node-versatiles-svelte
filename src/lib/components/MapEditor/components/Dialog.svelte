<script lang="ts">
	import type { Snippet } from 'svelte';
	import { EventHandler } from '$lib/utils/event_handler.js';

	let {
		children = $bindable(),
		size,
		onopen,
		onclose
	}: {
		children?: Snippet;
		size?: 'big' | 'fullscreen' | 'small';
		onopen?: () => void;
		onclose?: () => void;
	} = $props();

	let dialog: HTMLDialogElement | null = null;
	export const eventHandler = new EventHandler<{
		open: void;
		close: void;
	}>();

	export function getNode(): HTMLDialogElement {
		return dialog!;
	}

	export function open() {
		dialog?.showModal();
		if (onopen) onopen();
		eventHandler.emit('open');
	}

	export function close() {
		dialog?.close();
		if (onclose) onclose();
		eventHandler.emit('close');
	}

	export function isOpen(): boolean {
		return dialog?.open ?? false;
	}
</script>

<dialog bind:this={dialog} class={size}>
	<button onclick={close}>&#x2715;</button>
	{@render children?.()}
</dialog>

<style>
	dialog {
		max-width: 100vw;
		max-height: 100vh;
		min-width: 300px;
		min-height: 100px;
		width: 80vw;
		height: 80vh;

		background-color: rgba(255, 255, 255, 0.8);
		backdrop-filter: blur(10px);
		box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
		z-index: 10000;
		border: 0.5px solid rgba(0, 0, 0, 0.3);
		border-radius: 10px;
		box-sizing: border-box;
		padding: 20px;

		&.fullscreen {
			width: calc(100vw - 20px);
			height: calc(100vh - 20px);
		}

		&.small {
			width: fit-content;
			height: fit-content;
		}
	}

	dialog::backdrop {
		backdrop-filter: blur(2px) brightness(0.9);
	}

	button {
		position: absolute;
		top: 5px;
		right: 5px;
		font-size: 20px;
		cursor: pointer;
		background: none;
		border: none;
		width: 25px;
		height: 25px;
		text-align: center;
		padding: 0;
	}
</style>
