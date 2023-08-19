/** utility functions for common number manipulation functions <br>
 * these functions go nicely with the {@link mapper} and {@link lambdacalc} submodules
 * @module
*/

import { number_MAX_VALUE, number_NEGATIVE_INFINITY, number_POSITIVE_INFINITY } from "./builtin_aliases_deps.ts"
import { UnitInterval } from "./typedefs.ts"

const number_MIN_VALUE = - number_MAX_VALUE

/** clamp a `number` to inclusive `min` and `max` intervals. <br>
 * you can also provide a type alias for the output interval `OutInterval` number through the use of the generic parameter.
 * @param value value to clamp
 * @param min inclusive minimum of the interval
 * @param max inclusive maximum of the interval
*/
export const clamp = <
	OutInterval extends number = number
>(
	value: number,
	min: OutInterval = number_MIN_VALUE as OutInterval,
	max: OutInterval = number_MAX_VALUE as OutInterval,
): OutInterval => (value < min ? min : value > max ? max : value) as OutInterval

/** get the mathematical modulo: `value` **mod** `mod`. <br>
 * **modulo** is different from javascript's `%` **remainder** operator in that which the **modulo** operation always returns a positive number <br>
*/
export const modulo = (value: number, mod: number) => ((value % mod) + mod) % mod

/** get the linearly interpolated value between two scalar points `x0` and `x1`, decided by unit interval time `t`. <br>
 * ie: `lerp(x0, x1, 0.0) === x0`, and `lerp(x0, x1, 1.0) === x1`, and `x0 < lerp(x0, x1, t > 0.0 && t < 1.0) < x1`. <br>
 * note that lerp does not clamp the time to the closed {@link UnitInterval} `[0.0, 1.0]`. <br>
 * use {@link lerpClampped} if you would like to clamp the time.
*/
export const lerp = (x0: number, x1: number, t: UnitInterval) => t * (x1 - x0) + x0

/** same as {@link lerp}, except the time `t` is Clamped to the closed {@link UnitInterval} `[0.0, 1.0]` */
export const lerpClamped = (x0: number, x1: number, t: UnitInterval) => (t < 0 ? 0 : t > 1 ? 1 : t) * (x1 - x0) + x0

/** get the {@link lerp} of the `i`th dimension of two vector points `v0` and `v1`, at time `t`. */
export const lerpi = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval, i: number): number => t * (v1[i] - v0[i]) + v0[i]

/** get the {@link lerpClamped} of the `i`th dimension of two vector points `v0` and `v1`, at time `t`. */
export const lerpiClamped = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval, i: number): number => (t < 0 ? 0 : t > 1 ? 1 : t) * (v1[i] - v0[i]) + v0[i]

/** get the {@link lerp} vector between two vector points `v0` and `v1`, at time `t`. */
export const lerpv = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval): Vec => {
	const
		len = v0.length,
		v: Vec = Array(len).fill(0) as Vec
	for (let i = 0, len = v0.length; i < len; i++) v[i] = t * (v1[i] - v0[i]) + v0[i]
	return v
}

/** get the {@link lerpClamped} vector between two vector points `v0` and `v1`, at time `t`. */
export const lerpvClamped = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval): Vec => lerpv<Vec>(v0, v1, t < 0 ? 0 : t > 1 ? 1 : t)

/** get the inverse of {@link lerp}`(x0, x1, t)`, which is to say: find the {@link UnitInterval} parameter `t`, given a scalar number `x` in the closed interval `[x0, x1]` */
export const invlerp = (x0: number, x1: number, x: number): UnitInterval => (x - x0) / (x1 - x0)

/** same as {@link invlerp}, except that we force clamp the output {@link UnitInterval} `t` to the closed interval `[0, 1]` */
export const invlerpClamped = (x0: number, x1: number, x: number): UnitInterval => {
	const t = (x - x0) / (x1 - x0)
	return t < 0 ? 0 : t > 1 ? 1 : t
}

/** get the {@link invlerp} of the `i`th dimension of two vector point intervals `v0` and `v1`, at vector position `v`. */
export const invlerpi = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, v: Vec, i: number): UnitInterval => (v[i] - v0[i]) / (v1[i] - v0[i])

/** get the {@link invlerpClamped} of the `i`th dimension of two vector point intervals `v0` and `v1`, at vector position `v`. */
export const invlerpiClamped = <Vec extends number[] = number[]>(v0: Vec, v1: Vec, v: Vec, i: number): UnitInterval => {
	const t = (v[i] - v0[i]) / (v1[i] - v0[i])
	return t < 0 ? 0 : t > 1 ? 1 : t
}

/** `limp` is a made up abbreviation for *linear interval map*, which linearly maps
 * - a scalar value `x0`, that's in a
 * - scalar interval `u0: [min: number, max: number]` to
 * - a scalar output return value `x1`, that's in the
 * - scalar interval `u1: [min: number, max: number]`
 * 
 * the math equation is simply `x1 = u1[0] + (x - u0[0]) * (u1[1] - u1[0]) / (u0[1] - u0[0])`. <br>
 * which is basically doing inverse_lerp on `x0` to find `t`, then applying lerp onto interval `u1` with the found `t`
*/
export const limp = (u0: [min: number, max: number], u1: [min: number, max: number], x0: number): number => u1[0] + (x0 - u0[0]) * (u1[1] - u1[0]) / (u0[1] - u0[0])

/** same as {@link limp}, except the output `x1` is force clamped to the interval `u1` */
export const limpClamped = (u0: [min: number, max: number], u1: [min: number, max: number], x0: number): number => {
	const t = (x0 - u0[0]) / (u0[1] - u0[0])
	return (t < 0 ? 0 : t > 1 ? 1 : t) * (u1[1] - u1[0]) + u1[0]
}

/** sum up an array of number */
export const sum = (values: number[]): number => {
	let
		total = 0,
		len = values.length
	for (let i = 0; i < len; i++) { total += values[i] }
	return total
}

/** minimum between two numbers. this is faster than `Math.min` as it uses the ternary conditional operator, which makes it highly JIT optimized. */
export const min = (v0: number, v1: number) => (v0 < v1 ? v0 : v1)

/** maximum between two numbers. this is faster than `Math.max` as it uses the ternary conditional operator, which makes it highly JIT optimized. */
export const max = (v0: number, v1: number) => (v0 > v1 ? v0 : v1)
