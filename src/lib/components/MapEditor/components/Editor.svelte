<script lang="ts">
	import type { AbstractElement } from '../lib/element/abstract.js';
	import EditorFill from './EditorFill.svelte';
	import EditorStroke from './EditorStroke.svelte';
	import EditorSymbol from './EditorSymbol.svelte';
	import { LineElement } from '../lib/element/line.js';
	import { MarkerElement } from '../lib/element/marker.js';
	import { PolygonElement } from '../lib/element/polygon.js';
	import InputRow from './InputRow.svelte';
	import SidebarPanel from './SidebarPanel.svelte';
	import { writable } from 'svelte/store';
	import { CircleElement } from '../lib/element/circle.js';

	const { element }: { element: AbstractElement | undefined } = $props();

	const noElement = $derived(!element);
	const strokeVisible = $derived.by(() => {
		if (element instanceof PolygonElement || element instanceof CircleElement) return element.strokeLayer.visible;
		return writable(false);
	});
</script>

{#key element}
	<SidebarPanel title="Style" disabled={noElement}>
		<div class="style-editor">
			{#if element instanceof MarkerElement}
				<EditorSymbol layer={element.layer} />
			{/if}
			{#if element instanceof LineElement}
				<EditorStroke layer={element.layer} />
			{/if}
			{#if element instanceof PolygonElement || element instanceof CircleElement}
				<EditorFill layer={element.fillLayer} />
				<hr />

				<InputRow id="showStroke" label="Draw Outline">
					<input
						id="showStroke"
						type="checkbox"
						bind:checked={
							() => $strokeVisible,
							(visible) => {
								$strokeVisible = visible;
								element.manager.state?.log();
							}
						}
					/>
				</InputRow>

				{#if $strokeVisible}
					<EditorStroke layer={element.strokeLayer} />
				{/if}
			{/if}
			{#if element instanceof LineElement || element instanceof PolygonElement || element instanceof CircleElement}
				<hr />
				<p class="label" style="margin: 0.5em 0 1em;">
					Drag points to move.<br />Drag a midpoint to add.<br />Shift-click to delete a point.
				</p>
			{/if}
		</div>
	</SidebarPanel>
{/key}
