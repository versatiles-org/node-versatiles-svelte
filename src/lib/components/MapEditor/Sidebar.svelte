<script lang="ts">
	import EditorSymbol from './EditorSymbol.svelte';
	import EditorLine from './EditorStroke.svelte';
	import type { AbstractElement } from './lib/element/abstract.js';
	import { LineElement } from './lib/element/line.js';
	import { MarkerElement } from './lib/element/marker.js';
	import { PolygonElement } from './lib/element/polygon.js';
	import EditorFill from './EditorFill.svelte';
	import type { GeometryManager } from './lib/geometry_manager.js';

	const { geometryManager, width }: { geometryManager: GeometryManager; width: number } = $props();
	let elements = $state([]) as AbstractElement[];

	let activeElement: AbstractElement | undefined = $state(undefined);
	$effect(() => geometryManager.setActiveElement(activeElement));

	geometryManager.elements.subscribe((value) => (elements = value));
	geometryManager.activeElement.subscribe((value) => (activeElement = value));
</script>

<div class="sidebar" style="--gap: 10px;width: {width}px;">
	<div style="min-height: calc(100vh - 1.5em);">
		<hr />
		<div class="label">Add new:</div>
		<div class="row-flex">
			<input
				type="button"
				value="Marker"
				onclick={() => (activeElement = geometryManager.getNewMarker())}
			/>
			<input
				type="button"
				value="Line"
				onclick={() => (activeElement = geometryManager.getNewLine())}
			/>
			<input
				type="button"
				value="Polygon"
				onclick={() => (activeElement = geometryManager.getNewPolygon())}
			/>
		</div>
		<hr />
		<div class="row">
			<select
				size="5"
				style="width: 100%;"
				bind:value={
					() => elements.indexOf(activeElement!), (index) => (activeElement = elements[index])
				}
			>
				{#each elements as element, index}
					<option value={index}>{element.name}</option>
				{/each}
			</select>
		</div>
		{#if activeElement != null}
			<hr />

			{#if activeElement}
				<label for="input-name">Name:</label>
				<input
					id="input-name"
					type="text"
					bind:value={
						() => activeElement?.name,
						(value) => {
							if (activeElement) activeElement.name = value || '';
						}
					}
				/>
				{#if activeElement instanceof MarkerElement}
					<h2>Symbol</h2>
					<EditorSymbol style={activeElement.style} />
				{/if}
				{#if activeElement instanceof LineElement}
					<h2>Stroke</h2>
					<EditorLine style={activeElement.style} />
				{/if}
				{#if activeElement instanceof PolygonElement}
					<h2>Fill</h2>
					<EditorFill style={activeElement.fillStyle} />
					<h2>Stroke</h2>
					<EditorLine style={activeElement.strokeStyle} />
				{/if}
				{#if activeElement instanceof PolygonElement || activeElement instanceof LineElement}
					<h2>Shape</h2>
					<p>
						Drag points to move.<br />Drag a midpoint to add.<br />Shift-click to delete a point.
					</p>
				{/if}
				<h2>Actions</h2>
				<input type="button" value="Delete" onclick={() => activeElement!.delete()} />
			{/if}
		{/if}
	</div>
	<div class="footer">
		<a href="https://github.com/versatiles-org/node-versatiles-svelte" target="_blank"
			>Improve on GitHub</a
		>
	</div>
</div>

<style lang="scss">
	.sidebar {
		width: 200px;
		height: 100%;
		position: absolute;
		top: 0;
		right: 0;
		background-color: #eee;
		overflow-y: scroll;
		box-sizing: border-box;
		padding: 0 var(--gap);
		border-left: 0.5px solid rgba(0, 0, 0, 0.5);

		hr {
			border: none;
			border-top: 0.5px solid rgba(0, 0, 0, 1);
			margin: var(--gap) 0 var(--gap);
		}

		h2 {
			font-size: 0.9em;
			font-weight: normal;
			opacity: 0.5;
			padding-top: var(--gap);
			border-top: 0.5px solid rgba(0, 0, 0, 1);
			margin: var(--gap) 0 var(--gap);
			text-align: center;
		}

		:global(.row-flex) {
			margin-bottom: var(--gap);
			display: flex;
			justify-content: space-between;
			column-gap: var(--gap);
			:global(input) {
				flex-grow: 0;
			}
		}

		:global(.row-input) {
			margin: var(--gap) 0 var(--gap);
			display: flex;
			justify-content: space-between;
			align-items: center;
			:global(label) {
				flex-grow: 0;
			}
			:global(input),
			:global(select) {
				width: 60%;
				flex-grow: 0;
			}
		}

		:global(label),
		:global(.label) {
			opacity: 0.7;
			font-size: 0.8em;
		}

		:global(input),
		:global(select) {
			width: 100%;
			box-sizing: border-box;
			margin: 0;
		}

		p {
			font-size: 0.8em;
			opacity: 0.5;
			margin: 0.5em 0 1em;
		}

		.footer {
			text-align: right;
			font-size: 0.8em;
			a {
				color: #000;
				text-decoration: none;
				opacity: 0.3;
				&:hover {
					opacity: 1;
				}
			}
		}
	}
</style>
