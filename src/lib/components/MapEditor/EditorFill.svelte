<script lang="ts">
	import { get } from 'svelte/store';
	import { fillPatterns, type MapLayerFill } from './lib/map_layer/fill.js';

	const patternIds = Array.from(fillPatterns.keys());

	const { style }: { style: MapLayerFill['style'] } = $props();

	let color = $state(get(style.color));
	let pattern = $state(get(style.pattern));
	let opacity = $state(get(style.opacity));

	$effect(() => style.color.set(color));
	$effect(() => style.pattern.set(pattern));
	$effect(() => style.opacity.set(opacity));
</script>

<div class="row-input">
	<label for="color">Color:</label>
	<input id="color" type="color" bind:value={color} />
</div>

<div class="row-input">
	<label for="pattern">Pattern:</label>
	<select id="pattern" bind:value={pattern}>
		{#each patternIds as d}
			<option value={d}>{d}</option>
		{/each}
	</select>
</div>

<div class="row-input">
	<label for="opacity">Opacity:</label>
	<input id="opacity" type="range" min="0" max="1" step="0.02" bind:value={opacity} />
</div>
