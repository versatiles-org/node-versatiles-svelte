<!-- BBoxMap.svelte -->
<script lang="ts">
	import { onMount } from 'svelte';
	import maplibregl, { type Point } from 'maplibre-gl';
	import 'maplibre-gl/dist/maplibre-gl.css';
	import type { BBox, BBoxDrag } from './BBoxMap.js';
	import { dragBBox, getBBoxDrag, getBBoxGeometry, getCursor, loadBBoxes } from './BBoxMap.js';
	import AutoComplete from '$lib/AutoComplete/AutoComplete.svelte';

	let bboxes: { key: string; value: BBox }[];
	let container: HTMLDivElement;
	const worldBBox: BBox = [-180, -85, 180, 85];
	export let selectedBBox: BBox = worldBBox;
	let map: maplibregl.Map; // Declare map instance at the top level
	let initialCountry: string = ''; // Initial search text

	onMount(() => {
		// Fetch country from timezone
		try {
			const locale = Intl.DateTimeFormat().resolvedOptions().locale;
			const region = new Intl.DisplayNames([locale], { type: 'region' });
			const country = region.of(locale.split('-')[1]);
			initialCountry = country || '';
		} catch (error) {
			console.error('Could not determine country from timezone:', error);
			initialCountry = ''; // Fallback if no country can be determined
		}

		map = new maplibregl.Map({
			container,
			style: 'https://tiles.versatiles.org/assets/styles/colorful.json',
			bounds: selectedBBox,
			renderWorldCopies: false,
			dragRotate: false,
			attributionControl: { compact: false }
		});

		const canvas = map.getCanvasContainer();

		map.on('load', () => {
			map.addSource('bbox', { type: 'geojson', data: getBBoxGeometry(selectedBBox) });
			map.addLayer({
				id: 'bbox-line',
				type: 'line',
				source: 'bbox',
				filter: ['==', '$type', 'LineString'],
				layout: { 'line-cap': 'round', 'line-join': 'round' },
				paint: { 'line-color': '#000000', 'line-width': 0.5 }
			});
			map.addLayer({
				id: 'bbox-fill',
				type: 'fill',
				source: 'bbox',
				filter: ['==', '$type', 'Polygon'],
				paint: { 'fill-color': '#000000', 'fill-opacity': 0.2 }
			});

			loadBBoxes((entries) => {
				bboxes = entries;
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
	});

	function redrawBBox() {
		const bboxSource = map.getSource('bbox') as maplibregl.GeoJSONSource;
		bboxSource.setData(getBBoxGeometry(selectedBBox));
	}

	function flyTo(bbox: BBox) {
		selectedBBox = bbox ?? worldBBox;
		console.log(selectedBBox);
		if (map && map.getSource('bbox')) {
			redrawBBox();

			const transform = map.cameraForBounds(selectedBBox);
			if (transform == null) return;
			transform.zoom = transform.zoom ?? 0 - 0.5;
			
			map.flyTo({
				...transform,
				essential: true,
				speed: 5,
				bearing: 0,
				pitch: 0
			});
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
		width: 100%;
		height: 100%;
		position: relative;
	}
	.map {
		position: absolute;
		top: 0px;
		left: 0px;
		bottom: 0px;
		right: 0px;
	}
	:global(.maplibregl-ctrl-attrib) {
		background: none;
		color: #000 !important;
		opacity: 0.5;
	}
	.input {
		position: absolute;
		top: 0.5em;
		left: 0.5em;
		right: 0.5em;
		z-index: 10;
	}
</style>
