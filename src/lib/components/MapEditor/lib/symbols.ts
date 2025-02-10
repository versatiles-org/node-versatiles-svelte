const entries: [number, string, string?, [number, number]?][] = [
	[0, 'none'],
	[1, 'airplane', 'basics:icon-airfield'],
	[2, 'airport', 'basics:icon-airport'],
	[3, 'alcohol shop', 'basics:icon-alcohol_shop'],
	[4, 'art gallery', 'basics:icon-art_gallery'],
	[5, 'artwork', 'basics:icon-artwork'],
	[6, 'atm', 'basics:icon-atm'],
	[7, 'bakery', 'basics:icon-bakery'],
	[8, 'bank', 'basics:icon-bank'],
	[9, 'beauty', 'basics:icon-beauty'],
	[10, 'beer', 'basics:icon-beer'],
	[11, 'beergarden', 'basics:icon-beergarden'],
	[12, 'bench', 'basics:icon-bench'],
	[13, 'beverages', 'basics:icon-beverages'],
	[14, 'bicycle share', 'basics:icon-bicycle_share'],
	[15, 'books', 'basics:icon-books'],
	[16, 'bus', 'basics:icon-bus'],
	[17, 'butcher', 'basics:icon-butcher'],
	[18, 'cafe', 'basics:icon-cafe', [2, 0]],
	[19, 'car rental', 'basics:icon-car_rental'],
	[20, 'car wash', 'basics:icon-car_wash'],
	[21, 'castle', 'basics:icon-castle'],
	[22, 'cemetery', 'basics:icon-cemetery'],
	[23, 'chalet', 'basics:icon-chalet'],
	[24, 'chemist', 'basics:icon-chemist'],
	[25, 'cinema', 'basics:icon-cinema'],
	[26, 'clothes', 'basics:icon-clothes'],
	[27, 'college', 'basics:icon-college'],
	[28, 'community', 'basics:icon-community'],
	[29, 'defibrillator', 'basics:icon-defibrillator'],
	[30, 'doctor', 'basics:icon-doctor'],
	[31, 'dog park', 'basics:icon-dog_park'],
	[32, 'doityourself', 'basics:icon-doityourself'],
	[33, 'drinking water', 'basics:icon-drinking_water'],
	[34, 'drycleaning', 'basics:icon-drycleaning'],
	[35, 'emergency phone', 'basics:icon-emergency_phone'],
	[36, 'fast food', 'basics:icon-fast_food'],
	[37, 'fire station', 'basics:icon-fire_station'],
	[38, 'flag', 'basics:icon-embassy', [0, 0]],
	[39, 'florist', 'basics:icon-florist'],
	[40, 'fountain', 'basics:icon-fountain'],
	[41, 'furniture', 'basics:icon-furniture'],
	[42, 'garden centre', 'basics:icon-garden_centre'],
	[43, 'gift', 'basics:icon-gift'],
	[44, 'glasses', 'basics:icon-optician'],
	[45, 'golf', 'basics:icon-golf'],
	[46, 'greengrocer', 'basics:icon-greengrocer'],
	[47, 'hardware', 'basics:icon-hardware'],
	[48, 'hospital', 'basics:icon-hospital'],
	[49, 'huntingstand', 'basics:icon-huntingstand'],
	[50, 'hydrant', 'basics:icon-hydrant'],
	[51, 'icerink', 'basics:icon-icerink'],
	[52, 'information', 'basics:transport-information'],
	[53, 'jewelry store', 'basics:icon-jewelry_store'],
	[54, 'kiosk', 'basics:icon-kiosk'],
	[55, 'laundry', 'basics:icon-laundry'],
	[56, 'letter', 'basics:icon-post'],
	[57, 'library', 'basics:icon-library'],
	[58, 'lighthouse', 'basics:icon-lighthouse'],
	[59, 'marketplace', 'basics:icon-marketplace'],
	[60, 'money', 'basics:icon-bar'],
	[61, 'monument', 'basics:icon-monument'],
	[62, 'newsagent', 'basics:icon-newsagent'],
	[63, 'nightclub', 'basics:icon-nightclub'],
	[64, 'nursinghome', 'basics:icon-nursinghome'],
	[65, 'observation tower', 'basics:icon-observation_tower'],
	[66, 'outdoor', 'basics:icon-outdoor'],
	[67, 'pharmacy', 'basics:icon-pharmacy'],
	[68, 'picnic site', 'basics:icon-picnic_site'],
	[69, 'place of worship', 'basics:icon-place_of_worship'],
	[70, 'playground', 'basics:icon-playground'],
	[71, 'police', 'basics:icon-police', [-1, -3]],
	[72, 'postbox', 'basics:icon-postbox'],
	[73, 'prison', 'basics:icon-prison'],
	[74, 'rail light', 'basics:icon-rail_light'],
	[75, 'rail metro', 'basics:icon-rail_metro'],
	[76, 'rail', 'basics:icon-rail'],
	[77, 'recycling', 'basics:icon-recycling'],
	[78, 'restaurant', 'basics:icon-restaurant'],
	[79, 'run', 'basics:icon-pitch'],
	[80, 'school', 'basics:icon-school'],
	[81, 'scissor', 'basics:icon-hairdresser'],
	[82, 'shield', 'basics:icon-historic', [0, -10]],
	[83, 'shoes', 'basics:icon-shoes', [-5, 0]],
	[84, 'shop', 'basics:icon-shop'],
	[85, 'shop', 'basics:icon-shop'],
	[86, 'shrine', 'basics:icon-shrine'],
	[87, 'sports', 'basics:icon-sports'],
	[88, 'stadium', 'basics:icon-stadium'],
	[89, 'stationery', 'basics:icon-stationery'],
	[90, 'surveillance', 'basics:icon-surveillance'],
	[91, 'swimming', 'basics:icon-swimming'],
	[92, 'telephone', 'basics:icon-telephone'],
	[93, 'theatre', 'basics:icon-theatre'],
	[94, 'toilet', 'basics:icon-toilet'],
	[95, 'tooth', 'basics:icon-dentist'],
	[96, 'town hall', 'basics:icon-town_hall'],
	[97, 'toys', 'basics:icon-toys'],
	[98, 'tram', 'basics:transport-tram'],
	[99, 'travel agent', 'basics:icon-travel_agent'],
	[100, 'vendingmachine', 'basics:icon-vendingmachine'],
	[101, 'veterinary', 'basics:icon-veterinary'],
	[102, 'video', 'basics:icon-video'],
	[103, 'viewpoint', 'basics:icon-viewpoint', [0, -6]],
	[104, 'waste basket', 'basics:icon-waste_basket'],
	[105, 'watermill', 'basics:icon-watermill'],
	[106, 'waterpark', 'basics:icon-waterpark'],
	[107, 'windmill', 'basics:icon-windmill'],
	[108, 'zoo', 'basics:icon-zoo']
];

