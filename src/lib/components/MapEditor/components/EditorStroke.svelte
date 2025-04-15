<script lang="ts">
	import { dashArrays, MapLayerLine } from '../lib/map_layer/line.js';
	import InputRow from './InputRow.svelte';

	const { layer }: { layer: MapLayerLine } = $props();

	let color = $state(layer.color);
	let width = $state(layer.width);
	let dashed = $state(layer.dashed);
</script>

<InputRow id="color" label="Color">
	<input
		id="color"
		type="color"
		bind:value={
			() => $color,
			(v) => {
				$color = v;
				layer.manager.state.log();
			}
		}
	/>
</InputRow>

<InputRow id="dashed" label="Dashed">
	<select
		id="dashed"
		bind:value={
			() => $dashed,
			(v) => {
				$dashed = v;
				layer.manager.state.log();
			}
		}
	>
		{#each dashArrays as [index, dash] (index)}
			<option value={index}>{dash.name}</option>
		{/each}
	</select>
</InputRow>

<InputRow id="width" label="Width">
	<input
		id="width"
		type="range"
		min="0.5"
		max="5"
		step="0.5"
		bind:value={
			() => $width,
			(v) => {
				$width = v;
				layer.manager.state.log();
			}
		}
	/>
</InputRow>
