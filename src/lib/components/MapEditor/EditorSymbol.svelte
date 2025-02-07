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

<div class="row-input">
	<label for="symbol-input">Symbol:</label>
	<select id="symbol-input" bind:value={symbol} class="input">
		{#each symbolList as s}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={color} />
</div>

<div class="row-input">
	<label for="size">Size:</label>
	<input id="size" type="range" min="0.5" max="3" step="0.1" bind:value={size} />
</div>

<div class="row-input">
	<label for="rotate">Rotation:</label>
	<input id="rotate" type="range" min="-180" max="180" step="15" bind:value={rotate} />
</div>

<div class="row-input">
	<label for="halo">Halo:</label>
	<input id="halo" type="range" min="0" max="3" step="0.5" bind:value={halo} />
</div>

<div class="row-input">
	<label for="text">Text:</label>
	<input id="text" type="text" bind:value={label} />
</div>
