<script lang="ts">
	import type { AbstractElement } from '../lib/element/abstract.js';
	import EditorFill from './EditorFill.svelte';
	import EditorStroke from './EditorStroke.svelte';
	import EditorSymbol from './EditorSymbol.svelte';
	import { LineElement } from '../lib/element/line.js';
	import { MarkerElement } from '../lib/element/marker.js';
	import { PolygonElement } from '../lib/element/polygon.js';

	const { element }: { element: AbstractElement } = $props();
	let strokeVisible = $state(false);

	if (element instanceof PolygonElement) {
		element.strokeLayer.visible.subscribe((value) => (strokeVisible = value));
	}
</script>

{#if element instanceof MarkerElement}
	<h2>Symbol</h2>
	<EditorSymbol layer={element.layer} />
{/if}
{#if element instanceof LineElement}
	<h2>Stroke</h2>
	<EditorStroke layer={element.layer} />
{/if}
{#if element instanceof PolygonElement}
	<h2>Fill</h2>
	<EditorFill layer={element.fillLayer} />
	<h2>Stroke</h2>

	<div class="row-input">
		<label for="showStroke">Outline:</label>
		<input
			id="showStroke"
			type="checkbox"
			bind:checked={
				() => strokeVisible, (v) => (element as PolygonElement).strokeLayer.visible.set(v)
			}
		/>
	</div>

	{#if strokeVisible}
		<EditorStroke layer={element.strokeLayer} />
	{/if}
{/if}
{#if element instanceof PolygonElement || element instanceof LineElement}
	<h2>Shape</h2>
	<p>
		Drag points to move.<br />Drag a midpoint to add.<br />Shift-click to delete a point.
	</p>
{/if}
<h2>Actions</h2>
<input type="button" value="Delete" onclick={() => element!.delete()} />
