<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import type { PolygonElement } from './lib/element_polygon.js';

	let { element }: { element: PolygonElement } = $props();

	let fillColor = $state(get(element.fillColor));
	let opacity = $state(get(element.opacity));

	$effect(() => element.fillColor.set(fillColor));
	$effect(() => element.opacity.set(opacity));
</script>

<div class="row">
	<label for="fill-input">Fill Color</label>
	<input id="fill-input" type="fill" bind:value={fillColor} />

	<label for="opacity-input">Opacity</label>
	<input id="opacity-input" type="range" min="0" max="1" step="0.1" bind:value={opacity} />
</div>
