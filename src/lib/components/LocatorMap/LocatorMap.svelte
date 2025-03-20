<script lang="ts">
	import type { Map as MaplibreMapType, GeoJSONSource } from 'maplibre-gl';
	import BasicMap from '$lib/components/BasicMap/BasicMap.svelte';
	let map: MaplibreMapType;

	function onMapInit(_map: MaplibreMapType) {
		map = _map;
		map.on('load', async () => {
			let coordinates: [number, number] = [0, 0];
			const initialHash = parseHash();
			if (initialHash) {
				console.log('initialHash', initialHash);
				coordinates = [initialHash[1], initialHash[2]];
				map.setZoom(initialHash[0]);
				map.setCenter(coordinates);
			} else {
				map.on('move', () => {
					const { lng, lat } = map.getCenter();
					source.setData({
						type: 'Feature',
						geometry: { type: 'Point', coordinates: [lng, lat] },
						properties: {}
					});
				});
				map.on('moveend', () => updateHash());
			}

			map.addSource('marker', {
				type: 'geojson',
				data: { type: 'Feature', geometry: { type: 'Point', coordinates }, properties: {} }
			});

			const source = map.getSource('marker') as GeoJSONSource;

			map.addLayer({
				id: 'marker',
				source: 'marker',
				type: 'symbol',
				layout: {
					'icon-image': 'basics:icon-embassy',
					'icon-size': 1,
					'icon-overlap': 'always'
				},
				paint: {
					'icon-color': '#FF0000',
					'icon-halo-color': '#FFFFFF',
					'icon-halo-width': 1,
					'icon-halo-blur': 0
				}
			});

			function parseHash(): [number, number, number] | undefined {
				const hash = window.location.hash
					.replace(/[^0-9/.]+/g, '')
					.split('/')
					.map(parseFloat);
				return hash.length === 3 ? (hash as [number, number, number]) : undefined;
			}

			function updateHash() {
				const center = map.getCenter();
				const zoom = map.getZoom();
				window.location.hash = `#${zoom.toFixed(2)}/${center.lng.toFixed(6)}/${center.lat.toFixed(6)}`;
			}
		});
	}
</script>

<div class="container">
	<BasicMap {onMapInit}></BasicMap>
</div>

<style>
	.container {
		width: 100%;
		height: 100%;
		position: relative;
		min-height: 6em;
	}
</style>
