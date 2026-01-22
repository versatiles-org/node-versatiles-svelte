<script lang="ts">
	import { BBoxMap, type BBox } from '$lib/index.js';
	import { onMount } from 'svelte';

	let selectedBBox = $state<BBox | undefined>(undefined);

	export function setBBox(bbox: BBox) {
		selectedBBox = bbox as BBox;
	}

	onMount(() => {
		loadHash();
		addEventListener('hashchange', () => loadHash());

		function loadHash() {
			const hash = window.location.hash.replace('#', '');
			if (!hash) return;
			const parts = hash.split(',');
			if (parts.length !== 4) return;
			selectedBBox = parts.map((part) => parseFloat(part)) as BBox;
		}

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(window as any).setBBox = (bbox: BBox) => (selectedBBox = bbox);
	});
</script>

<div class="wrapper">
	<BBoxMap bind:selectedBBox onMapLoad={() => console.log('map_ready')} />
	<p style="display:none" class="hidden_result">{JSON.stringify(selectedBBox)}</p>
</div>
