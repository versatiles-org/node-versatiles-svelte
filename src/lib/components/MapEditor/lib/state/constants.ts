export const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
export const BASE64_CODE2BITS: [boolean, boolean, boolean, boolean, boolean, boolean][] = [];

for (let i = 0; i < BASE64_CHARS.length; i++) {
	BASE64_CODE2BITS[BASE64_CHARS.charCodeAt(i)] = [
		(i & 32) > 0,
		(i & 16) > 0,
		(i & 8) > 0,
		(i & 4) > 0,
		(i & 2) > 0,
		(i & 1) > 0
	];
}

export const CHAR_VALUE2CODE: number[] = [
	32, 101, 116, 97, 110, 105, 111, 115, 114, 108, 100, 104, 99, 117, 109, 112, 102, 103, 46, 121, 98, 119, 44, 118, 48,
	107, 49, 83, 84, 67, 50, 56, 53, 65, 57, 120, 51, 73, 45, 54, 52, 55, 77, 66, 34, 39, 80, 69, 78, 70, 82, 68, 85, 113,
	76, 71, 74, 72, 79, 87, 106, 122, 47, 60, 62, 75, 41, 40, 86, 89, 58, 81, 90, 88, 59, 63, 94, 38, 43, 91, 93, 36, 33,
	42, 61, 126, 95, 123, 64, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
	25, 26, 27, 28, 29, 30, 31, 35, 37, 92, 96, 124, 125, 127
];
export const CHAR_CODE2VALUE: number[] = [];
CHAR_VALUE2CODE.forEach((c, v) => (CHAR_CODE2VALUE[c] = v));
