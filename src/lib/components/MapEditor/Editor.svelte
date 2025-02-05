<script lang="ts">
	import {} from './editor.scss';
	import EditorMarker from './EditorMarker.svelte';
	import EditorLine from './EditorLine.svelte';
	import type { AbstractElement } from './lib/element/abstract.js';
	import { LineElement } from './lib/element/line.js';
	import { MarkerElement } from './lib/element/marker.js';
	import { PolygonElement } from './lib/element/polygon.js';
	import EditorPolygon from './EditorPolygon.svelte';

	const { element }: { element: AbstractElement } = $props();
	let name = $state(element.name);

	$effect(() => {
		name = element.name;
	});
</script>

{#if element}
	<label for="input-name">Name</label>
	<input id="input-name" type="text" bind:value={name} />
	{#if element instanceof MarkerElement}
		<EditorMarker style={element.style} />
	{/if}
	{#if element instanceof LineElement}
		<EditorLine style={element.style} />
	{/if}
	{#if element instanceof PolygonElement}
		<EditorPolygon fillStyle={element.fillStyle} strokeStyle={element.strokeStyle} />
	{/if}
{/if}
