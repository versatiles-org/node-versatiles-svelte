<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import type { MapLayerFill } from './lib/map_layer/fill.js';
	import type { MapLayerLine } from './lib/map_layer/line.js';

	const {
		fillStyle,
		strokeStyle
	}: { fillStyle: MapLayerFill['style']; strokeStyle: MapLayerLine['style'] } = $props();

	let fillColor = $state(get(fillStyle.color));
	let opacity = $state(get(fillStyle.opacity));

	let strokeColor = $state(get(strokeStyle.color));

	$effect(() => fillStyle.color.set(fillColor));
	$effect(() => fillStyle.opacity.set(opacity));
</script>

<div class="row">
	<label for="fill-color-input">Fill Color</label>
	<input id="fill-color-input" type="color" bind:value={fillColor} />

	<label for="stroke-color-input">Stroke Color</label>
	<input id="stroke-color-input" type="color" bind:value={strokeColor} />

	<label for="opacity-input">Opacity</label>
	<input id="opacity-input" type="range" min="0" max="1" step="0.1" bind:value={opacity} />
</div>
