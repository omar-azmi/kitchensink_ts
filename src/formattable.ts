/** utility functions for creating and formatting string representations of mostly numeric data.
 * 
 * @module
*/
import "./_dnt.polyfills.js";


import { array_isArray } from "./builtin_aliases_deps.js"
import { sequenceMap, type SequenceMapper } from "./mapper.js"
import { clamp } from "./numericmethods.js"
import type { Degrees, UByte, UnitInterval } from "./typedefs.js"


/** represents a function that formats an atomic-value `T` to its string representation */
export type FormatValue<T extends any = number> = (value: T, i?: number, arr?: Array<unknown>) => string

/** represents signature of a function that formats either an atomic-value `T`, or an array thereof (`T[]`), to its/their string representation */
export interface FormatValueOrArray<T> {
	(value: T): string
	(array: T[]): string[]
}

/** format atomic-value `v: T` or atomic-elements inside of `v: Array<T>`, using the given `formatter` atomic-value mapping function */
export const formatEach = <T, S = string | string[]>(formatter: FormatValue<T>, v: T | T[]): S => {
	return array_isArray(v)
		? v.map(formatter) as S
		: formatter(v) as S
}

export const percent_fmt: FormatValue<UnitInterval> = (v?) => ((v ?? 1) * 100).toFixed(0) + "%"
export const percent: FormatValueOrArray<UnitInterval> = (val) => formatEach(percent_fmt, val)

export const ubyte_fmt: FormatValue<UByte> = (v?) => clamp<UByte>(v ?? 0, 0, 255).toFixed(0)
export const ubyte: FormatValueOrArray<UnitInterval> = (val) => formatEach(ubyte_fmt, val)

export const udegree_fmt: FormatValue<Degrees> = (v?) => (v ?? 0).toFixed(1) + "deg"
export const udegree: FormatValueOrArray<Degrees> = (val) => formatEach(udegree_fmt, val)

export const hex_fmt: FormatValue<UByte> = (v) => (v < 0x10 ? "0" : "") + (v | 0).toString(16)

const rgb_hex_fmt_map: SequenceMapper<[R: UByte, G: UByte, B: UByte], [string, string, string]> = [
	hex_fmt,
	hex_fmt,
	hex_fmt,
]
export const rgb_hex_fmt: FormatValue<[R: UByte, G: UByte, B: UByte]> = (v) => "#" + sequenceMap(rgb_hex_fmt_map, v).join("")

const rgba_hex_fmt_map: SequenceMapper<[R: UByte, G: UByte, B: UByte, A?: UnitInterval], [string, string, string, string]> = [
	hex_fmt,
	hex_fmt,
	hex_fmt,
	(a?: UnitInterval) => hex_fmt(clamp<UByte>((a ?? 1) * 255, 0, 255))
]
export const rgba_hex_fmt: FormatValue<[R: UByte, G: UByte, B: UByte, A?: UnitInterval]> = (v) => "#" + sequenceMap(rgba_hex_fmt_map, v).join("")

export const rgb_fmt: FormatValue<[R: UByte, G: UByte, B: UByte]> = (v) => "rgb(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt], v).join(",") + ")"

export const rgba_fmt: FormatValue<[R: UByte, G: UByte, B: UByte, A: UnitInterval]> = (v) => "rgba(" + sequenceMap([ubyte_fmt, ubyte_fmt, ubyte_fmt, percent_fmt], v).join(",") + ")"

export const hsl_fmt: FormatValue<[H: Degrees, S: UnitInterval, L: UnitInterval]> = (v) => "hsl(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt], v).join(",") + ")"

export const hsla_fmt: FormatValue<[H: Degrees, S: UnitInterval, L: UnitInterval, A: UnitInterval]> = (v) => "hsla(" + sequenceMap([udegree_fmt, percent_fmt, percent_fmt, percent_fmt], v).join(",") + ")"
