<script lang="ts">
	import EditorMarker from './EditorMarker.svelte';
	import type { AbstractElement } from './lib/element_abstract.js';
	import { MarkerElement } from './lib/element_marker.js';

	let { element = $bindable() }: { element: AbstractElement | null } = $props();

	let name = $state('');

	$effect(() => {
		if (element) {
			element.name = name;
		}
	});
</script>

{#if element}
	<input type="text" bind:value={name} />
	{#if element instanceof MarkerElement}
		<EditorMarker {element} />
	{/if}
{/if}
