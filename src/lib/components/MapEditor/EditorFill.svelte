<script lang="ts">
	import { get } from 'svelte/store';
	import type { MapLayerFill } from './lib/map_layer/fill.js';

	const { style }: { style: MapLayerFill['style'] } = $props();

	let color = $state(get(style.color));
	let opacity = $state(get(style.opacity));

	$effect(() => style.color.set(color));
	$effect(() => style.opacity.set(opacity));
</script>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={color} />
</div>

<div class="row-input">
	<label for="opacity">Opacity:</label>
	<input id="opacity" type="range" min="0" max="1" step="0.02" bind:value={opacity} />
</div>
