<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { SymbolLibrary } from '../lib/symbols.js';

	let {
		symbolIndex = $bindable(),
		symbolLibrary
	}: { symbolIndex: number; symbolLibrary: SymbolLibrary } = $props();

	let open = $state(false);

	const drawIconHalo: Action<HTMLCanvasElement, number> = (canvas, index) =>
		symbolLibrary.drawSymbol(canvas, index, true);

	const drawIcon: Action<HTMLCanvasElement, number> = (canvas, index) =>
		symbolLibrary.drawSymbol(canvas, index);
</script>

<button
	onclick={() => (open = !open)}
	style="text-align: left; white-space: nowrap; overflow: hidden; padding: 1px"
>
	{#key symbolIndex}
		<canvas
			width="40"
			height="40"
			use:drawIcon={symbolIndex}
			style="width:20px;height:20px;vertical-align:middle"
		></canvas>
	{/key}
	{#if symbolIndex !== undefined}
		{symbolLibrary.getSymbol(symbolIndex)?.name}
	{:else}
		Select Symbol
	{/if}
</button>

<div class="modal" style="display: {open ? 'block' : 'none'};">
	<button class="close" onclick={() => (open = false)}>&#x2715;</button>
	<div class="inner">
		{#each symbolLibrary.asList() as symbol}
			<button
				class="icon"
				onclick={() => {
					symbolIndex = symbol.index;
					open = false;
				}}
				><canvas width="64" height="64" use:drawIconHalo={symbol.index}></canvas><br
				/>{symbol.name}</button
			>
		{/each}
	</div>
</div>

<style>
	.modal {
		position: fixed;
		top: max(calc(50vh - 250px), 0px);
		left: max(calc(50vw - 250px), 0px);
		width: min(500px, 100vw);
		height: min(500px, 100vh);
		background-color: rgba(255, 255, 255, 0.5);
		backdrop-filter: blur(20px) brightness(0.85);
		box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.2);
		z-index: 10000;
		border: 0.5px solid rgba(0, 0, 0, 0.5);
		border-radius: 10px;
		box-sizing: border-box;
		padding: 20px;

		.inner {
			width: 100%;
			height: 100%;
			overflow-y: scroll;
			display: grid;
			grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
			row-gap: 10px;
			column-gap: 0px;
			justify-items: center;

			.icon {
				width: 48px;
				height: 48px;
				cursor: pointer;
				border: none;
				font-size: 0.6em;
				background: none;
				line-height: 1em;
				text-align: center;
				padding: 0;

				&:hover {
					background-color: rgba(0, 0, 0, 0.1);
				}

				canvas {
					display: inline-block;
					width: 32px;
					height: 32px;
				}
			}
		}

		.close {
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
	}
</style>
