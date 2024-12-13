/** utility functions for 2d arrays.
 *
 * a 2d array of type `T` is defined as `T[R][C]`, where `R` is the major-axis (axis=0), and `C` is the minor-axis (axis=1).
 * internally, we call the major-axis the row-axis, and the minor-axis the column-axis (or col-axis).
 *
 * @module
*/
import "./_dnt.polyfills.js";
/** a 2D array of cell type `T` */
export type Array2D<T> = T[][];
/** alias for a row-major 2D array */
export type Array2DRowMajor<T> = Array2D<T>;
/** alias for a column-major 2D array */
export type Array2DColMajor<T> = Array2D<T>;
type ShapeOfArray2D_Signatures = {
    <T>(arr2d: Array2DRowMajor<T>): [rows: number, columns: number];
    <T>(arr2d: Array2DColMajor<T>): [columns: number, rows: number];
    <T>(arr2d: Array2D<T>): [major_length: number, minor_length: number];
};
/** get the shape of a 2d array as a 2-tuple describing the major-axis's length, and the minor-axis's length.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const [rows, cols] = shapeOfArray2D(arr2d)
 * assertEquals(rows, 3)
 * assertEquals(cols, 5)
 * ```
*/
export declare const shapeOfArray2D: ShapeOfArray2D_Signatures;
/** @deprecated this got renamed to {@link shapeOfArray2D | `shapeOfArray2D`} for naming consistency. */
export declare const Array2DShape: ShapeOfArray2D_Signatures;
/** create a new row-major 2d array, with provided value or fill function. */
export declare const newArray2D: <T>(rows: number, cols: number, fill_fn?: T | ((value?: undefined, column_index?: number, column_array?: (T | undefined)[]) => T)) => Array2DRowMajor<T>;
type TransposeArray2D_Signatures = {
    <T>(arr2d: Array2DRowMajor<T>): Array2DColMajor<T>;
    <T>(arr2d: Array2DColMajor<T>): Array2DRowMajor<T>;
};
/** transpose a 2D array (row-major to column-major, or vice versa)
 *
 * @param arr2d the 2D array to be transposed
 * @returns the transposed 2D array
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const arr2d_transposed: Array2DColMajor<number> = transposeArray2D(arr2d)
 * assertEquals(arr2d_transposed, [
 * 	[1 , 6 , 11],
 * 	[2 , 7 , 12],
 * 	[3 , 8 , 13],
 * 	[4 , 9 , 14],
 * 	[5 , 10, 15],
 * ])
 * ```
*/
export declare const transposeArray2D: TransposeArray2D_Signatures;
/** splice rows of a row-major 2D array and optionally insert new rows at the specified `start` index.
 *
 * @param arr2d the row-major 2D array to be spliced.
 * @param start the row-index at which to start changing the array.
 * @param delete_count the number of rows to remove. if `undefined`, all rows from `start` to the end of the array will be removed.
 * @param insert_items optionally insert row-major based 2D array items the index of `start`.
 * @returns a new row-major 2D array containing the deleted rows.
 *
 * @example
 * delete `1` row from `arr2d` (starting at row-index `1`), and insert `2` new rows in its place.
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const deleted_rows = spliceArray2DMajor(arr2d, 1, 1,
 * 	[21, 22, 23, 24, 25],
 * 	[31, 32, 33, 34, 35]
 * )
 * assertEquals(arr2d, [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[21, 22, 23, 24, 25],
 * 	[31, 32, 33, 34, 35],
 * 	[11, 12, 13, 14, 15],
 * ])
 * assertEquals(deleted_rows, [
 * 	[6 , 7 , 8 , 9 , 10],
 * ])
 * ```
*/
export declare const spliceArray2DMajor: <T>(arr2d: Array2DRowMajor<T>, start: number, delete_count?: number, ...insert_items: Array2DRowMajor<T>) => Array2DRowMajor<T>;
/** splice columns of a row-major 2D array and optionally insert new columns at the specified `start` index.
 *
 * @param arr2d the row-major 2D array to be spliced.
 * @param start the column-index at which to start changing the array.
 * @param delete_count the number of columns to remove. if `undefined`, all columns from `start` to the end of the array will be removed.
 * @param insert_items optionally insert column-major based 2D array items the index of `start`.
 * @returns a new column-major 2D array containing the deleted columns.
 *
 * @example
 * delete `2` columns from `arr2d` (starting at column-index `1`), and insert `5` new columns in its place.
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const deleted_cols = spliceArray2DMinor(arr2d, 1, 2,
 * 	[21, 31, 41],
 * 	[22, 32, 42],
 * 	[23, 33, 43],
 * 	[24, 34, 44],
 * 	[25, 35, 45]
 * )
 * assertEquals(arr2d, [
 * 	[1 , 21, 22, 23, 24, 25, 4 , 5 ],
 * 	[6 , 31, 32, 33, 34, 35, 9 , 10],
 * 	[11, 41, 42, 43, 44, 45, 14, 15],
 * ])
 * assertEquals(deleted_cols, [
 * 	[2 , 7 , 12],
 * 	[3 , 8 , 13],
 * ])
 * ```
*/
export declare const spliceArray2DMinor: <T>(arr2d: Array2DRowMajor<T>, start: number, delete_count?: number, ...insert_items: Array2DColMajor<T>) => Array2DColMajor<T>;
/** mutate and rotate the major-axis of a 2D array by the specified amount to the right.
 *
 * given a row-major 2D array `arr2d`, this function would rotate its rows by the specified `amount`.
 * a positive `amount` would rotate the rows to the right, and a negative `amount` would rotate it to the left.
 *
 * @param arr2d the 2D array to be rotated.
 * @param amount The number of indexes to rotate the major-axis to the right.
 *   positive values rotate right, while negative values rotate left.
 * @returns The original array is returned back after the rotation.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 ],
 * 	[4 , 5 , 6 ],
 * 	[7 , 8 , 9 ],
 * 	[10, 11, 12],
 * 	[13, 14, 15],
 * ]
 * rotateArray2DMajor(arr2d, 2)
 * assertEquals(arr2d, [
 * 	[10, 11, 12],
 * 	[13, 14, 15],
 * 	[1 , 2 , 3 ],
 * 	[4 , 5 , 6 ],
 * 	[7 , 8 , 9 ],
 * ])
 * ```
*/
export declare const rotateArray2DMajor: <T>(arr2d: Array2DRowMajor<T>, amount: number) => typeof arr2d;
/** mutate and rotate the minor-axis of a 2D array by the specified amount to the right.
 *
 * given a row-major (and column-minor) 2D array `arr2d`, this function would rotate its columns by the specified `amount`.
 * a positive `amount` would rotate the columns to the right, and a negative `amount` would rotate it to the left.
 *
 * @param arr2d the 2D array to be rotated.
 * @param amount The number of indexes to rotate the minor-axis to the right.
 *   positive values rotate right, while negative values rotate left.
 * @returns The original array is returned back after the rotation.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 , 6 ],
 * 	[7 , 8 , 9 , 10, 11, 12],
 * 	[13, 14, 15, 16, 17, 18],
 * ]
 * rotateArray2DMinor(arr2d, 2)
 * assertEquals(arr2d, [
 * 	[5 , 6 , 1 , 2 , 3 , 4 ,],
 * 	[11, 12, 7 , 8 , 9 , 10,],
 * 	[17, 18, 13, 14, 15, 16,],
 * ])
 * ```
*/
export declare const rotateArray2DMinor: <T>(arr2d: Array2DRowMajor<T>, amount: number) => typeof arr2d;
/** create a mesh grid from major and minor values.
 *
 * given two arrays `major_values` and `minor_values`,
 * this function generates a pair of 2D arrays representing the major-grid and minor-grid.
 * the major-grid contains rows of `major_values`, and the minor-grid contains columns of `minor_values`.
 *
 * @param major_values the values to be used as rows in the major-grid
 * @param minor_values the values to be used as columns in the minor-grid
 * @returns a 2-tuple containing the major-grid and minor-grid as 2D arrays
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const
 * 	y_values = [1, 2, 3],
 * 	x_values = [4, 5],
 * 	[yy_grid, xx_grid] = meshGrid(y_values, x_values)
 * assertEquals(yy_grid, [
 * 	[1, 1],
 * 	[2, 2],
 * 	[3, 3],
 * ])
 * assertEquals(xx_grid, [
 * 	[4, 5],
 * 	[4, 5],
 * 	[4, 5],
 * ])
 * ```
*/
export declare const meshGrid: <T>(major_values: Array<T>, minor_values: Array<T>) => [major_grid: Array2D<T>, minor_grid: Array2D<T>];
/** map two arrays to a "field" of 2D array through a mapping function.
 *
 * given a mapping function `map_fn`, and two arrays `x_values` and `y_values`,
 * this function generates a 2D array where each element is the result of applying
 * `map_fn` to the corresponding elements from `x_values` and `y_values`.
 *
 * @param map_fn the mapping function that takes an `x` value from `x_values`
 *   and a `y` value from `y_values`, and returns the mapped z_value.
 * @param x_values the values to be used as the major axis (rows) of the resulting 2D array.
 * @param y_values the values to be used as the minor axis (columns) of the resulting 2D array.
 * @returns a 2D array with mapped values from `x_values` and `y_values`
 *
 * @example
 * `z` is a function of `x` and `y` defined by: `z(x, y) = x + y`. <br>
 * to create a 2d grid of `z_values` using `x_values = [1, 2, 3]` and `y_values = [4, 5]`, we do the following:
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const
 * 	add = (x: number, y: number) => (x + y),
 * 	x_values = [1, 2, 3],
 * 	y_values = [4, 5],
 * 	z_values = meshMap(add, x_values, y_values)
 * assertEquals(z_values, [
 * 	[5, 6],
 * 	[6, 7],
 * 	[7, 8],
 * ])
 * ```
*/
export declare const meshMap: <X, Y, Z>(map_fn: (x: X, y: Y) => Z, x_values: Array<X>, y_values: Array<Y>) => Array2D<Z>;
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
export declare const shuffleArray: <T>(arr: Array<T>) => Array<T>;
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
export declare const shuffledDeque: <T>(arr: Array<T>) => Generator<T, void, number | undefined>;
export {};
//# sourceMappingURL=array2d.d.ts.map