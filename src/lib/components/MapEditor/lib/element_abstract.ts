import type { Feature, Geometry } from 'geojson';
import type { ExpressionSpecification, FormattedSpecification, LayerSpecification, PaddingSpecification, ResolvedImageSpecification, VariableAnchorOffsetCollectionSpecification } from 'maplibre-gl';
import type maplibregl from 'maplibre-gl';
import { Color } from '@versatiles/style';

type LayerType = 'symbol' | 'line' | 'fill';

export abstract class AbstractElement {
	public name: string;
	protected map: maplibregl.Map;
	private slug = '_' + Math.random().toString(36).slice(2);

	constructor(map: maplibregl.Map, name: string) {
		this.map = map;
		this.name = name;
	}

	protected addSource<T extends Geometry>(geometry: T): Feature<T> {
		const data: Feature<T> = { type: 'Feature', geometry, properties: {} };
		this.map.addSource('source' + this.slug, { type: 'geojson', data });
		return data;
	}

	protected addSymbolLayer(): MapLayer<LayerSymbol> {
		return new MapLayer(this.map, 'symbol' + this.slug, 'source' + this.slug, 'symbol');
	}

	protected addFillLayer(): MapLayer<LayerFill> {
		return new MapLayer(this.map, 'fill' + this.slug, 'source' + this.slug, 'fill');
	}

	protected addLinelLayer(): MapLayer<LayerLine> {
		return new MapLayer(this.map, 'line' + this.slug, 'source' + this.slug, 'line');
	}

	abstract getFeature(): Feature;
}

interface LayerFill {
	layout: {
		"fill-sort-key"?: number;
		"visibility"?: "visible" | "none";
	},
	paint: {
		"fill-antialias"?: boolean;
		"fill-opacity"?: number;
		"fill-color"?: string | Color;
		"fill-outline-color"?: string | Color;
		"fill-translate"?: [number, number];
		"fill-translate-anchor"?: "map" | "viewport";
		"fill-pattern"?: ResolvedImageSpecification;
	}
};

interface LayerLine {
	layout: {
		"line-cap"?: "butt" | "round" | "square";
		"line-join"?: "bevel" | "round" | "miter";
		"line-miter-limit"?: number;
		"line-round-limit"?: number;
		"line-sort-key"?: number;
		"visibility"?: "visible" | "none";
	},
	paint: {
		"line-opacity"?: number;
		"line-color"?: string | Color;
		"line-translate"?: [number, number];
		"line-translate-anchor"?: "map" | "viewport";
		"line-width"?: number;
		"line-gap-width"?: number;
		"line-offset"?: number;
		"line-blur"?: number;
		"line-dasharray"?: Array<number>;
		"line-pattern"?: ResolvedImageSpecification;
		"line-gradient"?: ExpressionSpecification;
	}
}

