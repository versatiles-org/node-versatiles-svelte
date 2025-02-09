<script lang="ts">
	import { fillPatterns, type MapLayerFill } from '../lib/map_layer/fill.js';

	const { layer }: { layer: MapLayerFill } = $props();

	let color = $state(layer.color);
	let pattern = $state(layer.pattern);
	let opacity = $state(layer.opacity);
</script>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={$color} />
</div>

<div class="row-input">
	<label for="pattern">Pattern:</label>
	<select id="pattern" bind:value={$pattern}>
		{#each fillPatterns as [index, fill]}
			<option value={index}>{fill.name}</option>
		{/each}
	</select>
</div>

<div class="row-input">
	<label for="opacity">Opacity:</label>
	<input id="opacity" type="range" min="0" max="1" step="0.02" bind:value={$opacity} />
</div>
