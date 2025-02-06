<script lang="ts">
	import {} from './editor.scss';
	import EditorSymbol from './EditorSymbol.svelte';
	import EditorLine from './EditorStroke.svelte';
	import type { AbstractElement } from './lib/element/abstract.js';
	import { LineElement } from './lib/element/line.js';
	import { MarkerElement } from './lib/element/marker.js';
	import { PolygonElement } from './lib/element/polygon.js';
	import EditorFill from './EditorFill.svelte';

	const { element }: { element: AbstractElement } = $props();
	let name = $state(element.name);

	$effect(() => {
		name = element.name;
	});
</script>

<div class="editor">
	{#if element}
		<label for="input-name">Name</label>
		<input id="input-name" type="text" bind:value={name} />
		{#if element instanceof MarkerElement}
			<h2>Symbol</h2>
			<EditorSymbol style={element.style} />
		{/if}
		{#if element instanceof LineElement}
			<h2>Stroke</h2>
			<EditorLine style={element.style} />
		{/if}
		{#if element instanceof PolygonElement}
			<h2>Fill</h2>
			<EditorFill style={element.fillStyle} />
			<h2>Stroke</h2>
			<EditorLine style={element.strokeStyle} />
		{/if}
	{/if}
</div>

<style>
	h2 {
		font-size: 0.9em;
		font-weight: normal;
		border-top: 0.5px solid rgba(0, 0, 0, 1);
		opacity: 0.5;
		padding-top: 0.5em;
		margin: 1em 0 0;
		text-align: center;
	}
</style>
