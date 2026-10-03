import type * as maplibregl from 'maplibre-gl';

const entries: [number, string, string?, [number, number]?][] = [
	[0, 'none'],
	[1, 'airplane', 'base:icon-airfield'],
	[2, 'airport', 'base:icon-airport'],
	[3, 'alcohol shop', 'base:icon-alcohol_shop'],
	[4, 'art gallery', 'base:icon-art_gallery'],
	[5, 'artwork', 'base:icon-artwork'],
	[6, 'atm', 'base:icon-atm'],
	[7, 'bakery', 'base:icon-bakery'],
	[8, 'bank', 'base:icon-bank'],
	[9, 'beauty', 'base:icon-beauty'],
	[10, 'beer', 'base:icon-beer_mug'],
	[11, 'beergarden', 'base:icon-beer_mug'],
	[12, 'bench', 'base:icon-bench'],
	[13, 'beverages', 'base:icon-beverages'],
	[14, 'bicycle share', 'base:icon-bicycle_share'],
	[15, 'books', 'base:icon-books'],
	[16, 'bus', 'base:icon-bus'],
	[17, 'butcher', 'base:icon-butcher'],
	[18, 'cafe', 'base:icon-cafe', [2, 0]],
	[19, 'car rental', 'base:icon-car_rental'],
	[20, 'car wash', 'base:icon-car_wash'],
	[21, 'castle', 'base:icon-castle'],
	[22, 'cemetery', 'base:icon-cemetery'],
	[23, 'chalet', 'base:icon-chalet'],
	[24, 'chemist', 'base:icon-tube_and_toothbrush'],
	[25, 'cinema', 'base:icon-cinema'],
	[26, 'clothes', 'base:icon-clothes'],
	[27, 'college', 'base:icon-college'],
	[28, 'community', 'base:icon-community'],
	[29, 'defibrillator', 'base:icon-defibrillator'],
	[30, 'doctor', 'base:icon-doctor'],
	[31, 'dog park', 'base:icon-dog'],
	[32, 'doityourself', 'base:icon-do_it_yourself'],
	[33, 'drinking water', 'base:icon-drinking_water'],
	[34, 'drycleaning', 'base:icon-dry_cleaning'],
	[35, 'emergency phone', 'base:icon-emergency_phone'],
	[36, 'fast food', 'base:icon-fast_food'],
	[37, 'fire station', 'base:icon-fire_station'],
	[38, 'flag', 'base:icon-embassy', [0, 0]],
	[39, 'florist', 'base:icon-florist'],
	[40, 'fountain', 'base:icon-fountain'],
	[41, 'furniture', 'base:icon-furniture'],
	[42, 'garden centre', 'base:icon-garden_center'],
	[43, 'gift', 'base:icon-gift'],
	[44, 'glasses', 'base:icon-optician'],
	[45, 'golf', 'base:icon-golf'],
	[46, 'greengrocer', 'base:icon-greengrocer'],
	[47, 'hardware', 'base:icon-hardware'],
	[48, 'hospital', 'base:icon-hospital'],
	[49, 'huntingstand', 'base:icon-hunting_stand'],
	[50, 'hydrant', 'base:icon-hydrant'],
	[51, 'icerink', 'base:icon-ice_rink'],
	[52, 'information', 'base:transport-information'],
	[53, 'jewelry store', 'base:icon-ring'],
	[54, 'kiosk', 'base:icon-newspaper'],
	[55, 'laundry', 'base:icon-laundry'],
	[56, 'letter', 'base:icon-post'],
	[57, 'library', 'base:icon-library'],
	[58, 'lighthouse', 'base:icon-lighthouse'],
	[59, 'marketplace', 'base:icon-marketplace'],
	[60, 'money', 'base:icon-bar'],
	[61, 'monument', 'base:icon-monument'],
	[62, 'newsagent', 'base:icon-newsagent'],
	[63, 'nightclub', 'base:icon-nightclub'],
	[64, 'nursinghome', 'base:icon-nursing_home'],
	[65, 'observation tower', 'base:icon-observation_tower'],
	[66, 'outdoor', 'base:icon-outdoor'],
	[67, 'pharmacy', 'base:icon-pill'],
	[68, 'picnic site', 'base:icon-picnic_site'],
	[69, 'place of worship', 'base:icon-person_kneeling_and_praying'],
	[70, 'playground', 'base:icon-seesaw'],
	[71, 'police', 'base:icon-police_officer', [-1, -3]],
	[72, 'postbox', 'base:icon-postbox'],
	[73, 'prison', 'base:icon-prison'],
	[74, 'rail light', 'base:transport-tram'],
	[75, 'rail metro', 'base:icon-rail'],
	[76, 'rail', 'base:icon-rail'],
	[77, 'recycling', 'base:icon-recycling'],
	[78, 'restaurant', 'base:icon-restaurant'],
	[79, 'run', 'base:icon-pitch'],
	[80, 'school', 'base:icon-school'],
	[81, 'scissor', 'base:icon-scissors_and_comb'],
	[82, 'shield', 'base:icon-historic', [0, -10]],
	[83, 'shoes', 'base:icon-shoes', [-5, 0]],
	[84, 'shop', 'base:icon-shop'],
	[85, 'shrine', 'base:icon-shrine'],
	[87, 'sports', 'base:icon-sports'],
	[88, 'stadium', 'base:icon-stadium'],
	[89, 'stationery', 'base:icon-stationery'],
	[90, 'surveillance', 'base:icon-surveillance'],
	[91, 'swimming', 'base:icon-swimming'],
	[92, 'telephone', 'base:icon-telephone'],
	[93, 'theatre', 'base:icon-theater'],
	[94, 'toilet', 'base:icon-restrooms'],
	[95, 'tooth', 'base:icon-dentist'],
	[96, 'town hall', 'base:icon-town_hall'],
	[97, 'toys', 'base:icon-rocking_horse'],
	[98, 'tram', 'base:transport-tram'],
	[99, 'travel agent', 'base:icon-travel_agent'],
	[100, 'vendingmachine', 'base:icon-vending_machine'],
	[101, 'veterinary', 'base:icon-veterinary'],
	[102, 'video', 'base:icon-video'],
	[103, 'viewpoint', 'base:icon-viewpoint', [0, -6]],
	[104, 'waste basket', 'base:icon-waste_basket'],
	[105, 'watermill', 'base:icon-watermill'],
	[106, 'waterpark', 'base:icon-water_park'],
	[107, 'windmill', 'base:icon-windmill'],
	[108, 'zoo', 'base:icon-zoo']
];

