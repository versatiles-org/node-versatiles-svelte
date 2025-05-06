<script lang="ts">
	import type { Action } from 'svelte/action';
	import type { SymbolLibrary } from '../lib/symbols.js';
	import Panel from './Panel.svelte';

	let panel: Panel;
	const buttonIconSize = 20;
	const listItemSize = 48;
	const listIconSize = 32;
	const retina = window.devicePixelRatio || 1;

	let {
		symbolIndex = $bindable(),
		symbolLibrary
	}: { symbolIndex: number; symbolLibrary: SymbolLibrary } = $props();

	const drawIconHalo: Action<HTMLCanvasElement, number> = (canvas, index) =>
		symbolLibrary.drawSymbol(canvas, index, 3);

	const drawIcon: Action<HTMLCanvasElement, number> = (canvas, index) =>
		symbolLibrary.drawSymbol(canvas, index, 3);
</script>

<button
	onclick={() => panel?.open()}
	style="text-align: left; white-space: nowrap; overflow: hidden; padding: 1px"
>
	{#key symbolIndex}
		<canvas
			width={buttonIconSize * retina}
			height={buttonIconSize * retina}
			use:drawIcon={symbolIndex}
			style="width:{buttonIconSize}px;height:{buttonIconSize}px;vertical-align:middle"
		></canvas>
	{/key}
	{#if symbolIndex !== undefined}
		{symbolLibrary.getSymbol(symbolIndex)?.name}
	{:else}
		Select Symbol
	{/if}
</button>

<Panel
	bind:this={panel}
	style="width: min(100vw,max(80vw,500px)); height: min(100vh,max(80vh,500px))"
>
	<div class="list" style="--list-icon-size: {listIconSize}px; --list-item-size: {listItemSize}px">
		{#each symbolLibrary.asList() as symbol (symbol.index)}
			<button class="item" onclick={() => (symbolIndex = symbol.index)}
				><canvas
					width={listIconSize * retina}
					height={listIconSize * retina}
					use:drawIconHalo={symbol.index}
				></canvas><br />{symbol.name}</button
			>
		{/each}
	</div>
</Panel>

<style type="text/scss">
	.list {
		width: 100%;
		height: 100%;
		overflow-y: scroll;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(64px, 1fr));
		row-gap: 10px;
		column-gap: 0px;
		justify-items: center;

		.item {
			width: var(--list-item-size);
			height: var(--list-item-size);
			cursor: pointer;
			border: none;
			font-size: 10px;
			background: none;
			line-height: 1em;
			text-align: center;
			padding: 0;

			&:hover {
				background-color: rgba(0, 0, 0, 0.1);
			}

			canvas {
				display: inline-block;
				width: var(--list-icon-size);
				height: var(--list-icon-size);
			}
		}
	}
</style>
