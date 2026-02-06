<script lang="ts">
	import type { CameraOptions, Map as MaplibreMapType } from 'maplibre-gl';
	import AutoComplete from './AutoComplete.svelte';
	import { getCountryName } from '$lib/utils/location.js';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	import { isDarkMode } from '$lib/utils/map_style.js';
	import { onDestroy } from 'svelte';
	import { loadBBoxes } from './BBoxMap.js';
	import { BBoxDrawer, isSameBBox, type BBox } from './lib/bbox_drawer.js';

	let {
		selectedBBox = $bindable(),
		onMapLoad
	}: {
		selectedBBox?: BBox;
		onMapLoad?: (map: MaplibreMapType, maplibre: typeof import('maplibre-gl')) => void;
	} = $props();

	const startTime = Date.now();
	let bboxDrawer: BBoxDrawer | undefined;
	let map: MaplibreMapType | undefined = $state();
	let bboxes: { key: string; value: BBox }[] | undefined = $state();
	let mapContainer: HTMLElement;
	let disableZoomTimeout: ReturnType<typeof setTimeout> | undefined;

	async function onMapInit(_map: MaplibreMapType) {
		map = _map;
		mapContainer = map.getContainer();
		map.setPadding({ top: 42, right: 10, bottom: 15, left: 10 });
		bboxes = await loadBBoxes();

		bboxDrawer = new BBoxDrawer(
			map!,
			selectedBBox ?? [-180, -85, 180, 85],
			isDarkMode(mapContainer) ? '#FFFFFF' : '#000000'
		);

		if (selectedBBox) {
			zoom();
		}

		bboxDrawer.on('dragEnd', (bbox) => {
			disableZoomTemporarily();
			if (!selectedBBox || !isSameBBox(bbox, selectedBBox)) {
				selectedBBox = bbox;
			}
		});
	}

	$effect(() => {
		if (!selectedBBox) return;
		zoom();
		if (bboxDrawer && selectedBBox) bboxDrawer.bbox = selectedBBox;
	});

	function zoom() {
		if (!bboxDrawer || !map || !selectedBBox) return;
		if (disableZoomTimeout) return;

		const transform = map.cameraForBounds(selectedBBox) as CameraOptions;
		if (transform == null) return;
		transform.zoom = (transform.zoom ?? 0) - 0.5;
		transform.bearing = 0;
		transform.pitch = 0;

		if (Date.now() - startTime < 3000) {
			map.jumpTo(transform);
		} else {
			map.flyTo({ ...transform, essential: true, speed: 5 });
		}
	}

	function getInitialInputText() {
		// When an initial bbox is supplied, we skip the country pre‑fill
		if (selectedBBox) {
			const area = (selectedBBox[2] - selectedBBox[0]) * (selectedBBox[3] - selectedBBox[1]);
			if (area < 60000) return '';
		}
		let query = getCountryName() ?? '';
		switch (query) {
			case 'France':
				query = 'France, métropolitaine';
				break;
		}
		return query;
	}

	function disableZoomTemporarily() {
		if (disableZoomTimeout) clearTimeout(disableZoomTimeout);
		disableZoomTimeout = setTimeout(() => (disableZoomTimeout = undefined), 100);
	}

	function selectVisibleArea() {
		if (!map) return;
		const bounds = map.getBounds();
		const round = (v: number) => Math.round(v * 1e3) / 1e3;
		selectedBBox = [
			round(bounds.getWest()),
			round(bounds.getSouth()),
			round(bounds.getEast()),
			round(bounds.getNorth())
		];
	}

	onDestroy(() => {
		bboxDrawer?.destroy();
	});
</script>

<div class="container">
	{#if bboxes}
		<div class="toolbar">
			<div class="input">
				<AutoComplete
					items={bboxes}
					placeholder="Find country, region or city …"
					change={(bbox) => (selectedBBox = bbox)}
					initialInputText={getInitialInputText()}
				/>
			</div>
			<button class="select-visible" onclick={selectVisibleArea} title="Use visible area as bounding box">
				<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M3 8V5a2 2 0 0 1 2-2h3" />
					<path d="M21 8V5a2 2 0 0 0-2-2h-3" />
					<path d="M3 16v3a2 2 0 0 0 2 2h3" />
					<path d="M21 16v3a2 2 0 0 1-2 2h-3" />
				</svg>
			</button>
		</div>
	{/if}
	<BasicMap {onMapInit} {onMapLoad}></BasicMap>
</div>

<style>
	.container {
		position: relative;
		width: 100%;
		height: 100%;
		left: 0;
		top: 0;
		min-height: 6em;
	}
	.toolbar {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
		right: 0.5em;
		z-index: 10;
		display: flex;
		gap: 0.3em;
		align-items: flex-start;
	}
	.input {
		flex: 1;
		min-width: 0;
	}
	.select-visible {
		flex-shrink: 0;
		padding: 0.25em;
		border: none;
		border-radius: 0.5em;
		background: color-mix(in srgb, var(--bg-color) 80%, transparent);
		color: var(--fg-color);
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		line-height: 0;
	}
	.select-visible:hover {
		background: color-mix(in srgb, var(--bg-color) 95%, transparent);
	}
</style>
