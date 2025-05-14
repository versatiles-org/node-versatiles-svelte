<script lang="ts">
	const src =
		'/map-editor#FlFcU1RCXQyUhNExzxiEwxgqXoVwXyjHnBichRjOhTkBBjXhZBiMhJiSiDhYjZImR6ejPxWlCiqAAAAm2vxielvgqXEiqAABIz4RCgDLDPGJ7HGCpcSKoAAElbCDICAZDotMYhLcYKhyKDbAAZB6ExIqgAABZSKoAAAJTLHGIKHCCo6lKwwoqgAABiqAAAA';
</script>

<table>
	<tbody>
		<tr>
			<td><iframe title="square" style="width:600px;height:600px;" {src}></iframe></td>
			<td><iframe title="vertical" style="width:300px;height:600px;" {src}></iframe></td>
		</tr>
		<tr>
			<td><iframe title="horizontal" style="width:600px;height:300px;" {src}></iframe></td>
			<td></td>
		</tr>
	</tbody>
</table>

<style>
	:global(body) {
		margin: 0;
		padding: 0;
	}
	table {
		margin: 0 auto;
		border-collapse: collapse;
	}
	td {
		padding: 0;
		border: 1px solid #000;
	}
	iframe {
		border: 0;
		box-sizing: border-box;
		display: block;
	}
</style>
