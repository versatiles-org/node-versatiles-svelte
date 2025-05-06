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
