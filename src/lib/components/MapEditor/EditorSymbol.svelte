<script lang="ts">
	import { get } from 'svelte/store';
	import { MapLayerSymbol, symbols } from './lib/map_layer/symbol.js';

	const symbolList = Array.from(symbols.keys()).sort();

	const { style }: { style: MapLayerSymbol['style'] } = $props();

	let color = $state(get(style.color));
	let halo = $state(get(style.halo));
	let rotate = $state(get(style.rotate));
	let size = $state(get(style.size));
	let symbol = $state(get(style.symbol));
	let label = $state(get(style.label));

	$effect(() => style.color.set(color));
	$effect(() => style.halo.set(halo));
	$effect(() => style.rotate.set(rotate));
	$effect(() => style.size.set(size));
	$effect(() => style.label.set(label));
	$effect(() => style.symbol.set(symbol));
</script>

<div class="row">
	<label for="symbol-input">Symbol</label>
	<select id="symbol-input" bind:value={symbol} class="input">
		{#each symbolList as s}
			<option value={s}>{s}</option>
		{/each}
	</select>

	<label for="color-input">Color:</label>
	<input id="color-input" type="color" bind:value={color} />

	<label for="size-input">Size:</label>
	<input id="size-input" type="range" min="0.5" max="3" step="0.1" bind:value={size} />

	<label for="rotate-input">Rotation:</label>
	<input id="rotate-input" type="range" min="-180" max="180" step="15" bind:value={rotate} />

	<label for="halo-input">Halo:</label>
	<input id="halo-input" type="range" min="0" max="3" step="0.5" bind:value={halo} />

	<label for="label-input">Label:</label>
	<input id="label-input" type="text" bind:value={label} />
</div>
