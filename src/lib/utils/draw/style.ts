import { Color } from '@versatiles/style';
import type { FillLayerSpecification, LineLayerSpecification } from 'maplibre-gl';

export type FillLayerPaint = FillLayerSpecification['paint'];
export type LineLayerPaint = LineLayerSpecification['paint'];

export interface FillStyle {
	color?: string;
	fillColor?: string;
}

export interface LineStyle {
	color?: string;
	lineColor?: string;
}

export function getFillStyle(style?: FillStyle): FillLayerPaint {
	const result: FillLayerPaint = {};
	if (style) {
		if (style.fillColor) {
			result['fill-color'] = Color.parse(style.fillColor).asString();
		} else if (style.color) {
			result['fill-color'] = Color.parse(style.color).fade(0.8).asString();
		}
	}
	return result;
}

export function getLineStyle(style?: LineStyle): LineLayerPaint {
	const result: LineLayerPaint = {};
	if (style) {
		const color = style.lineColor ?? style.color;
		if (color) result['line-color'] = Color.parse(color).asString();
	}
	return result;
}
