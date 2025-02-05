<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import type { MapLayerFill } from './lib/map_layer/fill.js';

	const { style }: { style: MapLayerFill['style'] } = $props();

	let color = $state(get(style.color));
	let opacity = $state(get(style.opacity));

	$effect(() => style.color.set(color));
	$effect(() => style.opacity.set(opacity));
</script>

<div class="row">
	<label for="color-input"> Color</label>
	<input id="color-input" type="color" bind:value={color} />

	<label for="opacity-input">Opacity</label>
	<input id="opacity-input" type="range" min="0" max="1" step="0.1" bind:value={opacity} />
</div>
