<!-- BBoxMap.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { CameraOptions, Point, Map as MaplibreMapType } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { BBox, BBoxDrag } from './BBoxMap.js';
	import { dragBBox, getBBoxDrag, loadBBoxes, getBBoxGeometry, getCursor } from './BBoxMap.js';
	import AutoComplete from '$lib/components/AutoComplete.svelte';
	import { getMapStyle, isDarkMode } from '$lib/utils/style.js';
	import { getCountry } from '$lib/utils/location.js';

	let bboxes: { key: string; value: BBox }[] | undefined = undefined;
	let container: HTMLDivElement;
	const worldBBox: BBox = [-180, -85, 180, 85];
	const startTime = Date.now();
	export let selectedBBox: BBox = worldBBox;
	let map: MaplibreMapType; // Declare map instance at the top level
	let initialCountry: string = getCountry(); // Initial search text

	onMount(() => init());

	async function init() {
		let MaplibreMap: typeof MaplibreMapType | undefined = undefined;
		await Promise.all([
			(async () => (bboxes = await loadBBoxes()))(),
			(async () => (MaplibreMap = (await import('maplibre-gl')).Map))()
		]);
		if (MaplibreMap == null) throw Error();
		initMap(MaplibreMap);
	}

	function initMap(MaplibreMap: typeof MaplibreMapType) {
		const darkMode = isDarkMode(container);
		map = new MaplibreMap({
			container,
			style: getMapStyle(darkMode),
			bounds: selectedBBox,
			renderWorldCopies: false,
			dragRotate: false,
			attributionControl: { compact: false }
		});
		map.setPadding({ top: 31 + 5, right: 5, bottom: 5, left: 5 });

		const canvas = map.getCanvasContainer();

		map.on('load', () => {
			map.addSource('bbox', { type: 'geojson', data: getBBoxGeometry(selectedBBox) });
			map.addLayer({
				id: 'bbox-line',
				type: 'line',
				source: 'bbox',
				filter: ['==', '$type', 'LineString'],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': darkMode ? '#FFFFFF' : '#000000', 'line-width': 0.5 }
			});
			map.addLayer({
				id: 'bbox-fill',
				type: 'fill',
				source: 'bbox',
				filter: ['==', '$type', 'Polygon'],
				paint: { 'fill-color': darkMode ? '#FFFFFF' : '#000000', 'fill-opacity': 0.2 }
			});
		});

		function getDrag(point: Point): BBoxDrag {
			const { x: x0, y: y1 } = map.project([selectedBBox[0], selectedBBox[1]]);
			const { x: x1, y: y0 } = map.project([selectedBBox[2], selectedBBox[3]]);
			return getBBoxDrag(point, [x0, y0, x1, y1]);
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

		return () => map.remove();
	}

	function redrawBBox() {
		const bboxSource = map.getSource('bbox') as maplibregl.GeoJSONSource;
		bboxSource.setData(getBBoxGeometry(selectedBBox));
	}

	function flyTo(bbox: BBox) {
		selectedBBox = bbox ?? worldBBox;
		if (map) {
			if (map.getSource('bbox')) redrawBBox();

			const transform = map.cameraForBounds(selectedBBox) as CameraOptions;
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
				initialText={initialCountry}
				on:change={(e) => flyTo(e.detail)}
			/>
		</div>
	{/if}
	<div class="map" bind:this={container}></div>
</div>

<style>
	.container {
		--bg-color: var(--bboxmap-bg-color, light-dark(white, black));
		--fg-color: var(--bboxmap-text-color, light-dark(black, white));
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
	.map {
		position: absolute;
		top: 0px;
		left: 0px;
		bottom: 0px;
		right: 0px;
	}
	:global(.maplibregl-ctrl-attrib) {
		background-color: color-mix(in srgb, var(--bg-color) 50%, transparent) !important;
		color: var(--fg-color) !important;
		opacity: 0.5;
		font-size: 0.85em;
		padding: 0.1em !important;
		line-height: normal !important;
	}
	:global(.maplibregl-ctrl-attrib a) {
		color: var(--fg-color) !important;
	}
	.input {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
		right: 0.5em;
		z-index: 10;
	}
</style>
