<script lang="ts">
	import { labelPositions, MapLayerSymbol } from '../lib/map_layer/symbol.js';
	import InputRow from './InputRow.svelte';
	import SymbolSelector from './PanelSymbolSelector.svelte';

	const { layer }: { layer: MapLayerSymbol } = $props();
	const symbolIndex = $derived(layer.symbolIndex);
	const color = $derived(layer.color);
	const rotate = $derived(layer.rotate);
	const halo = $derived(layer.halo);
	const label = $derived(layer.label);
	const labelAlign = $derived(layer.labelAlign);
	const size = $derived(layer.size);
</script>

<InputRow id="label" label="Symbol">
	<SymbolSelector
		bind:symbolIndex={
			() => $symbolIndex,
			(v) => {
				symbolIndex.set(v);
				layer.manager.state?.log();
			}
		}
		map={layer.manager.map}
	/>
</InputRow>

<InputRow id="color" label="Color">
	<input
		id="color"
		type="color"
		bind:value={
			() => $color,
			(v) => {
				color.set(v);
				layer.manager.state?.log();
			}
		}
	/>
</InputRow>

<InputRow id="size" label="Size">
	<input
		id="size"
		type="range"
		min="0.5"
		max="3"
		step="0.1"
		bind:value={
			() => $size,
			(v) => {
				size.set(v);
				layer.manager.state?.log();
			}
		}
	/>
</InputRow>

<InputRow id="rotate" label="Rotation">
	<input
		id="rotate"
		type="range"
		min="-180"
		max="180"
		step="15"
		bind:value={
			() => $rotate,
			(v) => {
				rotate.set(v);
				layer.manager.state?.log();
			}
		}
	/>
</InputRow>

<InputRow id="halo" label="Halo">
	<input
		id="halo"
		type="range"
		min="0"
		max="3"
		step="0.5"
		bind:value={
			() => $halo,
			(v) => {
				halo.set(v);
				layer.manager.state?.log();
			}
		}
	/>
</InputRow>

<InputRow id="label" label="Label">
	<input
		id="label"
		type="label"
		bind:value={
			() => $label,
			(v) => {
				label.set(v);
				layer.manager.state?.log();
			}
		}
	/>
</InputRow>

<InputRow id="labelAlign" label="Align Label">
	<select
		id="labelAlign"
		bind:value={
			() => $labelAlign,
			(v) => {
				labelAlign.set(v);
				layer.manager.state?.log();
			}
		}
	>
		{#each labelPositions as { index, name } (index)}
			<option value={index}>{name}</option>
		{/each}
	</select>
</InputRow>
