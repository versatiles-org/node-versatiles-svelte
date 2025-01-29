<script lang="ts">
	import { get } from 'svelte/store';
	import type { MarkerElement } from './lib/element_marker.js';

	let { element = $bindable() }: { element: MarkerElement } = $props();
</script>

<div class="row">
	<label for="color-input">Color</label>
	<input
		id="color-input"
		type="color"
		bind:value={() => get(element.color), (color) => element.color.set(color)}
	/>
	<input
		type="range"
		min="0"
		max="5"
		step="0.1"
		bind:value={() => get(element.size), (size) => element.size.set(size)}
	/>
</div>
