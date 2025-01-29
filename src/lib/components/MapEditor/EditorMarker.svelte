<script lang="ts">
	import { get } from 'svelte/store';
	import type { MarkerElement } from './lib/element_marker.js';

	let { element = $bindable() }: { element: MarkerElement } = $props();

	let color = $state(get(element.color));

	$effect(() => element.color.set(color));
</script>

<div class="row">
	<label for="color-input">Color</label>
	<input id="color-input" type="color" bind:value={color} />
</div>
