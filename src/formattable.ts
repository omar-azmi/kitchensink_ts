/** utility functions for creating and formating string representations of mostly numeric data
 * @module
*/

/** represents a function that formats an atomic-value `T` to its string representation */
export type FormatValue<T extends any = number> = (value: T, i?: number, arr?: Array<unknown>) => string

/** represents signature of a function that formats either an atomic-value `T`, or an array thereof (`T[]`), to its/their string representation */
export interface FormatValueOrArray<T> {
	(value: T): string
	(array: T[]): string[]
}

/** a float number in the range `0.0` to `1.0` (inclusive) */
export type FractionFloat = number

/** an integer number in the range `0` to `255` (inclusive) */
export type UByte = number

/** an integer number in the range `0` to `360` (inclusive), indicating the degree rotation angle. <br>
 * note that the value is not explicitly capped at given range.
*/
export type UDegree = number

/** format atomic-value `v: T` or atomic-elements inside of `v: Array<T>`, using the given `formatter` atomic-value mapping function */
export const formatEach = <T, S = string | string[]>(formatter: FormatValue<T>, v: T | T[]): S => {
	if (Array.isArray(v)) return v.map(formatter) as S
	return formatter(v) as S
}

const percent_fmt: FormatValue<FractionFloat> = (v?) => ((v ?? 1) * 100).toFixed(0) + "%"
export const percent: FormatValueOrArray<FractionFloat> = (val) => formatEach(percent_fmt, val)

const ubyte_fmt: FormatValue<UByte> = (v?) => {
	v ??= 0
	return (v < 0 ? 0 : v > 255 ? 255 : v).toFixed(0)
}
export const ubyte: FormatValueOrArray<FractionFloat> = (val) => formatEach(ubyte_fmt, val)

const udegree_fmt: FormatValue<UDegree> = (v?) => (v ?? 0).toFixed(1) + "deg"
export const udegree: FormatValueOrArray<UDegree> = (val) => formatEach(udegree_fmt, val)

const hex_fmt: FormatValue<UByte[]> = (v) => v.map(c => (c < 0x10 ? "0" : "") + (c | 0).toString(16)).join("")

const rgb_hex_fmt: FormatValue<[R: UByte, G: UByte, B: UByte]> = (v) => "#" + hex_fmt(v)

const rgba_hex_fmt: FormatValue<[R: UByte, G: UByte, B: UByte, A: FractionFloat]> = (v) => {
	let [r, g, b, a] = v
	a *= 255
	return "#" + hex_fmt([r, g, b, a > 255 ? 255 : a])
}

const rgb_fmt: FormatValue<[R: UByte, G: UByte, B: UByte]> = (v) => "rgb(" + v.map(ubyte_fmt).join(",") + ")"

const rgba_fmt: FormatValue<[R: UByte, G: UByte, B: UByte, A: FractionFloat]> = (v) => {
	const arr = v.slice(0, 3).map(ubyte_fmt)
	arr.push(percent_fmt(v[3]))
	return "rgba(" + arr.join(",") + ")"
}

const hsl_fmt: FormatValue<[H: UDegree, S: FractionFloat, L: FractionFloat]> = (v) => "hsl(" [udegree_fmt(v[0]), percent_fmt()] + v.map(ubyte_fmt).join(",") + ")"

const rgba_fmt: FormatValue<[R: UByte, G: UByte, B: UByte, A: FractionFloat]> = (v) => {
	const arr = v.slice(0, 3).map(ubyte_fmt)
	arr.push(percent_fmt(v[3]))
	return "rgba(" + arr.join(",") + ")"
}