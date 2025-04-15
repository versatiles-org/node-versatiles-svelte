<script lang="ts">
	import Editor from './Editor.svelte';
	import type { GeometryManager } from '../lib/geometry_manager.js';
	import SidebarPanel from './SidebarPanel.svelte';

	const { geometryManager, width }: { geometryManager: GeometryManager; width: number } = $props();

	let history = geometryManager.state;
	let undoEnabled = $state(geometryManager.state.undoEnabled);
	let redoEnabled = $state(geometryManager.state.redoEnabled);
	let activeElement = geometryManager.selectedElement;

	function importGeoJSON() {
		const input = document.createElement('input');
		input.type = 'file';
		input.onchange = (_) => {
			if (!input.files) return alert('No file selected.');
			const file = input.files[0];
			const reader = new FileReader();
			reader.onload = (evt) => {
				try {
					if (!evt.target) return alert('Failed to read file.');
					const json = JSON.parse(evt.target.result as string);
					geometryManager.addGeoJSON(json);
				} catch (error) {
					console.error(error);
					return alert('Failed to import GeoJSON. Please check the file format.');
				}
			};

			reader.onerror = () => alert('Failed to read file. Please try again.');

			reader.readAsText(file);
		};
		input.click();
	}

	function exportGeoJSON() {
		const geoJSON = geometryManager.getGeoJSON();
		const blob = new Blob([JSON.stringify(geoJSON)], { type: 'application/geo+json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.setAttribute('href', url);
		a.setAttribute('download', 'map.geojson');
		a.click();
		URL.revokeObjectURL(url);
	}

	function getLink() {
		const url = new URL(window.location.href);
		url.hash = geometryManager.state.getHash();
		return url.href;
	}

	function copyLink() {
		navigator.clipboard.writeText(getLink()).then(
			() => alert('Link copied to clipboard!'),
			() => alert('Failed to copy link. Please try again.')
		);
	}

	function copyEmbedCode() {
		const html = `<iframe style="width:100%; height:60vh" src="${getLink()}"></iframe>`;
		navigator.clipboard.writeText(html).then(
			() => alert('Embed code copied to clipboard!'),
			() => alert('Failed to copy embed code. Please try again.')
		);
	}
</script>

<div class="sidebar" style="width: {width}px;">
	<div style="margin-bottom: 36px;">
		<div class="flex flex-two">
			<button onclick={() => history.undo()} disabled={!$undoEnabled}>Undo</button>
			<button onclick={() => history.redo()} disabled={!$redoEnabled}>Redo</button>
		</div>
		<SidebarPanel title="Share map" open={false}>
			<div class="flex flex-one">
				<button value="Link" onclick={copyLink}>Link</button>
				<button onclick={copyEmbedCode}>Embed Code</button>
			</div>
		</SidebarPanel>
		<SidebarPanel title="Import/Export" open={false}>
			<div class="flex flex-one">
				<button onclick={importGeoJSON}>Import GeoJSON</button>
				<button onclick={exportGeoJSON}>Export GeoJSON</button>
			</div>
		</SidebarPanel>
		<SidebarPanel title="Add new">
			<div class="flex flex-two">
				<button onclick={() => activeElement.set(geometryManager.addNewMarker())}>Marker</button>
				<button onclick={() => activeElement.set(geometryManager.addNewLine())}>Line</button>
				<button onclick={() => activeElement.set(geometryManager.addNewPolygon())}>Polygon</button>
				<button disabled>Circle</button>
			</div>
		</SidebarPanel>
		<Editor element={$activeElement} />
		<SidebarPanel title="Actions" disabled={!$activeElement}>
			<div class="flex flex-two">
				<button onclick={() => $activeElement!.delete()}>Delete</button>
			</div>
		</SidebarPanel>
		<SidebarPanel title="Help" open={false}>
			Submit bugs and feature requests as
			<a
				id="github_link"
				href="https://github.com/versatiles-org/node-versatiles-svelte/issues"
				target="_blank"
				aria-label="Repository on GitHub">GitHub issues</a
			>
		</SidebarPanel>
	</div>
</div>

<style>
	.sidebar {
		--color-btn: #336680;
		--color-bg: #ffffff;
		--color-text: #000000;
		--gap: 10px;

		background-color: rgb(from var(--color-bg) r g b/ 0.7);
		backdrop-filter: blur(10px);
		box-sizing: border-box;
		color: var(--color-text);
		font-size: 0.8em;
		height: 100%;
		overflow-y: scroll;
		padding: var(--gap);
		position: absolute;
		right: 0;
		top: 0;
		width: 200px;

		.flex {
			--gap: 5px;
			align-items: center;
			display: flex;
			flex-wrap: wrap;
			gap: var(--gap);
			justify-content: space-between;
			margin: var(--gap) 0 var(--gap);
			width: 100%;
		}
		.flex-two button {
			flex-grow: 1;
			flex-basis: 0;
			width: 40%;
		}

		.flex-one button {
			width: 100%;
		}

		button {
			background-color: var(--color-btn);
			border: 2px solid var(--color-btn);
			border-radius: 0.2em;
			color: var(--color-bg);
			cursor: pointer;
			font-weight: 600;
			padding: 0.4em 1em;
			transition:
				background-color 0.1s ease-in-out,
				color 0.1s ease-in-out;

			&:not([disabled]):hover {
				background-color: var(--color-bg);
				color: var(--color-btn);
			}
			&:disabled {
				cursor: not-allowed;
				opacity: 0.5;
			}
		}
	}

	a {
		color: var(--fg-color);
	}
</style>
