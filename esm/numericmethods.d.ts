/** utility functions for common number manipulation functions <br>
 * these functions go nicely with the {@link mapper} and {@link lambdacalc} submodules
 * @module
*/
import "./_dnt.polyfills.js";
import { UnitInterval } from "./typedefs.js";
/** clamp a `number` to inclusive `min` and `max` intervals. <br>
 * you can also provide a type alias for the output interval `OutInterval` number through the use of the generic parameter.
 * @param value value to clamp
 * @param min inclusive minimum of the interval
 * @param max inclusive maximum of the interval
*/
export declare const clamp: <OutInterval extends number = number>(value: number, min?: OutInterval, max?: OutInterval) => OutInterval;
/** get the mathematical modulo: `value` **mod** `mod`. <br>
 * **modulo** is different from javascript's `%` **remainder** operator in that which the **modulo** operation always returns a positive number <br>
*/
export declare const modulo: (value: number, mod: number) => number;
/** get the linearly interpolated value between two scalar points `x0` and `x1`, decided by unit interval time `t`. <br>
 * ie: `lerp(x0, x1, 0.0) === x0`, and `lerp(x0, x1, 1.0) === x1`, and `x0 < lerp(x0, x1, t > 0.0 && t < 1.0) < x1`. <br>
 * note that lerp does not clamp the time to the closed {@link UnitInterval} `[0.0, 1.0]`. <br>
 * use {@link lerpClamped} if you would like to clamp the time.
*/
export declare const lerp: (x0: number, x1: number, t: UnitInterval) => number;
/** same as {@link lerp}, except the time `t` is Clamped to the closed {@link UnitInterval} `[0.0, 1.0]` */
export declare const lerpClamped: (x0: number, x1: number, t: UnitInterval) => number;
/** get the {@link lerp} of the `i`th dimension of two vector points `v0` and `v1`, at time `t`. */
export declare const lerpi: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval, i: number) => number;
/** get the {@link lerpClamped} of the `i`th dimension of two vector points `v0` and `v1`, at time `t`. */
export declare const lerpiClamped: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval, i: number) => number;
/** get the {@link lerp} vector between two vector points `v0` and `v1`, at time `t`. */
export declare const lerpv: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval) => Vec;
/** get the {@link lerpClamped} vector between two vector points `v0` and `v1`, at time `t`. */
export declare const lerpvClamped: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, t: UnitInterval) => Vec;
/** get the inverse of {@link lerp}`(x0, x1, t)`, which is to say: find the {@link UnitInterval} parameter `t`, given a scalar number `x` in the closed interval `[x0, x1]` */
export declare const invlerp: (x0: number, x1: number, x: number) => UnitInterval;
/** same as {@link invlerp}, except that we force clamp the output {@link UnitInterval} `t` to the closed interval `[0, 1]` */
export declare const invlerpClamped: (x0: number, x1: number, x: number) => UnitInterval;
/** get the {@link invlerp} of the `i`th dimension of two vector point intervals `v0` and `v1`, at vector position `v`. */
export declare const invlerpi: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, v: Vec, i: number) => UnitInterval;
/** get the {@link invlerpClamped} of the `i`th dimension of two vector point intervals `v0` and `v1`, at vector position `v`. */
export declare const invlerpiClamped: <Vec extends number[] = number[]>(v0: Vec, v1: Vec, v: Vec, i: number) => UnitInterval;
/** `limp` is a made up abbreviation for *linear interval map*, which linearly maps
 * - a scalar value `x0`, that's in a
 * - scalar interval `u0: [min: number, max: number]` to
 * - a scalar output return value `x1`, that's in the
 * - scalar interval `u1: [min: number, max: number]`
 *
 * the math equation is simply `x1 = u1[0] + (x - u0[0]) * (u1[1] - u1[0]) / (u0[1] - u0[0])`. <br>
 * which is basically doing inverse_lerp on `x0` to find `t`, then applying lerp onto interval `u1` with the found `t`
*/
export declare const limp: (u0: [min: number, max: number], u1: [min: number, max: number], x0: number) => number;
/** same as {@link limp}, except the output `x1` is force clamped to the interval `u1` */
export declare const limpClamped: (u0: [min: number, max: number], u1: [min: number, max: number], x0: number) => number;
/** sum up an array of number */
export declare const sum: (values: number[]) => number;
/** minimum between two numbers. this is faster than `Math.min` as it uses the ternary conditional operator, which makes it highly JIT optimized. */
export declare const min: (v0: number, v1: number) => number;
/** maximum between two numbers. this is faster than `Math.max` as it uses the ternary conditional operator, which makes it highly JIT optimized. */
export declare const max: (v0: number, v1: number) => number;
