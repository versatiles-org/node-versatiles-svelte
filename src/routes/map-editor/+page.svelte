<script lang="ts">
	import { MapEditor } from '$lib/index.js';
</script>

<div class="wrapper">
	<MapEditor onMapLoad={() => console.log('map_ready')} />
</div>
