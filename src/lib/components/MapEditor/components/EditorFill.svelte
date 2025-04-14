<script lang="ts">
	import { fillPatterns, type MapLayerFill } from '../lib/map_layer/fill.js';
	import InputRow from './InputRow.svelte';

	const { layer }: { layer: MapLayerFill } = $props();

	let color = $state(layer.color);
	let pattern = $state(layer.pattern);
	let opacity = $state(layer.opacity);
</script>

<InputRow label="Color" id="color">
	<input id="color" type="color" bind:value={$color} />
</InputRow>

<InputRow label="Pattern" id="pattern">
	<select id="pattern" bind:value={$pattern}>
		{#each fillPatterns as [index, fill] (index)}
			<option value={index}>{fill.name}</option>
		{/each}
	</select>
</InputRow>

<InputRow label="Opacity" id="opacity">
	<input id="opacity" type="range" min="0" max="1" step="0.02" bind:value={$opacity} />
</InputRow>