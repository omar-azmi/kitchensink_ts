/** utility functions for 1d arrays.
 * 
 * @module
*/

import { max } from "./numericmethods.ts"


/** resolve the positive (normalized) starting and ending indexes of a range.
 * 
 * for both `start` and `end`, a negative index can be used to indicate an index from the end of the range, if a `length` is given.
 * for example, `-2` refers to the second to last index (ie `length - 2`).
 * 
 * > [!note]
 * > you **must** provide the length of your array if you wish to use negative indexes.
 * > furthermore, you will **only** receive the length property if you had initially provided the length of the array.
 * 
 * @param start starting index. defaults to `0`
 * @param end ending index. defaults to `undefined` if `length` is not provided. else `end = length` (before offsetting)
 * @param length length of the array in question. required if you want a numeric value of `end` that is `undefined`. defaults to `undefined`
 * @param offset in the very end of evauation, add an addition offset to `start` and `end` indexes
 * @returns a 3-tuple array of resolved [`start` index, `end` index, and `length` of range (ie `end - start`)]
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const
 * 	my_array = [0, 1, 2, 3, 4, 5, 6],
 * 	[start, end, new_length] = resolveRange(1, -2, my_array.length)
 * 
 * assertEquals([start, end, new_length], [1, 5, 4])
 * assertEquals(my_array.slice(start, end), [1, 2, 3, 4])
 * 
 * // expected resolved ranges when a length (3rd argument) is given.
 * assertEquals(resolveRange(2, undefined, 10),  [2, 10, 8])
 * assertEquals(resolveRange(2, 10, 10),         [2, 10, 8])
 * assertEquals(resolveRange(2, -1, 10),         [2, 9, 7])
 * assertEquals(resolveRange(2, -2, 10),         [2, 8, 6])
 * assertEquals(resolveRange(undefined, -2, 10), [0, 8, 8])
 * assertEquals(resolveRange(-3, undefined, 10), [7, 10, 3])
 * assertEquals(resolveRange(-3, -1, 10),        [7, 9, 2])
 * 
 * // if no length argument is provided, then no expectation for output length will be given.
 * assertEquals(resolveRange(2, 10), [2, 10, undefined])
 * assertEquals(resolveRange(2),     [2, undefined, undefined])
 * 
 * // if no length argument is provided, negative indexes will not be resolved.
 * assertEquals(resolveRange(-2, 10), [-2, 10, undefined])
 * assertEquals(resolveRange(2, -2),  [2, -2, undefined])
 * assertEquals(resolveRange(-2, -2), [-2, -2, undefined])
 * 
 * // you can additionally offset you final resolved output `start` and `end` indexes using the optional 4th `offset` argument.
 * assertEquals(resolveRange(2, undefined, 10, 100),  [102, 110, 8])
 * assertEquals(resolveRange(2, 10, 10, 100),         [102, 110, 8])
 * assertEquals(resolveRange(2, -1, 10, 100),         [102, 109, 7])
 * assertEquals(resolveRange(2, -2, 10, 100),         [102, 108, 6])
 * assertEquals(resolveRange(undefined, -2, 10, 100), [100, 108, 8])
 * assertEquals(resolveRange(-3, undefined, 10, 100), [107, 110, 3])
 * assertEquals(resolveRange(-3, -1, 10, 100),        [107, 109, 2])
 * 
 * // expected resolved output when a length is not provided, but an offset is provided.
 * assertEquals(resolveRange(2, 10, undefined, 100),        [102, 110, undefined])
 * assertEquals(resolveRange(2, undefined, undefined, 100), [102, undefined, undefined])
 * // notice the `98`s below when negative indexes are used.
 * // these might not be what one would expect, so always make sure to provide a length if a potential negative index might be used.
 * assertEquals(resolveRange(-2, 10, undefined, 100),       [98, 110, undefined])
 * assertEquals(resolveRange(2, -2, undefined, 100),        [102, 98, undefined])
 * assertEquals(resolveRange(-2, -2, undefined, 100),       [98, 98, undefined])
 * ```
*/
export function resolveRange(start: number | undefined, end: number | undefined, length: number, offset?: number): [start: number, end: number, length: number]
export function resolveRange(start?: number | undefined, end?: number | undefined, length?: undefined, offset?: number): [start: number, end: number | undefined, length: undefined]
export function resolveRange(start?: number | undefined, end?: number | undefined, length?: number, offset?: number) {
	start ??= 0
	offset ??= 0
	if (length === undefined) {
		return [start + offset, end === undefined ? end : end + offset, length] as [number, number | undefined, undefined]
	}
	end ??= length
	start += start >= 0 ? 0 : length
	end += end >= 0 ? 0 : length
	length = end - start
	return [start + offset, end + offset, max(0, length)] as [number, number, number]
}
