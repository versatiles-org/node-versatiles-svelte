import { get, writable } from 'svelte/store';
import type { LayerSymbol } from './types.js';
import { MapLayer } from './abstract.js';
import { Color } from '@versatiles/style';
import type { GeometryManager } from '../geometry_manager.js';

export const symbols = new Map<string, { image: string; offset?: [number, number] }>([
	['airplane', { image: 'basics:icon-airfield' }],
	['airport', { image: 'basics:icon-airport' }],
	['alcohol shop', { image: 'basics:icon-alcohol_shop' }],
	['art gallery', { image: 'basics:icon-art_gallery' }],
	['artwork', { image: 'basics:icon-artwork' }],
	['atm', { image: 'basics:icon-atm' }],
	['bakery', { image: 'basics:icon-bakery' }],
	['bank', { image: 'basics:icon-bank' }],
	['beauty', { image: 'basics:icon-beauty' }],
	['beer', { image: 'basics:icon-beer' }],
	['beergarden', { image: 'basics:icon-beergarden' }],
	['bench', { image: 'basics:icon-bench' }],
	['beverages', { image: 'basics:icon-beverages' }],
	['bicycle share', { image: 'basics:icon-bicycle_share' }],
	['books', { image: 'basics:icon-books' }],
	['bus', { image: 'basics:icon-bus' }],
	['butcher', { image: 'basics:icon-butcher' }],
	['cafe', { image: 'basics:icon-cafe', offset: [2, 0] }],
	['car rental', { image: 'basics:icon-car_rental' }],
	['car wash', { image: 'basics:icon-car_wash' }],
	['castle', { image: 'basics:icon-castle' }],
	['cemetery', { image: 'basics:icon-cemetery' }],
	['chalet', { image: 'basics:icon-chalet' }],
	['chemist', { image: 'basics:icon-chemist' }],
	['cinema', { image: 'basics:icon-cinema' }],
	['clothes', { image: 'basics:icon-clothes' }],
	['college', { image: 'basics:icon-college' }],
	['community', { image: 'basics:icon-community' }],
	['defibrillator', { image: 'basics:icon-defibrillator' }],
	['doctor', { image: 'basics:icon-doctor' }],
	['dog park', { image: 'basics:icon-dog_park' }],
	['doityourself', { image: 'basics:icon-doityourself' }],
	['drinking water', { image: 'basics:icon-drinking_water' }],
	['drycleaning', { image: 'basics:icon-drycleaning' }],
	['emergency phone', { image: 'basics:icon-emergency_phone' }],
	['fast food', { image: 'basics:icon-fast_food' }],
	['fire station', { image: 'basics:icon-fire_station' }],
	['flag', { image: 'basics:icon-embassy', offset: [7.5, -10] }],
	['florist', { image: 'basics:icon-florist' }],
	['fountain', { image: 'basics:icon-fountain' }],
	['furniture', { image: 'basics:icon-furniture' }],
	['garden centre', { image: 'basics:icon-garden_centre' }],
	['gift', { image: 'basics:icon-gift' }],
	['glasses', { image: 'basics:icon-optician' }],
	['golf', { image: 'basics:icon-golf' }],
	['greengrocer', { image: 'basics:icon-greengrocer' }],
	['hardware', { image: 'basics:icon-hardware' }],
	['hospital', { image: 'basics:icon-hospital' }],
	['huntingstand', { image: 'basics:icon-huntingstand' }],
	['hydrant', { image: 'basics:icon-hydrant' }],
	['icerink', { image: 'basics:icon-icerink' }],
	['information', { image: 'basics:transport-information' }],
	['jewelry store', { image: 'basics:icon-jewelry_store' }],
	['kiosk', { image: 'basics:icon-kiosk' }],
	['laundry', { image: 'basics:icon-laundry' }],
	['letter', { image: 'basics:icon-post' }],
	['library', { image: 'basics:icon-library' }],
	['lighthouse', { image: 'basics:icon-lighthouse' }],
	['marketplace', { image: 'basics:icon-marketplace' }],
	['money', { image: 'basics:icon-bar' }],
	['monument', { image: 'basics:icon-monument' }],
	['newsagent', { image: 'basics:icon-newsagent' }],
	['nightclub', { image: 'basics:icon-nightclub' }],
	['nursinghome', { image: 'basics:icon-nursinghome' }],
	['observation tower', { image: 'basics:icon-observation_tower' }],
	['outdoor', { image: 'basics:icon-outdoor' }],
	['pharmacy', { image: 'basics:icon-pharmacy' }],
	['picnic site', { image: 'basics:icon-picnic_site' }],
	['place of worship', { image: 'basics:icon-place_of_worship' }],
	['playground', { image: 'basics:icon-playground' }],
	['police', { image: 'basics:icon-police', offset: [-1, -3] }],
	['postbox', { image: 'basics:icon-postbox' }],
	['prison', { image: 'basics:icon-prison' }],
	['rail light', { image: 'basics:icon-rail_light' }],
	['rail metro', { image: 'basics:icon-rail_metro' }],
	['rail', { image: 'basics:icon-rail' }],
	['recycling', { image: 'basics:icon-recycling' }],
	['restaurant', { image: 'basics:icon-restaurant' }],
	['run', { image: 'basics:icon-pitch' }],
	['school', { image: 'basics:icon-school' }],
	['scissor', { image: 'basics:icon-hairdresser' }],
	['shield', { image: 'basics:icon-historic', offset: [0, -10] }],
	['shoes', { image: 'basics:icon-shoes', offset: [-5, 0] }],
	['shop', { image: 'basics:icon-shop' }],
	['shop', { image: 'basics:icon-shop' }],
	['shrine', { image: 'basics:icon-shrine' }],
	['sports', { image: 'basics:icon-sports' }],
	['stadium', { image: 'basics:icon-stadium' }],
	['stationery', { image: 'basics:icon-stationery' }],
	['surveillance', { image: 'basics:icon-surveillance' }],
	['swimming', { image: 'basics:icon-swimming' }],
	['telephone', { image: 'basics:icon-telephone' }],
	['theatre', { image: 'basics:icon-theatre' }],
	['toilet', { image: 'basics:icon-toilet' }],
	['tooth', { image: 'basics:icon-dentist' }],
	['town hall', { image: 'basics:icon-town_hall' }],
	['toys', { image: 'basics:icon-toys' }],
	['tram', { image: 'basics:transport-tram' }],
	['travel agent', { image: 'basics:icon-travel_agent' }],
	['vendingmachine', { image: 'basics:icon-vendingmachine' }],
	['veterinary', { image: 'basics:icon-veterinary' }],
	['video', { image: 'basics:icon-video' }],
	['viewpoint', { image: 'basics:icon-viewpoint', offset: [0, -6] }],
	['waste basket', { image: 'basics:icon-waste_basket' }],
	['watermill', { image: 'basics:icon-watermill' }],
	['waterpark', { image: 'basics:icon-waterpark' }],
	['windmill', { image: 'basics:icon-windmill' }],
	['zoo', { image: 'basics:icon-zoo' }]
]);

