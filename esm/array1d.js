/** utility functions for 1d arrays.
 *
 * @module
*/
import { array_isEmpty, math_random } from "./alias.js";
import { bind_array_push } from "./binder.js";
import { max, min, modulo } from "./numericmethods.js";
export function resolveRange(start, end, length, offset) {
    start ??= 0;
    offset ??= 0;
    if (length === undefined) {
        return [start + offset, end === undefined ? end : end + offset, length];
    }
    end ??= length;
    start += start >= 0 ? 0 : length;
    end += end >= 0 ? 0 : length;
    length = end - start;
    return [start + offset, end + offset, max(0, length)];
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
export const rotateArray = (arr, amount) => {
    const len = arr.length;
    // compute the effective right-rotation amount so that it handles negative values and full rotations
    amount = modulo(amount, len === 0 ? 1 : len);
    // there is nothing to rotate if the effective amount is zero
    if (amount === 0) {
        return arr;
    }
    const right_removed_rows = arr.splice(len - amount, amount);
    arr.splice(0, 0, ...right_removed_rows);
    return arr;
};
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
export const shuffleArray = (arr) => {
    const len = arr.length, rand_int = () => (math_random() * len) | 0, swap = (i1, i2) => {
        const temp = arr[i1];
        arr[i1] = arr[i2];
        arr[i2] = temp;
    };
    for (let i = 0; i < len; i++) {
        swap(i, rand_int());
    }
    return arr;
};
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
export const shuffledDeque = function* (arr) {
    let i = arr.length; // this is only temporary. `i` immediately becomes `0` when the while loop begins
    while (!array_isEmpty(arr)) {
        if (i >= arr.length) {
            i = 0;
            shuffleArray(arr);
        }
        i = max(i + ((yield arr[i]) ?? 1), 0);
    }
};
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
export const spliceGenericStack = (stack, start = 0, deleteCount, ...items) => {
    const initial_length = stack.length, maxDeleteCount = initial_length - start;
    deleteCount ??= maxDeleteCount;
    deleteCount = min(deleteCount, maxDeleteCount);
    const end = start + deleteCount, retained_items = [], removed_items = [], retained_items_push = bind_array_push(retained_items), removed_items_push = bind_array_push(removed_items);
    // collect the items that will be be retained and re-pushed back into the `arr` later on
    for (let i = initial_length; i > end; i--) {
        retained_items_push(stack.pop());
    }
    // collect the items that will be removed
    for (let i = end; i > start; i--) {
        removed_items_push(stack.pop());
    }
    // then push the new `items`, followed by the reverse of `retained_items`
    stack.push(...items, ...retained_items.toReversed()); // `toReversed()` is faster than the `reverse()` method for large arrays.
    return removed_items.toReversed();
};
