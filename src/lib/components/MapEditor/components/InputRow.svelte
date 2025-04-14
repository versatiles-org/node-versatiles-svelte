<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, label, id }: { children: Snippet; label: string; id: string } = $props();
</script>

<div class="row">
	<label for={id}>{label}</label>
	{@render children()}
</div>

<style>
	.row {
		margin: var(--gap) 0 var(--gap);
		display: flex;
		justify-content: space-between;
		align-items: center;
		& > :global(label) {
			flex-grow: 0;
			opacity: 0.7;
			font-size: 0.8em;
		}
		& > :global(button),
		& > :global(input),
		& > :global(select) {
			box-sizing: border-box;
			width: 60%;
			flex-grow: 0;
		}
		& > :global(input[type='checkbox']) {
			width: auto;
		}
	}
</style>
