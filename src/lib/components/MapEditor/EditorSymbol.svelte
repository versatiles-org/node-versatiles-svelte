<script lang="ts">
	import { MapLayerSymbol, symbols } from './lib/map_layer/symbol.js';

	const symbolList = Array.from(symbols.keys()).sort();

	const { layer }: { layer: MapLayerSymbol } = $props();

	let symbolName = $state(layer.symbolName);
	let color = $state(layer.color);
	let rotate = $state(layer.rotate);
	let halo = $state(layer.halo);
	let label = $state(layer.label);
	let size = $state(layer.size);
</script>

<div class="row-input">
	<label for="symbol-input">Symbol:</label>
	<select id="symbol-input" bind:value={$symbolName} class="input">
		{#each symbolList as s}
			<option value={s}>{s}</option>
		{/each}
	</select>
</div>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={$color} />
</div>

<div class="row-input">
	<label for="size">Size:</label>
	<input id="size" type="range" min="0.5" max="3" step="0.1" bind:value={$size} />
</div>

<div class="row-input">
	<label for="rotate">Rotation:</label>
	<input id="rotate" type="range" min="-180" max="180" step="15" bind:value={$rotate} />
</div>

<div class="row-input">
	<label for="halo">Halo:</label>
	<input id="halo" type="range" min="0" max="3" step="0.5" bind:value={$halo} />
</div>

<div class="row-input">
	<label for="text">Text:</label>
	<input id="text" type="text" bind:value={$label} />
</div>
