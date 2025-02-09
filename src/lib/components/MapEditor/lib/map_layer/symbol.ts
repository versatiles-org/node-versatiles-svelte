import { derived, get, writable } from 'svelte/store';
import type { LayerSymbol } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';
import type { StateObject } from '../state/types.js';
import { defaultState } from '../state/index.js';

export const symbols = new Map<number, { name: string; image?: string; offset?: [number, number] }>(
	[
		[0, { name: 'none', image: undefined }],
		[1, { name: 'airplane', image: 'basics:icon-airfield' }],
		[2, { name: 'airport', image: 'basics:icon-airport' }],
		[3, { name: 'alcohol shop', image: 'basics:icon-alcohol_shop' }],
		[4, { name: 'art gallery', image: 'basics:icon-art_gallery' }],
		[5, { name: 'artwork', image: 'basics:icon-artwork' }],
		[6, { name: 'atm', image: 'basics:icon-atm' }],
		[7, { name: 'bakery', image: 'basics:icon-bakery' }],
		[8, { name: 'bank', image: 'basics:icon-bank' }],
		[9, { name: 'beauty', image: 'basics:icon-beauty' }],
		[10, { name: 'beer', image: 'basics:icon-beer' }],
		[11, { name: 'beergarden', image: 'basics:icon-beergarden' }],
		[12, { name: 'bench', image: 'basics:icon-bench' }],
		[13, { name: 'beverages', image: 'basics:icon-beverages' }],
		[14, { name: 'bicycle share', image: 'basics:icon-bicycle_share' }],
		[15, { name: 'books', image: 'basics:icon-books' }],
		[16, { name: 'bus', image: 'basics:icon-bus' }],
		[17, { name: 'butcher', image: 'basics:icon-butcher' }],
		[18, { name: 'cafe', image: 'basics:icon-cafe', offset: [2, 0] }],
		[19, { name: 'car rental', image: 'basics:icon-car_rental' }],
		[20, { name: 'car wash', image: 'basics:icon-car_wash' }],
		[21, { name: 'castle', image: 'basics:icon-castle' }],
		[22, { name: 'cemetery', image: 'basics:icon-cemetery' }],
		[23, { name: 'chalet', image: 'basics:icon-chalet' }],
		[24, { name: 'chemist', image: 'basics:icon-chemist' }],
		[25, { name: 'cinema', image: 'basics:icon-cinema' }],
		[26, { name: 'clothes', image: 'basics:icon-clothes' }],
		[27, { name: 'college', image: 'basics:icon-college' }],
		[28, { name: 'community', image: 'basics:icon-community' }],
		[29, { name: 'defibrillator', image: 'basics:icon-defibrillator' }],
		[30, { name: 'doctor', image: 'basics:icon-doctor' }],
		[31, { name: 'dog park', image: 'basics:icon-dog_park' }],
		[32, { name: 'doityourself', image: 'basics:icon-doityourself' }],
		[33, { name: 'drinking water', image: 'basics:icon-drinking_water' }],
		[34, { name: 'drycleaning', image: 'basics:icon-drycleaning' }],
		[35, { name: 'emergency phone', image: 'basics:icon-emergency_phone' }],
		[36, { name: 'fast food', image: 'basics:icon-fast_food' }],
		[37, { name: 'fire station', image: 'basics:icon-fire_station' }],
		[38, { name: 'flag', image: 'basics:icon-embassy', offset: [0, 0] }],
		[39, { name: 'florist', image: 'basics:icon-florist' }],
		[40, { name: 'fountain', image: 'basics:icon-fountain' }],
		[41, { name: 'furniture', image: 'basics:icon-furniture' }],
		[42, { name: 'garden centre', image: 'basics:icon-garden_centre' }],
		[43, { name: 'gift', image: 'basics:icon-gift' }],
		[44, { name: 'glasses', image: 'basics:icon-optician' }],
		[45, { name: 'golf', image: 'basics:icon-golf' }],
		[46, { name: 'greengrocer', image: 'basics:icon-greengrocer' }],
		[47, { name: 'hardware', image: 'basics:icon-hardware' }],
		[48, { name: 'hospital', image: 'basics:icon-hospital' }],
		[49, { name: 'huntingstand', image: 'basics:icon-huntingstand' }],
		[50, { name: 'hydrant', image: 'basics:icon-hydrant' }],
		[51, { name: 'icerink', image: 'basics:icon-icerink' }],
		[52, { name: 'information', image: 'basics:transport-information' }],
		[53, { name: 'jewelry store', image: 'basics:icon-jewelry_store' }],
		[54, { name: 'kiosk', image: 'basics:icon-kiosk' }],
		[55, { name: 'laundry', image: 'basics:icon-laundry' }],
		[56, { name: 'letter', image: 'basics:icon-post' }],
		[57, { name: 'library', image: 'basics:icon-library' }],
		[58, { name: 'lighthouse', image: 'basics:icon-lighthouse' }],
		[59, { name: 'marketplace', image: 'basics:icon-marketplace' }],
		[60, { name: 'money', image: 'basics:icon-bar' }],
		[61, { name: 'monument', image: 'basics:icon-monument' }],
		[62, { name: 'newsagent', image: 'basics:icon-newsagent' }],
		[63, { name: 'nightclub', image: 'basics:icon-nightclub' }],
		[64, { name: 'nursinghome', image: 'basics:icon-nursinghome' }],
		[65, { name: 'observation tower', image: 'basics:icon-observation_tower' }],
		[66, { name: 'outdoor', image: 'basics:icon-outdoor' }],
		[67, { name: 'pharmacy', image: 'basics:icon-pharmacy' }],
		[68, { name: 'picnic site', image: 'basics:icon-picnic_site' }],
		[69, { name: 'place of worship', image: 'basics:icon-place_of_worship' }],
		[70, { name: 'playground', image: 'basics:icon-playground' }],
		[71, { name: 'police', image: 'basics:icon-police', offset: [-1, -3] }],
		[72, { name: 'postbox', image: 'basics:icon-postbox' }],
		[73, { name: 'prison', image: 'basics:icon-prison' }],
		[74, { name: 'rail light', image: 'basics:icon-rail_light' }],
		[75, { name: 'rail metro', image: 'basics:icon-rail_metro' }],
		[76, { name: 'rail', image: 'basics:icon-rail' }],
		[77, { name: 'recycling', image: 'basics:icon-recycling' }],
		[78, { name: 'restaurant', image: 'basics:icon-restaurant' }],
		[79, { name: 'run', image: 'basics:icon-pitch' }],
		[80, { name: 'school', image: 'basics:icon-school' }],
		[81, { name: 'scissor', image: 'basics:icon-hairdresser' }],
		[82, { name: 'shield', image: 'basics:icon-historic', offset: [0, -10] }],
		[83, { name: 'shoes', image: 'basics:icon-shoes', offset: [-5, 0] }],
		[84, { name: 'shop', image: 'basics:icon-shop' }],
		[85, { name: 'shop', image: 'basics:icon-shop' }],
		[86, { name: 'shrine', image: 'basics:icon-shrine' }],
		[87, { name: 'sports', image: 'basics:icon-sports' }],
		[88, { name: 'stadium', image: 'basics:icon-stadium' }],
		[89, { name: 'stationery', image: 'basics:icon-stationery' }],
		[90, { name: 'surveillance', image: 'basics:icon-surveillance' }],
		[91, { name: 'swimming', image: 'basics:icon-swimming' }],
		[92, { name: 'telephone', image: 'basics:icon-telephone' }],
		[93, { name: 'theatre', image: 'basics:icon-theatre' }],
		[94, { name: 'toilet', image: 'basics:icon-toilet' }],
		[95, { name: 'tooth', image: 'basics:icon-dentist' }],
		[96, { name: 'town hall', image: 'basics:icon-town_hall' }],
		[97, { name: 'toys', image: 'basics:icon-toys' }],
		[98, { name: 'tram', image: 'basics:transport-tram' }],
		[99, { name: 'travel agent', image: 'basics:icon-travel_agent' }],
		[100, { name: 'vendingmachine', image: 'basics:icon-vendingmachine' }],
		[101, { name: 'veterinary', image: 'basics:icon-veterinary' }],
		[102, { name: 'video', image: 'basics:icon-video' }],
		[103, { name: 'viewpoint', image: 'basics:icon-viewpoint', offset: [0, -6] }],
		[104, { name: 'waste basket', image: 'basics:icon-waste_basket' }],
		[105, { name: 'watermill', image: 'basics:icon-watermill' }],
		[106, { name: 'waterpark', image: 'basics:icon-waterpark' }],
		[107, { name: 'windmill', image: 'basics:icon-windmill' }],
		[108, { name: 'zoo', image: 'basics:icon-zoo' }]
	]
);

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
				'text-optional': true,
				'text-offset': [0.7, 0.7],
				'text-variable-anchor': ['right', 'left', 'top', 'bottom']
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
			if (v.image == null) {
				this.updateLayout('icon-image', undefined);
				this.updateLayout('text-variable-anchor', ['center']);
			} else {
				this.updateLayout('icon-image', v.image);
				this.updateLayout('text-variable-anchor', ['right', 'left', 'top', 'bottom']);
				this.updateLayout('icon-offset', v.offset);
			}
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
