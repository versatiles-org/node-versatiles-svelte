<script lang="ts">
	import {} from './editor.scss';
	import EditorMarker from './EditorMarker.svelte';
	import EditorLine from './EditorLine.svelte';
	import type { AbstractElement } from './lib/element_abstract.js';
	import { LineElement } from './lib/element_line.js';
	import { MarkerElement } from './lib/element_marker.js';

	const { element }: { element: AbstractElement } = $props();
	let name = $state(element.name);

	$effect(() => {
		name = element.name;
	});

	$effect(() => {
		//element.name = name;
	});
</script>

{#if element}
	<label for="input-name">Name</label>
	<input id="input-name" type="text" bind:value={name} />
	{#if element instanceof MarkerElement}
		<EditorMarker {element} />
	{/if}
	{#if element instanceof LineElement}
		<EditorLine {element} />
	{/if}
{/if}
