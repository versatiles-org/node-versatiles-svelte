import { derived, get, writable } from 'svelte/store';
import type { LayerSymbol } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';
import { defaultState } from '../state/index.js';

export const symbols = new Map<number, { name: string; image: string; offset?: [number, number] }>([
	[0, { name: 'airplane', image: 'basics:icon-airfield' }],
	[1, { name: 'airport', image: 'basics:icon-airport' }],
	[2, { name: 'alcohol shop', image: 'basics:icon-alcohol_shop' }],
	[3, { name: 'art gallery', image: 'basics:icon-art_gallery' }],
	[4, { name: 'artwork', image: 'basics:icon-artwork' }],
	[5, { name: 'atm', image: 'basics:icon-atm' }],
	[6, { name: 'bakery', image: 'basics:icon-bakery' }],
	[7, { name: 'bank', image: 'basics:icon-bank' }],
	[8, { name: 'beauty', image: 'basics:icon-beauty' }],
	[9, { name: 'beer', image: 'basics:icon-beer' }],
	[10, { name: 'beergarden', image: 'basics:icon-beergarden' }],
	[11, { name: 'bench', image: 'basics:icon-bench' }],
	[12, { name: 'beverages', image: 'basics:icon-beverages' }],
	[13, { name: 'bicycle share', image: 'basics:icon-bicycle_share' }],
	[14, { name: 'books', image: 'basics:icon-books' }],
	[15, { name: 'bus', image: 'basics:icon-bus' }],
	[16, { name: 'butcher', image: 'basics:icon-butcher' }],
	[17, { name: 'cafe', image: 'basics:icon-cafe', offset: [2, 0] }],
	[18, { name: 'car rental', image: 'basics:icon-car_rental' }],
	[19, { name: 'car wash', image: 'basics:icon-car_wash' }],
	[20, { name: 'castle', image: 'basics:icon-castle' }],
	[21, { name: 'cemetery', image: 'basics:icon-cemetery' }],
	[22, { name: 'chalet', image: 'basics:icon-chalet' }],
	[23, { name: 'chemist', image: 'basics:icon-chemist' }],
	[24, { name: 'cinema', image: 'basics:icon-cinema' }],
	[25, { name: 'clothes', image: 'basics:icon-clothes' }],
	[26, { name: 'college', image: 'basics:icon-college' }],
	[27, { name: 'community', image: 'basics:icon-community' }],
	[28, { name: 'defibrillator', image: 'basics:icon-defibrillator' }],
	[29, { name: 'doctor', image: 'basics:icon-doctor' }],
	[30, { name: 'dog park', image: 'basics:icon-dog_park' }],
	[31, { name: 'doityourself', image: 'basics:icon-doityourself' }],
	[32, { name: 'drinking water', image: 'basics:icon-drinking_water' }],
	[33, { name: 'drycleaning', image: 'basics:icon-drycleaning' }],
	[34, { name: 'emergency phone', image: 'basics:icon-emergency_phone' }],
	[35, { name: 'fast food', image: 'basics:icon-fast_food' }],
	[36, { name: 'fire station', image: 'basics:icon-fire_station' }],
	[37, { name: 'flag', image: 'basics:icon-embassy', offset: [7.5, -10] }],
	[38, { name: 'florist', image: 'basics:icon-florist' }],
	[39, { name: 'fountain', image: 'basics:icon-fountain' }],
	[40, { name: 'furniture', image: 'basics:icon-furniture' }],
	[41, { name: 'garden centre', image: 'basics:icon-garden_centre' }],
	[42, { name: 'gift', image: 'basics:icon-gift' }],
	[43, { name: 'glasses', image: 'basics:icon-optician' }],
	[44, { name: 'golf', image: 'basics:icon-golf' }],
	[45, { name: 'greengrocer', image: 'basics:icon-greengrocer' }],
	[46, { name: 'hardware', image: 'basics:icon-hardware' }],
	[47, { name: 'hospital', image: 'basics:icon-hospital' }],
	[48, { name: 'huntingstand', image: 'basics:icon-huntingstand' }],
	[49, { name: 'hydrant', image: 'basics:icon-hydrant' }],
	[50, { name: 'icerink', image: 'basics:icon-icerink' }],
	[51, { name: 'information', image: 'basics:transport-information' }],
	[52, { name: 'jewelry store', image: 'basics:icon-jewelry_store' }],
	[53, { name: 'kiosk', image: 'basics:icon-kiosk' }],
	[54, { name: 'laundry', image: 'basics:icon-laundry' }],
	[55, { name: 'letter', image: 'basics:icon-post' }],
	[56, { name: 'library', image: 'basics:icon-library' }],
	[57, { name: 'lighthouse', image: 'basics:icon-lighthouse' }],
	[58, { name: 'marketplace', image: 'basics:icon-marketplace' }],
	[59, { name: 'money', image: 'basics:icon-bar' }],
	[60, { name: 'monument', image: 'basics:icon-monument' }],
	[61, { name: 'newsagent', image: 'basics:icon-newsagent' }],
	[62, { name: 'nightclub', image: 'basics:icon-nightclub' }],
	[63, { name: 'nursinghome', image: 'basics:icon-nursinghome' }],
	[64, { name: 'observation tower', image: 'basics:icon-observation_tower' }],
	[65, { name: 'outdoor', image: 'basics:icon-outdoor' }],
	[66, { name: 'pharmacy', image: 'basics:icon-pharmacy' }],
	[67, { name: 'picnic site', image: 'basics:icon-picnic_site' }],
	[68, { name: 'place of worship', image: 'basics:icon-place_of_worship' }],
	[69, { name: 'playground', image: 'basics:icon-playground' }],
	[70, { name: 'police', image: 'basics:icon-police', offset: [-1, -3] }],
	[71, { name: 'postbox', image: 'basics:icon-postbox' }],
	[72, { name: 'prison', image: 'basics:icon-prison' }],
	[73, { name: 'rail light', image: 'basics:icon-rail_light' }],
	[74, { name: 'rail metro', image: 'basics:icon-rail_metro' }],
	[75, { name: 'rail', image: 'basics:icon-rail' }],
	[76, { name: 'recycling', image: 'basics:icon-recycling' }],
	[77, { name: 'restaurant', image: 'basics:icon-restaurant' }],
	[78, { name: 'run', image: 'basics:icon-pitch' }],
	[79, { name: 'school', image: 'basics:icon-school' }],
	[80, { name: 'scissor', image: 'basics:icon-hairdresser' }],
	[81, { name: 'shield', image: 'basics:icon-historic', offset: [0, -10] }],
	[82, { name: 'shoes', image: 'basics:icon-shoes', offset: [-5, 0] }],
	[83, { name: 'shop', image: 'basics:icon-shop' }],
	[84, { name: 'shop', image: 'basics:icon-shop' }],
const defaultStyle = {
	color: '#ff0000',
	rotate: 0,
	size: 1,
	halo: 1,
	pattern: 38,
	label: ''
};

function getSymbol(index: number): { name: string; image?: string; offset: [number, number] } {
	const symbol = symbols.get(index) ?? symbols.get(defaultStyle.pattern)!;
	return { ...symbol, offset: symbol.offset ?? [0, 0] };
}

export class MapLayerSymbol extends MapLayer<LayerSymbol> {
	color = writable(defaultStyle.color);
	halo = writable(defaultStyle.halo);
	rotate = writable(defaultStyle.rotate);
	size = writable(defaultStyle.size);
	symbolIndex = writable(defaultStyle.pattern);
	label = writable(defaultStyle.label);

	haloWidth = derived([this.halo, this.size], ([halo, size]) => halo * size);
	symbol = derived(this.symbolIndex, (index) => getSymbol(index));

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		this.addLayer(
			source,
			'symbol',
			{
				'icon-image': get(this.symbol).image,
				'icon-offset': get(this.symbol).offset,
				'icon-overlap': 'always',
				'icon-rotate': defaultStyle.rotate,
				'icon-size': defaultStyle.size,

				'text-field': defaultStyle.label,
				'text-font': ['noto_sans_regular'],
				'text-justify': 'left',
				'text-anchor': 'right',
				'text-offset': [-0.4, -0.6]
			},
			{
				'icon-color': defaultStyle.color,
				'icon-halo-blur': 0,
				'icon-halo-color': '#FFFFFF',
				'icon-halo-width': defaultStyle.halo,
				'icon-opacity': 1,
				'text-halo-blur': 0,
				'text-halo-color': '#FFFFFF',
				'text-halo-width': defaultStyle.halo
			}
		);

		this.color.subscribe((v) => this.updatePaint('icon-color', Color.parse(v)));
		this.haloWidth.subscribe((v) => {
			this.updatePaint('icon-halo-width', v);
			this.updatePaint('text-halo-width', v);
		});
		this.label.subscribe((v) => this.updateLayout('text-field', v));
		this.rotate.subscribe((v) => this.updateLayout('icon-rotate', v));
		this.size.subscribe((v) => {
			this.updateLayout('icon-size', v);
			this.updateLayout('text-size', v * 16);
		});
		this.symbol.subscribe((v) => {
			this.updateLayout('icon-image', v.image);
			this.updateLayout('icon-offset', v.offset);
		});
	}

	getState(): StateObject | undefined {
		return defaultState(
			{
				color: get(this.color),
				rotate: get(this.rotate),
				size: get(this.size),
				halo: get(this.halo),
				pattern: get(this.symbolIndex),
				label: get(this.label)
			},
			defaultStyle
		);
	}

	setState(state: StateObject) {
		if (state.color) this.color.set(state.color);
		if (state.rotate) this.rotate.set(state.rotate);
		if (state.size) this.size.set(state.size);
		if (state.halo) this.halo.set(state.halo);
		if (state.pattern) this.symbolIndex.set(state.pattern);
		if (state.label) this.label.set(state.label);
	}
}
