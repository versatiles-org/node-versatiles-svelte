import type { Color } from '@versatiles/style';

export interface LayerFill {
	layout: {
		'fill-sort-key'?: number;
		visibility?: 'visible' | 'none';
	};
	paint: {
		'fill-antialias'?: boolean;
		'fill-opacity'?: number;
		'fill-color'?: string | Color;
		'fill-outline-color'?: string | Color;
		'fill-translate'?: [number, number];
		'fill-translate-anchor'?: 'map' | 'viewport';
		'fill-pattern'?: maplibregl.ResolvedImageSpecification;
	};
}

export interface LayerLine {
	layout: {
		'line-cap'?: 'butt' | 'round' | 'square';
		'line-join'?: 'bevel' | 'round' | 'miter';
		'line-miter-limit'?: number;
		'line-round-limit'?: number;
		'line-sort-key'?: number;
		visibility?: 'visible' | 'none';
	};
	paint: {
		'line-opacity'?: number;
		'line-color'?: string | Color;
		'line-translate'?: [number, number];
		'line-translate-anchor'?: 'map' | 'viewport';
		'line-width'?: number;
		'line-gap-width'?: number;
		'line-offset'?: number;
		'line-blur'?: number;
		'line-dasharray'?: Array<number>;
		'line-pattern'?: maplibregl.ResolvedImageSpecification;
		'line-gradient'?: maplibregl.ExpressionSpecification;
	};
}

export interface LayerSymbol {
	layout: {
		'symbol-placement'?: 'point' | 'line' | 'line-center';
		'symbol-spacing'?: number;
		'symbol-avoid-edges'?: boolean;
		'symbol-sort-key'?: number;
		'symbol-z-order'?: 'auto' | 'viewport-y' | 'source';
		'icon-allow-overlap'?: boolean;
		'icon-overlap'?: 'never' | 'always' | 'cooperative';
		'icon-ignore-placement'?: boolean;
		'icon-optional'?: boolean;
		'icon-rotation-alignment'?: 'map' | 'viewport' | 'auto';
		'icon-size'?: number;
		'icon-text-fit'?: 'none' | 'width' | 'height' | 'both';
		'icon-text-fit-padding'?: [number, number, number, number];
		'icon-image'?: maplibregl.ResolvedImageSpecification;
		'icon-rotate'?: number;
		'icon-padding'?: maplibregl.PaddingSpecification;
		'icon-keep-upright'?: boolean;
		'icon-offset'?: [number, number];
		'icon-anchor'?:
			| 'center'
			| 'left'
			| 'right'
			| 'top'
			| 'bottom'
			| 'top-left'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-right';
		'icon-pitch-alignment'?: 'map' | 'viewport' | 'auto';
		'text-pitch-alignment'?: 'map' | 'viewport' | 'auto';
		'text-rotation-alignment'?: 'map' | 'viewport' | 'viewport-glyph' | 'auto';
		'text-field'?: maplibregl.FormattedSpecification;
		'text-font'?: Array<string>;
		'text-size'?: number;
		'text-max-width'?: number;
		'text-line-height'?: number;
		'text-letter-spacing'?: number;
		'text-justify'?: 'auto' | 'left' | 'center' | 'right';
		'text-radial-offset'?: number;
		'text-variable-anchor'?: Array<
			| 'center'
			| 'left'
			| 'right'
			| 'top'
			| 'bottom'
			| 'top-left'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-right'
		>;
		'text-variable-anchor-offset'?: maplibregl.VariableAnchorOffsetCollectionSpecification;
		'text-anchor'?:
			| 'center'
			| 'left'
			| 'right'
			| 'top'
			| 'bottom'
			| 'top-left'
			| 'top-right'
			| 'bottom-left'
			| 'bottom-right';
		'text-max-angle'?: number;
		'text-writing-mode'?: Array<'horizontal' | 'vertical'>;
		'text-rotate'?: number;
		'text-padding'?: number;
		'text-keep-upright'?: boolean;
		'text-transform'?: 'none' | 'uppercase' | 'lowercase';
		'text-offset'?: [number, number];
		'text-allow-overlap'?: boolean;
		'text-overlap'?: 'never' | 'always' | 'cooperative';
		'text-ignore-placement'?: boolean;
		'text-optional'?: boolean;
		visibility?: 'visible' | 'none';
	};
	paint: {
		'icon-opacity'?: number;
		'icon-color'?: string | Color;
		'icon-halo-color'?: string | Color;
		'icon-halo-width'?: number;
		'icon-halo-blur'?: number;
		'icon-translate'?: [number, number];
		'icon-translate-anchor'?: 'map' | 'viewport';
		'text-opacity'?: number;
		'text-color'?: string | Color;
		'text-halo-color'?: string | Color;
		'text-halo-width'?: number;
		'text-halo-blur'?: number;
		'text-translate'?: [number, number];
		'text-translate-anchor'?: 'map' | 'viewport';
	};
}
