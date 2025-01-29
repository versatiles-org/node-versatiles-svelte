<script lang="ts">
	import EditorMarker from './EditorMarker.svelte';
	import type { AbstractElement } from './lib/element_abstract.js';
	import { MarkerElement } from './lib/element_marker.js';

	const { element = $bindable() }: { element: AbstractElement } = $props();

	let name = $state(element.name);
	$effect(() => {
		element.name = name;
	});
</script>

{#if element}
	<!-- <input type="text" bind:value={element.bind()} /> -->
	<input type="text" bind:value={name} />
	{#if element instanceof MarkerElement}
		<EditorMarker {element} />
	{/if}
{/if}
