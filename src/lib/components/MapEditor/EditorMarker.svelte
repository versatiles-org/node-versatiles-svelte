<script lang="ts">
	import { MarkerDrawer } from '$lib/utils/draw/marker.js';
	import { get } from 'svelte/store';

	let { element = $bindable() }: { element: MarkerDrawer } = $props();

	let style = element.style;
	let color = $state(get(style.color));

	$effect(() => style.color.set(color));
</script>

<div class="row">
	<label for="color-input">Color</label>
	<input id="color-input" type="color" bind:value={color} />
</div>
