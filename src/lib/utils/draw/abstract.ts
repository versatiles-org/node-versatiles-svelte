import type { LngLatBounds } from 'maplibre-gl';

export abstract class AbstractDrawer {
	public abstract getBounds(): LngLatBounds;
}
