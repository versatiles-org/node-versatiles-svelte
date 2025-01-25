import type { BBox } from 'geojson';

/**
 * Rounds the values in a bounding box to a precision determined by its size.
 * @param bbox - The bounding box to round.
 * @returns A new bounding box with rounded values.
 */
export function roundBBox(bbox: BBox): BBox {
	// Determine precision based on the size of the bounding box
	const fx = length2precision(Math.abs(bbox[2] - bbox[0]));
	const fy = length2precision(Math.abs(bbox[3] - bbox[1]));
	const f = Math.min(fx, fy);

	// Round the bounding box values
	const b: BBox = [
		Math.floor(bbox[0] * f) / f,
		Math.floor(bbox[1] * f) / f,
		Math.ceil(bbox[2] * f) / f,
		Math.ceil(bbox[3] * f) / f
	];

	return b;

	/**
	 * Determines the precision for rounding based on the length of a side of the bounding box.
	 * @param n - The length of a side of the bounding box.
	 * @returns The precision factor to use for rounding.
	 */
	function length2precision(n: number): number {
		if (n > 300) return 1; // No rounding for large values
		if (n > 30) return 10; // Round to the nearest 0.1
		if (n > 3) return 100; // Round to the nearest 0.01
		return 1000; // Round to the nearest 0.001 for small values
	}
}

/**
 * Checks if two bounding boxes overlap.
 * @param bbox1 - The first bounding box.
 * @param bbox2 - The second bounding box.
 * @returns True if the bounding boxes overlap, false otherwise.
 */
export function bboxOverlap(bbox1: BBox, bbox2: BBox): boolean {
	return !(
		bbox1[0] > bbox2[2] ||
		bbox1[1] > bbox2[3] ||
		bbox1[2] < bbox2[0] ||
		bbox1[3] < bbox2[1]
	);
}