export interface SymbolInfo {
	index: number;
	name: string;
	image?: string;
	offset?: [number, number];
	icon?: string;
}

const symbols = new Map<number, SymbolInfo>(
	entries.map(([index, name, image, offset]) => [index, { index, name, image, offset }])
);
const defaultSymbol = symbols.get(38)!;

export function getSymbol(index: number): SymbolInfo {
	return symbols.get(index) ?? defaultSymbol!;
}

export function getSymbolIndexByName(name: string): number | undefined {
	const entry = entries.find((entry) => entry[1] === name);
	return entry ? entry[0] : undefined;
}

export class SymbolLibrary {
	private map: maplibregl.Map;
	constructor(map: maplibregl.Map) {
		this.map = map;
	}

	getSymbol(index: number): SymbolInfo {
		return symbols.get(index) ?? defaultSymbol!;
	}

	drawSymbol(canvas: HTMLCanvasElement, index: number, halo = 0): void {
		const symbol = this.getSymbol(index);
		if (!symbol.image) return;

		const { sdf, data: imageDataSrc } = this.map.getImage(symbol.image);
		const { data: dataSrc, width: widthSrc, height: heightSrc } = imageDataSrc;

		const { width: widthDst, height: heightDst } = canvas;
		const scale = Math.min(widthDst / widthSrc, heightDst / heightSrc);
		const x0 = (widthDst - widthSrc * scale) / 2;
		const y0 = (heightDst - heightSrc * scale) / 2;

		const border = halo;

		const dataDst = new Uint8ClampedArray(widthDst * heightDst * 4);
		for (let yi = 0; yi < heightDst; yi++) {
			for (let xi = 0; xi < widthDst; xi++) {
				const x = (xi - x0) / scale;
				const y = (yi - y0) / scale;
				const i = (yi * widthDst + xi) * 4;

				if (sdf) {
					const v = (interpolate(x, y, 3) - 191) * 8 * scale;
					let alpha, color;
					if (halo) {
						color = Math.min(255, Math.max(0, 127.5 - v));
						alpha = Math.min(255, Math.max(0, 256 * border + v));
					} else {
						color = 0;
						alpha = Math.min(255, Math.max(0, v));
					}
					dataDst[i] = color;
					dataDst[i + 1] = color;
					dataDst[i + 2] = color;
					dataDst[i + 3] = alpha;
				} else {
					dataDst[i] = interpolate(x, y, 0);
					dataDst[i + 1] = interpolate(x, y, 1);
					dataDst[i + 2] = interpolate(x, y, 2);
					dataDst[i + 3] = interpolate(x, y, 3);
				}
			}
		}

		const ctx = canvas.getContext('2d')!;
		ctx.putImageData(new ImageData(dataDst, widthDst, heightDst), 0, 0);

		function interpolate(x: number, y: number, c: number): number {
			if (x < 0 || y < 0 || x >= widthSrc - 1 || y >= heightSrc - 1) return 0;
			const x0 = Math.floor(x);
			const y0 = Math.floor(y);
			const x1 = Math.ceil(x);
			const y1 = Math.ceil(y);
			const xa = (x - x0) / Math.max(1, x1 - x0);
			const ya = (y - y0) / Math.max(1, y1 - y0);
			const v00 = dataSrc[(y0 * widthSrc + x0) * 4 + c];
			const v01 = dataSrc[(y0 * widthSrc + x1) * 4 + c];
			const v10 = dataSrc[(y1 * widthSrc + x0) * 4 + c];
			const v11 = dataSrc[(y1 * widthSrc + x1) * 4 + c];
			const v0 = v00 * (1 - xa) + v01 * xa;
			const v1 = v10 * (1 - xa) + v11 * xa;
			return v0 * (1 - ya) + v1 * ya;
		}
	}

	asList(): SymbolInfo[] {
		return Array.from(symbols.values());
	}
}
