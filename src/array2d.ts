/** utility functions for 2d arrays. <br>
 * a 2d array of type `T` is defined as `T[R][C]`, where `R` is the major-axis (axis=0), and `C` is the minor-axis (axis=1). <br>
 * internally, we call the major-axis the row-axis, and the minor-axis the column-axis (or col-axis). <br>
 * @module
*/

import { max } from "./numericmethods.ts"

/** a 2D array of cell type `T` */
export type Array2D<T> = T[][]

/** alias for a row-major 2D array */
export type Array2DRowMajor<T> = Array2D<T>

/** alias for a column-major 2D array */
export type Array2DColMajor<T> = Array2D<T>

type TransposeArray2D_Signatures = {
	<T>(arr: Array2DRowMajor<T>): Array2DColMajor<T>
	<T>(arr: Array2DColMajor<T>): Array2DRowMajor<T>
}

/** transpose a 2D array (row-major to column-major, or vice versa) <br>
 * @param arr2d the 2D array to be transposed
 * @returns the transposed 2D array
 * 
 * @example
 * ```ts
 * const arr2d: Array2DRowMajor<T> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const arr2d_transposed: Array2DColMajor<number> = transposeArray2D(arr2d)
 * arr2d_transposed === [
 * 	[1 , 6 , 11],
 * 	[2 , 7 , 12],
 * 	[3 , 8 , 13],
 * 	[4 , 9 , 14],
 * 	[5 , 10, 15],
 * ]
 * ```
*/
export const transposeArray2D: TransposeArray2D_Signatures = <T>(arr2d: Array2D<T>): Array2D<T> => {
	const
		rows = arr2d.length,
		cols = arr2d[0]?.length ?? 0,
		arr_transposed: T[][] = []
	for (let c = 0; c < cols; c++) { arr_transposed[c] = [] }
	for (let r = 0; r < rows; r++) {
		for (let c = 0; c < cols; c++) {
			arr_transposed[c][r] = arr2d[r][c]
		}
	}
	return arr_transposed
}

/** splice rows of a row-major 2D array and optionally insert new rows at the specified `start` index. <br>
 * @param arr2d the row-major 2D array to be spliced.
 * @param start the row-index at which to start changing the array.
 * @param delete_count the number of rows to remove. if `undefined`, all rows from `start` to the end of the array will be removed.
 * @param insert_items optionally insert row-major based 2D array items the index of `start`.
 * @returns a new row-major 2D array containing the deleted rows.
 * 
 * @example delete `1` row from `arr2d` (starting at row-index `1`), and insert `2` new rows in its place
 * ```ts
 * const arr2d: Array2DRowMajor<number> = [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[6 , 7 , 8 , 9 , 10],
 * 	[11, 12, 13, 14, 15],
 * ]
 * const deleted_rows = spliceArray2DMajor(arr2d, 1, 1,
 * 	[21, 22, 23, 24, 25],
 * 	[31, 32, 33, 34, 35]
 * )
 * arr2d === [
 * 	[1 , 2 , 3 , 4 , 5 ],
 * 	[21, 22, 23, 24, 25],
 * 	[31, 32, 33, 34, 35],
 * 	[11, 12, 13, 14, 15],
 * ]
 * deleted_rows === [
 * 	[6 , 7 , 8 , 9 , 10],
 * ]
 * ```
*/
export const spliceArray2DMajor = <T>(arr2d: Array2DRowMajor<T>, start: number, delete_count?: number, ...insert_items: Array2DRowMajor<T>): Array2DRowMajor<T> => {
	const
		rows = arr2d.length,
		cols = arr2d[0]?.length ?? 0
	delete_count ??= max(rows - start, 0)
	return arr2d.splice(start, delete_count, ...insert_items)
}

/** splice columns of a row-major 2D array and optionally insert new columns at the specified `start` index. <br>
 * @param arr2d the row-major 2D array to be spliced.
 * @param start the column-index at which to start changing the array.
 * @param delete_count the number of columns to remove. if `undefined`, all columns from `start` to the end of the array will be removed.
 * @param insert_items optionally insert column-major based 2D array items the index of `start`.
 * @returns a new column-major 2D array containing the deleted columns.
 * 
 * @example delete `2` columns from `arr2d` (starting at column-index `1`), and insert `5` new columns in its place
 * ```ts
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
 * arr2d === [
 * 	[1 , 21, 22, 23, 24, 25, 4 , 5 ],
 * 	[6 , 31, 32, 33, 34, 35, 9 , 10],
 * 	[11, 41, 42, 43, 44, 45, 14, 15],
 * ]
 * deleted_cols === [
 * 	[2 , 7 , 12],
 * 	[3 , 8 , 13],
 * ]
 * ```
*/
export const spliceArray2DMinor = <T>(arr2d: Array2DRowMajor<T>, start: number, delete_count?: number, ...insert_items: Array2DColMajor<T>): Array2DColMajor<T> => {
	const
		rows = arr2d.length,
		cols = arr2d[0]?.length ?? 0,
		insert_items_rowwise: Array2DRowMajor<T> = transposeArray2D(insert_items)
	delete_count ??= max(cols - start, 0)
	return transposeArray2D(
		arr2d.map(
			(row_items: T[], row: number) => row_items.splice(
				start,
				delete_count as number,
				...insert_items_rowwise[row]
			)
		)
	) as Array2DColMajor<T>
}
