<script lang="ts">
	import {} from './editor.scss';
	import EditorMarker from './EditorMarker.svelte';
	import type { AbstractElement } from './lib/element_abstract.js';
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
{/if}
