<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children, size }: { children?: Snippet; size?: 'big' | 'fullscreen' } = $props();
	let dialog: HTMLDialogElement | null = null;

	export function open() {
		dialog?.showModal();
	}

	export function close() {
		dialog?.close();
	}
</script>

<dialog bind:this={dialog} class={size}>
	<button onclick={() => dialog?.close()}>&#x2715;</button>
	{@render children?.()}
</dialog>

<style>
	dialog {
		max-width: 100vw;
		max-height: 100vh;
		min-width: 500px;
		min-height: 500px;
		width: 80vw;
		height: 80vh;

		background-color: rgba(255, 255, 255, 0.6);
		backdrop-filter: blur(8px);
		box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
		z-index: 10000;
		border: 0.5px solid rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		box-sizing: border-box;
		padding: 20px;

		&.fullscreen {
			width: calc(100vw - 20px);
			height: calc(100vh - 20px);
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