interface Symbol {
	index: number;
	name: string;
	image?: string;
	offset?: [number, number];
	icon?: string;
}

const symbols = new Map<number, Symbol>(
	entries.map(([index, name, image, offset]) => [index, { index, name, image, offset }])
);
const defaultSymbol = symbols.get(38)!;

export function getSymbol(index: number): Symbol {
	return symbols.get(index) ?? defaultSymbol!;
}

export class SymbolLibrary {
	private map: maplibregl.Map;
	constructor(map: maplibregl.Map) {
		this.map = map;
	}
	getSymbol(index: number): Symbol {
		return symbols.get(index) ?? defaultSymbol!;
	}
	drawSymbol(canvas: HTMLCanvasElement, index: number, halo = false): void {
		const symbol = this.getSymbol(index);
		if (!symbol.image) return;

		const { sdf, data: imageData0 } = this.map.getImage(symbol.image);
		const { data: data0, width: width0, height: height0 } = imageData0;

		const { width: width1, height: height1 } = canvas;

		const data1 = new Uint8ClampedArray(width1 * height1 * 4);
		for (let y1 = 0; y1 < height1; y1++) {
			const y0 = Math.floor((y1 / height1) * height0);
			for (let x1 = 0; x1 < width1; x1++) {
				const x0 = Math.floor((x1 / width1) * width0);

				const i0 = (y0 * width0 + x0) * 4;
				const i1 = (y1 * width1 + x1) * 4;

				if (sdf) {
					const v = (data0[i0 + 3] - 191) * 16;
					let a, b;
					if (halo) {
						b = Math.min(255, Math.max(0, 255 - v));
						a = Math.min(255, Math.max(0, 256 * 6 + v));
					} else {
						b = 0;
						a = Math.min(255, Math.max(0, v));
					}
					data1[i1] = b;
					data1[i1 + 1] = b;
					data1[i1 + 2] = b;
					data1[i1 + 3] = a;
				} else {
					data1[i1] = data0[i0];
					data1[i1 + 1] = data0[i0 + 1];
					data1[i1 + 2] = data0[i0 + 2];
					data1[i1 + 3] = data0[i0 + 3];
				}
			}
		}

		const ctx = canvas.getContext('2d')!;
		ctx.putImageData(new ImageData(data1, width1, height1), 0, 0);
	}
	asList(): Symbol[] {
		return Array.from(symbols.values());
	}
}
