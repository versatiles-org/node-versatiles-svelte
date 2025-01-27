<script lang="ts">
	import { MarkerDrawer } from '$lib/utils/draw/marker.js';
	import type { SymbolStyle } from '$lib/utils/draw/style.js';
	import EditorMarker from './EditorMarker.svelte';

	let { element = $bindable() }: { element: MarkerDrawer | null } = $props();

</script>

{#if element instanceof MarkerDrawer}
	<EditorMarker {element} />
{/if}
