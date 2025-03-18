<script lang="ts">
	const baseUrl = 'https://versatiles.org/node-versatiles-svelte/screenshots/';
	const components = [
		{ title: 'BasicMap', slug: 'basic-map' },
		{ title: 'BBoxMap', slug: 'bbox-map' },
		{ title: 'LocatorMap', slug: 'locator-map' },
		{ title: 'MapEditor', slug: 'map-editor' }
	];
</script>

<div class="page">
	<h1>Welcome to VersaTiles SvelteKit library project</h1>
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
			{#each components as component (component.slug)}
				<tr>
					<th><a href={component.slug}>{component.title}</a></th>
					<td>
						<a href={component.slug}><img
							width="256"
							src="{baseUrl + component.slug}-light.png"
							alt="screenshot of {component.title} in light mode"
						/></a>
					</td>
					<td>
						<a href={component.slug}><img
							width="256"
							src="{baseUrl + component.slug}-dark.png"
							alt="screenshot of {component.title} in dark mode"
						/></a>
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
