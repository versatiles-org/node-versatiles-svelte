<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Pathname } from '$app/types';

	const baseUrl = 'https://versatiles.org/node-versatiles-svelte/screenshots/';
	const components: { title: string; path: Pathname }[] = [
		{ title: 'BasicMap', path: '/basic-map' },
		{ title: 'BBoxMap', path: '/bbox-map' },
		{ title: 'LocatorMap', path: '/locator-map' },
		{ title: 'MapEditor', path: '/map-editor' }
	];
</script>

<div class="page">
	<h1>Welcome to VersaTiles Svelte library project</h1>
	<p>Available components:</p>

	<table style="margin: 5em auto 1em;">
		<thead>
			<tr>
				<th>Name</th>
				<th>Light Mode</th>
				<th>Dark Mode</th>
			</tr>
		</thead>
		<tbody>
			{#each components as component (component.path)}
				<tr>
					<th><a href={resolve(component.path)}>{component.title}</a></th>
					<td>
						<a href={resolve(component.path)}
							><img
								width="256"
								src="{baseUrl + component.path}-light.png"
								alt="screenshot of {component.title} in light mode"
							/></a
						>
					</td>
					<td>
						<a href={resolve(component.path)}
							><img
								width="256"
								src="{baseUrl + component.path}-dark.png"
								alt="screenshot of {component.title} in dark mode"
							/></a
						>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

<style>
	.page {
		font-family: sans-serif;
		padding: 20px;
	}
	h1,
	p {
		text-align: center;
		font-size: larger;
		line-height: 1.3em;
	}
	a {
		color: inherit;
	}
</style>
