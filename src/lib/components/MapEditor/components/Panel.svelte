<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, style }: { children: Snippet; style?: string } = $props();
	let dialog: HTMLDialogElement | null = null;

	export function open() {
		dialog?.showModal();
	}

	export function close() {
		dialog?.close();
	}
</script>

<dialog bind:this={dialog} {style}>
	<button onclick={() => dialog?.close()}>&#x2715;</button>
	{@render children?.()}
</dialog>

<style>
	dialog {
		width: min(500px, 100vw);
		height: min(500px, 100vh);
		background-color: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
		z-index: 10000;
		border: 0.5px solid rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		box-sizing: border-box;
		padding: 20px;
	}

	dialog::backdrop {
		backdrop-filter: blur(2px) brightness(0.9);
	}

	button {
		position: absolute;
		top: 0px;
		right: 0px;
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
