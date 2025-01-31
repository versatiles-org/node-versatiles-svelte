<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import type { MarkerElement } from './lib/element_marker.js';
	import { symbols } from './lib/element_marker.js';

	const symbolList = Array.from(symbols.keys()).sort();

	let { element }: { element: MarkerElement } = $props();

	let color = $state(get(element.color));
	let halo = $state(get(element.halo));
	let rotate = $state(get(element.rotate));
	let size = $state(get(element.size));
	let symbol = $state(get(element.symbol));

	$effect(() => element.color.set(color));
	$effect(() => element.halo.set(halo));
	$effect(() => element.rotate.set(rotate));
	$effect(() => element.size.set(size));
	$effect(() => element.symbol.set(symbol));
</script>

<div class="row">
	<label for="symbol-input">Symbol</label>
	<select id="symbol-input" bind:value={symbol}>
		{#each symbolList as s}
			<option value={s}>{s}</option>
		{/each}
	</select>

	<label for="color-input">Color</label>
	<input id="color-input" type="color" bind:value={color} />

	<label for="size-input">Size</label>
	<input id="size-input" type="range" min="0.5" max="3" step="0.1" bind:value={size} />

	<label for="rotate-input">Rotation</label>
	<input id="rotate-input" type="range" min="-180" max="180" step="15" bind:value={rotate} />

	<label for="halo-input">Halo</label>
	<input id="halo-input" type="range" min="0" max="3" step="0.5" bind:value={halo} />
</div>
