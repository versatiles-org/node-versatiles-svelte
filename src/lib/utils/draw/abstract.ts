import type { LngLatBounds } from 'maplibre-gl';

export abstract class AbstractDrawer<Geometry> {
	public abstract setGeometry(geometry: Geometry): void;
	public abstract getBounds(): LngLatBounds;
}
