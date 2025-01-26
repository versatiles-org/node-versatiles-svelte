<!-- BBoxMap.svelte -->
<script lang="ts">
	import type {
		CameraOptions,
		Point,
		Map as MaplibreMapType,
		GeoJSONSource,
		LngLatBoundsLike
	} from 'maplibre-gl';
	import type { BBoxDrag } from './BBoxMap.js';
	import { onMount } from 'svelte';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import {
		dragBBox,
		getBBoxDrag,
		loadBBoxes,
		getBBoxGeometry,
		getCursor,
		BBoxPixel
	} from './BBoxMap.js';
	import AutoComplete from '$lib/components/AutoComplete.svelte';
	import { getCountryName } from '$lib/utils/location.js';
	import BasicMap from '../BasicMap/BasicMap.svelte';
	import { isDarkMode } from '$lib/utils/map_style.js';
	import type { BBox } from 'geojson';

	let bboxes: { key: string; value: BBox }[] | undefined = undefined;
	let mapContainer: HTMLDivElement;
	let autoComplete: AutoComplete<BBox> | undefined = undefined;
	const worldBBox: BBox = [-180, -85, 180, 85];
	const startTime = Date.now();
	export let selectedBBox: BBox = worldBBox;
	let map: MaplibreMapType; // Declare map instance at the top level

	onMount(async () => {
		bboxes = await loadBBoxes();
		start();
	});

	function handleMapReady(event: CustomEvent) {
		map = event.detail.map;
		map.setPadding({ top: 31 + 5, right: 5, bottom: 5, left: 5 });

		const canvas = map.getCanvasContainer();
		const bboxColor = isDarkMode(mapContainer) ? '#FFFFFF' : '#000000';

		map.on('load', () => {
			map.addSource('bbox', { type: 'geojson', data: getBBoxGeometry(selectedBBox) });
			map.addLayer({
				id: 'bbox-line',
				type: 'line',
				source: 'bbox',
				filter: ['==', '$type', 'LineString'],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': bboxColor, 'line-width': 0.5 }
			});
			map.addLayer({
				id: 'bbox-fill',
				type: 'fill',
				source: 'bbox',
				filter: ['==', '$type', 'Polygon'],
				paint: { 'fill-color': bboxColor, 'fill-opacity': 0.2 }
			});
		});

		function getDrag(point: Point): BBoxDrag {
			const bboxPixel = BBoxPixel.fromGeoBBox(map, selectedBBox);
			return getBBoxDrag(point, bboxPixel);
		}

		let lastDrag: BBoxDrag = false;
		let dragging = false;
		map.on('mousemove', (e) => {
			if (dragging) {
				if (e.originalEvent.buttons % 2) {
					const { drag, bbox } = dragBBox(selectedBBox, lastDrag, e.lngLat);
					lastDrag = drag;
					selectedBBox = bbox;
					redrawBBox();
					e.preventDefault();
				} else {
					dragging = false;
				}
			} else {
				const drag = getDrag(e.point);
				if (drag !== lastDrag) {
					lastDrag = drag;
					canvas.style.cursor = getCursor(drag) || 'grab';
				}
			}
		});

		map.on('mousedown', (e) => {
			if (e.originalEvent.buttons % 2) {
				const drag = getDrag(e.point);
				lastDrag = drag;
				if (drag) {
					dragging = true;
					e.preventDefault();
				}
			}
		});

		map.on('mouseup', () => (dragging = false));

		start();
	}

	function start() {
		if (!bboxes) return;
		if (!map) return;
		if (!autoComplete) return;
		autoComplete.setInputText(getCountryName() ?? ''); // Initial search text
	}

	function redrawBBox() {
		const bboxSource = map.getSource('bbox') as GeoJSONSource;
		bboxSource.setData(getBBoxGeometry(selectedBBox));
	}

	function flyTo(bbox: BBox) {
		selectedBBox = bbox ?? worldBBox;
		if (map) {
			if (map.getSource('bbox')) redrawBBox();

			const transform = map.cameraForBounds(selectedBBox as LngLatBoundsLike) as CameraOptions;
			if (transform == null) return;
			transform.zoom = transform.zoom ?? 0 - 0.5;
			transform.bearing = 0;
			transform.pitch = 0;

			if (Date.now() - startTime < 1000) {
				map.jumpTo(transform);
			} else {
				map.flyTo({ ...transform, essential: true, speed: 5 });
			}
		}
	}
</script>

<div class="container">
	{#if bboxes}
		<div class="input">
			<AutoComplete
				items={bboxes}
				placeholder="Find country, region or city …"
				on:change={(e) => flyTo(e.detail)}
				bind:this={autoComplete}
			/>
		</div>
	{/if}
	<BasicMap {map} bind:container={mapContainer} on:mapReady={handleMapReady}></BasicMap>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
	.input {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
		right: 0.5em;
		z-index: 10;
	}
</style>