export class MapLayerSymbol extends MapLayer<LayerSymbol> {
	public readonly style = {
		color: writable('#ff0000'),
		halo: writable(1),
		rotate: writable(0),
		size: writable(1),
		symbol: writable('flag'),
		label: writable('')
	};

	constructor(manager: GeometryManager, id: string, source: string) {
		super(manager, id);

		const getSymbol = (): { image: string; offset: [number, number] } => {
			const entry = symbols.get(get(this.style.symbol)) ?? symbols.get('flag')!;
			return { image: entry.image, offset: entry.offset ?? [0, 0] };
		};

		this.addLayer(
			source,
			'symbol',
			{
				'icon-image': getSymbol().image,
				'icon-offset': getSymbol().offset,
				'icon-overlap': 'always',
				'icon-rotate': get(this.style.rotate),
				'icon-size': get(this.style.size),
				'text-field': get(this.style.label),
				'text-font': ['noto_sans_regular'],
				'text-justify': 'left',
				'text-anchor': 'right',
				'text-offset': [-0.4, -0.6]
			},
			{
				'icon-color': Color.parse(get(this.style.color)).asString(),
				'icon-halo-blur': 0,
				'icon-halo-color': '#FFFFFF',
				'icon-halo-width': get(this.style.halo) * get(this.style.size),
				'icon-opacity': 1,
				'text-halo-blur': 0,
				'text-halo-color': '#FFFFFF',
				'text-halo-width': get(this.style.halo) * get(this.style.size)
			}
		);

		this.style.color.subscribe((value) => this.updatePaint('icon-color', Color.parse(value)));
		this.style.halo.subscribe((value) => {
			this.updatePaint('icon-halo-width', value * get(this.style.size));
			this.updatePaint('text-halo-width', value * get(this.style.size));
		});
		this.style.label.subscribe((value) => this.updateLayout('text-field', value));
		this.style.rotate.subscribe((value) => this.updateLayout('icon-rotate', value));
		this.style.size.subscribe((value) => {
			this.updateLayout('icon-size', value);
			this.updatePaint('icon-halo-width', value * get(this.style.halo));
			this.updateLayout('text-size', value * 16);
			this.updatePaint('text-halo-width', value * get(this.style.halo));
		});
		this.style.symbol.subscribe(() => {
			const symbol = getSymbol();
			this.updateLayout('icon-image', symbol.image);
			this.updateLayout('icon-offset', symbol.offset);
		});
	}
}
