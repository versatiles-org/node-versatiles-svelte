<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import type { MarkerElement } from './lib/element_marker.js';

	let { element }: { element: MarkerElement } = $props();

	let color = $state(get(element.color));
	let size = $state(get(element.size));

	$effect(() => {
		color = get(element.color);
		size = get(element.size);
	});

	$effect(() => element.color.set(color));
	$effect(() => element.size.set(size));
</script>

<div class="row">
	<label for="color-input">Color</label>
	<input id="color-input" type="color" bind:value={color} />
	<label for="size-input">Size</label>
	<input id="size-input" type="range" min="0" max="5" step="0.1" bind:value={size} />
</div>
