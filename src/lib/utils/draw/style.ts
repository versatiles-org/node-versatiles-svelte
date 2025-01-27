import { Color } from '@versatiles/style';
import type {
	FillLayerSpecification,
	LineLayerSpecification,
	SymbolLayerSpecification
} from 'maplibre-gl';

export type AbstractLayerStyle<
	T extends FillLayerSpecification | LineLayerSpecification | SymbolLayerSpecification
> = {
	paint: {} & T['paint'];
	layout: {} & T['layout'];
};

export interface FillStyle {
	color?: string;
	fillColor?: string;
}

export function getFillStyle(style?: FillStyle): AbstractLayerStyle<FillLayerSpecification> {
	const result: AbstractLayerStyle<FillLayerSpecification> = {
		layout: {},
		paint: {}
	};
	if (style) {
		if (style.fillColor) {
			result.paint['fill-color'] = Color.parse(style.fillColor).asString();
		} else if (style.color) {
			result.paint['fill-color'] = Color.parse(style.color).fade(0.8).asString();
		}
	}
	return result;
}

export interface LineStyle {
	color?: string;
	lineColor?: string;
}

export function getLineStyle(style?: LineStyle): AbstractLayerStyle<LineLayerSpecification> {
	const result: AbstractLayerStyle<LineLayerSpecification> = {
		layout: { 'line-cap': 'round', 'line-join': 'round' },
		paint: {}
	};
	if (style) {
		const color = style.lineColor ?? style.color;
		if (color) result.paint['line-color'] = Color.parse(color).asString();
	}
	return result;
}

export interface SymbolStyle {
	color?: string;
}

export function getSymbolStyle(style?: SymbolStyle): AbstractLayerStyle<SymbolLayerSpecification> {
	const result: AbstractLayerStyle<SymbolLayerSpecification> = {
		layout: {},
		paint: {}
	};
	result.paint['icon-color'] = Color.parse(style?.color ?? '#a00').asString();
	result.paint['icon-halo-color'] = Color.parse('#fff').asString();
	result.paint['icon-halo-width'] = 0.5;
	result.paint['icon-halo-blur'] = 0;
	result.layout['icon-image'] = 'basics:icon-embassy';
	return result;
}
