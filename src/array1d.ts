/** utility functions for 1d arrays.
 * 
 * @module
*/

import { array_isEmpty, math_random } from "./alias.ts"
import { bind_array_push } from "./binder.ts"
import { absolute, max, min, modulo, roundFloat, sign } from "./numericmethods.ts"


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

/** mutate and rotate the given array by the specified amount to the right.
 * 
 * given an array `arr`, this function would rotate its rows by the specified `amount`.
 * a positive `amount` would rotate the rows to the right, and a negative `amount` would rotate it to the left.
 * 
 * @param arr the array to be rotated.
 * @param amount The number of indexes to rotate the major-axis to the right.
 *   positive values rotate right, while negative values rotate left.
 * @returns The original array is returned back after the rotation.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const arr: Array<number> = [1, 2, 3, 4, 5]
 * 
 * rotateArray(arr, 2)
 * assertEquals(arr, [4, 5, 1, 2, 3])
 * 
 * rotateArray(arr, -3)
 * assertEquals(arr, [2, 3, 4, 5, 1])
 * ```
*/
export const rotateArray = <T>(arr: Array<T>, amount: number): Array<T> => {
	const len = arr.length
	// compute the effective right-rotation amount so that it handles negative values and full rotations
	amount = modulo(amount, len === 0 ? 1 : len)
	// there is nothing to rotate if the effective amount is zero
	if (amount === 0) { return arr }
	const right_removed_rows = arr.splice(len - amount, amount)
	arr.splice(0, 0, ...right_removed_rows)
	return arr
}

/** shuffle a 1D array via mutation. the ordering of elements will be randomized by the end.
 * 
 * ```ts
 * import { assertEquals, assertNotEquals } from "jsr:@std/assert"
 * 
 * const
 * 	range_100 = Array(100).fill(0).map((_, i) => (i)), // sequntially numbered array
 * 	my_arr = range_100.slice()
 * shuffleArray(my_arr) // shuffling our array via mutation
 * 
 * // the shuffled array is very unlikely to equal to the original unshuffled form 
 * assertNotEquals(my_arr, range_100)
 * // sort the shuffled array to assert the preservation of the contained items
 * assertEquals(my_arr.toSorted((a, b) => (a - b)), range_100)
 * ```
*/
export const shuffleArray = <T>(arr: Array<T>): Array<T> => {
	const
		len = arr.length,
		rand_int = () => (math_random() * len) | 0,
		swap = (i1: number, i2: number) => {
			const temp = arr[i1]
			arr[i1] = arr[i2]
			arr[i2] = temp
		}
	for (let i = 0; i < len; i++) { swap(i, rand_int()) }
	return arr
}

/** a generator that shuffles your 1D array via mutation, then yields randomly selected non-repeating elements out of it, one by one,
 * until all elements have been yielded, at which a new cycle begins, and the items in the array are re-shuffled again.
 * i.e. after every new cycle, the ordering of the randomly yielded elements will differ from the ordering of the previous cycle.
 * 
 * moreover, you can call the iterator with an optional number argument that specifies if you wish to skip ahead or go back a certain number of elements.
 * - `1`: go to next element (default behavior)
 * - `0`: receive the same element as before
 * - `-1`: go to previous next element
 * - `+ve number`: skip to next `number` of elements
 * - `-ve number`: go back `number` of elements
 * 
 * note that once a cycle is complete, going back won't restore the correct element from the previous cycle, because the info about the previous cycle gets lost.
 * 
 * ```ts
 * import { assert, assertEquals, assertNotEquals } from "jsr:@std/assert"
 * 
 * const
 * 	my_playlist = ["song1", "song2", "song3", "song4"],
 * 	my_queue = my_playlist.slice(),
 * 	track_iter = shuffledDeque(my_queue) // shuffles our play queue via mutation, and then indefinitely provides unique items each cycle
 * 
 * const
 * 	track1 = track_iter.next().value,
 * 	track2 = track_iter.next(1).value,
 * 	track3 = track_iter.next().value
 * 
 * assertEquals(track1, track_iter.next(-2).value)
 * assertEquals(track2, track_iter.next(1).value)
 * assertEquals(track3, track_iter.next().value)
 * 
 * const track4 = track_iter.next().value // final track of the current queue
 * const track5 = track_iter.next().value // the queue has been reset, and re-shuffled
 * 
 * assert([track1, track2, track3].includes(track4) === false)
 * assert([track1, track2, track3, track4].includes(track5) === true)
 * ```
*/
export const shuffledDeque = function* <T>(arr: Array<T>): Generator<T, void, number | undefined> {
	let i = arr.length // this is only temporary. `i` immediately becomes `0` when the while loop begins
	while (!array_isEmpty(arr)) {
		if (i >= arr.length) {
			i = 0
			shuffleArray(arr)
		}
		i = max(i + ((yield arr[i]) ?? 1), 0)
	}
}

/** type definition for a generic stack data structure, that is aware of its size. */
export interface GenericStack<T> {
	readonly length: number
	push: (...items: T[]) => any
	pop: () => T | undefined
}

