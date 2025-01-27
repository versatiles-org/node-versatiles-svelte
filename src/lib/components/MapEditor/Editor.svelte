<script lang="ts">
	import type { MarkerDrawer } from '$lib/utils/draw/marker.js';

	let { element = $bindable() }: { element: MarkerDrawer | null } = $props();

	$effect(() => {
		console.log(element);
	});
</script>
