<script lang="ts">
	import { BBoxMap } from '$lib/index.js';
</script>

<div class="wrapper" style="color-scheme: light;">
	<h3>light mode</h3>
	<div><BBoxMap /></div>
</div>

<div class="wrapper" style="color-scheme: dark;">
	<h3>dark mode</h3>
	<div><BBoxMap /></div>
</div>

<style>
	.wrapper {
		background-color: light-dark(white, black);
		color: light-dark(black, white);
		padding: 1em;
		font-family: sans-serif;
		width: 90vw;
		box-sizing: border-box;
		margin: 1em 0;
	}
	h3 {
		margin: 0 0 1em 0;
		text-align: center;
	}
	.wrapper > div {
		height: 60vw;
	}
</style>
