<script lang="ts">
	import {} from './editor.scss';
	import { get } from 'svelte/store';
	import { dashArrays, MapLayerLine } from './lib/map_layer/line.js';

	const dashedList = Array.from(dashArrays.keys()).sort();

	const { style }: { style: MapLayerLine['style'] } = $props();

	let color = $state(get(style.color));
	let width = $state(get(style.width));
	let dashed = $state(get(style.dashed));

	$effect(() => style.color.set(color));
	$effect(() => style.width.set(width));
	$effect(() => style.dashed.set(dashed));
</script>

<div class="row">
	<label for="dashed-input">Dashed</label>
	<select id="dashed-input" bind:value={dashed}>
		{#each dashedList as d}
			<option value={d}>{d}</option>
		{/each}
	</select>

	<label for="color-input">Color</label>
	<input id="color-input" type="color" bind:value={color} />

	<label for="width-input">Width</label>
	<input id="width-input" type="range" min="0.5" max="5" step="0.5" bind:value={width} />
</div>