/** a function to splice any stack (see the {@link GenericStack} interface).
 * 
 * splicing alone lets you effectively implement all sorts of array mutation methods, such as
 * `push`, `pop`, `unshift`, `shift`, `insert`, `rotate`, and many more.
 * 
 * > [!note]
 * > the `length` property of your `stack` is not mutated/assigned by this function.
 * > you will have to do that manually yourself if your `stack` does not modify the `length` property upon the `push` and `pop` operations.
 * 
 * @param stack the generic stack object to splice.
 * @param start the starting index to begin splicing from.
 *   you must provide only positive starting index values.
 *   defaults to `0`.
 * @param deleteCount the number of elements to remove from the `start` index (inclusive).
 *   if it is set to `undefined`, then all elements until the end of the generic stack array will be removed.
 *   defaults to `undefined`.
 * @param items insert items at the `start` index, so that the first inserted item will occupy the `start` index _after_ the splicing.
 * @returns an array of deleted items in the generic stack will be returned.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const
 * 	fn = spliceGenericStack,
 * 	eq = assertEquals
 * 
 * const my_stack = [0, 1, 2, 3, 4, 5, 6, 7]
 * 
 * eq(fn(my_stack, 4), [4, 5, 6, 7])
 * eq(my_stack,        [0, 1, 2, 3])
 * 
 * eq(fn(my_stack, 0, 0, -3, -2, -1), [])
 * eq(my_stack,        [-3, -2, -1, 0, 1, 2, 3])
 * 
 * eq(fn(my_stack, 4, 2, 0.1, 0.2, 0.3), [1, 2])
 * eq(my_stack,        [-3, -2, -1, 0, 0.1, 0.2, 0.3, 3])
 * 
 * eq(fn(my_stack),    [-3, -2, -1, 0, 0.1, 0.2, 0.3, 3])
 * eq(my_stack,        [])
 * ```
*/
export const spliceGenericStack = <T>(
	stack: GenericStack<T>,
	start: number = 0,
	deleteCount?: number | undefined,
	...items: T[]
): T[] => {
	const
		initial_length = stack.length,
		maxDeleteCount = initial_length - start
	deleteCount ??= maxDeleteCount
	deleteCount = min(deleteCount, maxDeleteCount)
	const
		end = start + deleteCount,
		retained_items: T[] = [],
		removed_items: T[] = [],
		retained_items_push = bind_array_push(retained_items),
		removed_items_push = bind_array_push(removed_items)
	// collect the items that will be be retained and re-pushed back into the `arr` later on
	for (let i = initial_length; i > end; i--) { retained_items_push(stack.pop()!) }
	// collect the items that will be removed
	for (let i = end; i > start; i--) { removed_items_push(stack.pop()!) }
	// then push the new `items`, followed by the reverse of `retained_items`
	stack.push(...items, ...retained_items.toReversed()) // `toReversed()` is faster than the `reverse()` method for large arrays.
	return removed_items.toReversed()
}

/** generate a numeric array with sequentially increasing value, within a specific range interval.
 * similar to python's `range` function.
 * 
 * however, unlike python's `range`, you **must** always supply the starting index **and** the ending index,
 * even if the start index is supposed to be `0`, you cannot substitute the first argument with the ending index.
 * only the {@link step} argument is optional. moreover, the {@link step} argument must always be a positive number.
 * 
 * @param start the initial number to begin the output range sequence from.
 * @param end the final exclusive number to end the output range sequence at. its value will **not** be in the output array.
 * @param step a **positive** number, dictating how large each step from the `start` to the `end` should be.
 *   for safety, so that a user doesn't run into an infinite loop by providing a negative step value,
 *   we always take the absolute value of this parameter.
 *   defaults to `1`
 * @param decimal_precision an integer that specifies the number of decimal places to which the output
 *   numbers should be rounded to in order to nullify floating point arithmetic inaccuracy.
 *   for instance, in javascript `0.1 + 0.2 = 0.30000000000000004` instead of `0.3`.
 *   now, you'd certainly not want to see this kind of number in our output, which is why we round it so that it becomes `0.3`.
 *   defaults to `6` (6 decimal places; i.e. rounds to the closest micro-number (10**(-6)))
 * @returns a numeric array with sequentially increasing value from the `start` to the `end` interval, with steps of size `step`.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const
 * 	fn = rangeArray,
 * 	eq = assertEquals
 * 
 * eq(fn(0, 5),       [0, 1, 2, 3, 4])
 * eq(fn(-2, 3),      [-2, -1, 0, 1, 2])
 * eq(fn(2, 7),       [2, 3, 4, 5, 6])
 * eq(fn(2, 7.1),     [2, 3, 4, 5, 6, 7])
 * eq(fn(0, 1, 0.2),  [0, 0.2, 0.4, 0.6, 0.8])
 * eq(fn(0, 100, 20), [0, 20, 40, 60, 80])
 * eq(fn(2, -3),      [2, 1, 0, -1, -2])
 * eq(fn(2, -7, 2),   [2, 0, -2, -4, -6])
 * eq(fn(2, -7, -2),  [2, 0, -2, -4, -6]) // as a protective measure, only the `abs(step)` value is ever taken.
 * eq(fn(2, 7, -1),   [2, 3, 4, 5, 6])    // as a protective measure, only the `abs(step)` value is ever taken.
 * ```
*/
export const rangeArray = (start: number, end: number, step: number = 1, decimal_precision: number = 6): Array<number> => {
	const
		delta = end - start,
		signed_step = absolute(step) * sign(delta),
		end_index = delta / signed_step,
		output_arr: number[] = [],
		output_arr_push = bind_array_push(output_arr)
	for (let i = 0; i < end_index; i++) { output_arr_push(roundFloat(start + i * signed_step, decimal_precision)) }
	return output_arr
}
