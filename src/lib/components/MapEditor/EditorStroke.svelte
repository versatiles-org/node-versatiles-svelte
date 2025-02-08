<script lang="ts">
	import { dashArrays, MapLayerLine } from './lib/map_layer/line.js';

	const dashedList = Array.from(dashArrays.keys()).sort();

	const { layer }: { layer: MapLayerLine } = $props();

	let color = $state(layer.color);
	let width = $state(layer.width);
	let dashed = $state(layer.dashed);
</script>

<div class="row-input">
	<label for="dashed">Dashed:</label>
	<select id="dashed" bind:value={$dashed}>
		{#each dashedList as d}
			<option value={d}>{d}</option>
		{/each}
	</select>
</div>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={$color} />
</div>

<div class="row-input">
	<label for="width">Width:</label>
	<input id="width" type="range" min="0.5" max="5" step="0.5" bind:value={$width} />
</div>