interface LayerSymbol {
	layout: {
		"symbol-placement"?: "point" | "line" | "line-center";
		"symbol-spacing"?: number;
		"symbol-avoid-edges"?: boolean;
		"symbol-sort-key"?: number;
		"symbol-z-order"?: "auto" | "viewport-y" | "source";
		"icon-allow-overlap"?: boolean;
		"icon-overlap"?: "never" | "always" | "cooperative";
		"icon-ignore-placement"?: boolean;
		"icon-optional"?: boolean;
		"icon-rotation-alignment"?: "map" | "viewport" | "auto";
		"icon-size"?: number;
		"icon-text-fit"?: "none" | "width" | "height" | "both";
		"icon-text-fit-padding"?: [number, number, number, number];
		"icon-image"?: ResolvedImageSpecification;
		"icon-rotate"?: number;
		"icon-padding"?: PaddingSpecification;
		"icon-keep-upright"?: boolean;
		"icon-offset"?: [number, number];
		"icon-anchor"?: "center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
		"icon-pitch-alignment"?: "map" | "viewport" | "auto";
		"text-pitch-alignment"?: "map" | "viewport" | "auto";
		"text-rotation-alignment"?: "map" | "viewport" | "viewport-glyph" | "auto";
		"text-field"?: FormattedSpecification;
		"text-font"?: Array<string>;
		"text-size"?: number;
		"text-max-width"?: number;
		"text-line-height"?: number;
		"text-letter-spacing"?: number;
		"text-justify"?: "auto" | "left" | "center" | "right";
		"text-radial-offset"?: number;
		"text-variable-anchor"?: Array<"center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right">;
		"text-variable-anchor-offset"?: VariableAnchorOffsetCollectionSpecification;
		"text-anchor"?: "center" | "left" | "right" | "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
		"text-max-angle"?: number;
		"text-writing-mode"?: Array<"horizontal" | "vertical">;
		"text-rotate"?: number;
		"text-padding"?: number;
		"text-keep-upright"?: boolean;
		"text-transform"?: "none" | "uppercase" | "lowercase";
		"text-offset"?: [number, number];
		"text-allow-overlap"?: boolean;
		"text-overlap"?: "never" | "always" | "cooperative";
		"text-ignore-placement"?: boolean;
		"text-optional"?: boolean;
		"visibility"?: "visible" | "none";
	}, paint: {
		"icon-opacity"?: number;
		"icon-color"?: string | Color;
		"icon-halo-color"?: string | Color;
		"icon-halo-width"?: number;
		"icon-halo-blur"?: number;
		"icon-translate"?: [number, number];
		"icon-translate-anchor"?: "map" | "viewport";
		"text-opacity"?: number;
		"text-color"?: string | Color;
		"text-halo-color"?: string | Color;
		"text-halo-width"?: number;
		"text-halo-blur"?: number;
		"text-translate"?: [number, number];
		"text-translate-anchor"?: "map" | "viewport";
	}
};

type LayerSpec = LayerFill | LayerLine | LayerSymbol;

class MapLayer<T extends LayerSpec> {
	private map: maplibregl.Map;
	private id: string;
	private layoutProperties = {} as T['layout'];
	private paintProperties = {} as T['paint'];

	constructor(map: maplibregl.Map, id: string, source: string, type: LayerType) {
		this.map = map;
		this.id = id;

		let filter: string;
		switch (type) {
			case 'symbol': filter = 'Point'; break;
			case 'line': filter = 'LineString'; break;
			case 'fill': filter = 'Polygon'; break;
			default: throw new Error('Invalid layer type');
		}
		this.map.addLayer({
			id,
			source,
			type,
			layout: this.layoutProperties,
			paint: this.paintProperties,
			filter: ['==', '$type', filter]
		} as LayerSpecification);
	}

	setPaint(paint: T['paint']) {
		if (paint === undefined) return;
		const keys = new Set(Object.keys(paint).concat(Object.keys(this.paintProperties)) as (keyof T['paint'])[]);
		for (const key of keys.values()) this.updatePaint(key, (paint as T['paint'])[key]);
	}

	updatePaint<K extends keyof T['paint'], V extends T['paint'][K]>(key: K, value: V) {
		if (value instanceof Color) value = value.asString() as V;

		if (this.paintProperties[key] == value) return;
		this.map.setPaintProperty(this.id, key as string, value);
		this.paintProperties[key] = value;
	}

	setLayout(layout: T['layout']) {
		if (layout === undefined) return;
		const keys = new Set(Object.keys(layout).concat(Object.keys(this.layoutProperties)) as (keyof T['layout'])[]);
		for (const key of keys.values()) this.updateLayout(key, (layout as T['layout'])[key]);
	}

	updateLayout<K extends keyof T['layout'], V extends T['layout'][K]>(key: K, value: V) {
		if (this.layoutProperties[key] == value) return;
		this.map.setLayoutProperty(this.id, key as string, value);
		this.layoutProperties[key] = value;
	}
}
