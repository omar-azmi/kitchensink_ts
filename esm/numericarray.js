/** utility functions for numeric array manipulation and array math functions.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import { constructorOf } from "./struct.js";
import { resolveRange } from "./typedbuffer.js";
/** @alpha */
export const transpose2D = (matrix) => matrix[0].map((_row_0_col_i, i) => matrix.map(row_arr => row_arr[i]));
/** compute the left-to-right running difference between successive elements <br>
 * the returned array's length is decremented by one. as a result, a single element array will turn into an empty array <br>
 * becareful when using with unsigned typed arrays <br>
 * @category copy
*/
export const diff = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const d = arr.slice(start + 1, end);
    for (let i = 0; i < d.length; i++) {
        d[i] -= arr[start + i - 1];
    }
    return d;
};
/** compute the right-to-left (ie reverse) running difference between preceding elements <br>
 * the returned array's length is decremented by one. as a result, a single element array will turn into an empty array <br>
 * becareful when using with unsigned typed arrays <br>
 * @category copy
*/
export const diff_right = (arr, start, end) => {
    [start, end] = resolveRange(start, end, arr.length);
    const d = arr.slice(start, end - 1);
    for (let i = 0; i < d.length; i++) {
        d[i] -= arr[start + i + 1];
    }
    return d;
};
/** cumulative summation of an array. the returned array has its length increased by one.
 * @example
 * ```ts
 * cumulativeSum([10, 20, 30, 40, 50]) // returns [0, 10, 30, 60, 100, 150]
 * ```
 * @category copy
*/
export const cumulativeSum = (arr) => {
    const len = arr.length, cum_sum = new (constructorOf(arr))(len + 1).fill(0);
    for (let i = 0; i < len; i++) {
        cum_sum[i + 1] = cum_sum[i] + arr[i];
    }
    return cum_sum;
};
/** conduct in-place unary arithmetic operations on numeric arrays
 * @category inplace
*/
const unaryArithmetic = (operation, arr, start, end) => {
    const [xs, xe] = resolveRange(start, end, arr.length);
    switch (operation) {
        case "abs": return abs(arr, xs, xe);
        case "neg": return neg(arr, xs, xe);
        case "comp": return bcomp(arr, xs, xe);
    }
};
/** conduct in-place scalar arithmetic operations on numeric arrays
 * @category inplace
*/
const scalarArithmetic = (operation, arr, value, start, end) => {
    const [xs, xe] = resolveRange(start, end, arr.length);
    switch (operation) {
        case "add": return add(arr, value, xs, xe);
        case "sub": return sub(arr, value, xs, xe);
        case "mult": return mult(arr, value, xs, xe);
        case "div": return div(arr, value, xs, xe);
        case "pow": return pow(arr, value, xs, xe);
        case "rem": return rem(arr, value, xs, xe);
        case "mod": return mod(arr, value, xs, xe);
        case "and": return band(arr, value, xs, xe);
        case "or": return bor(arr, value, xs, xe);
        case "xor": return bxor(arr, value, xs, xe);
        case "<<": return blsh(arr, value, xs, xe);
        case ">>": return brsh(arr, value, xs, xe);
        case ">>>": return bursh(arr, value, xs, xe);
    }
};
/// UNARY OPERATIONS
/** mutate array in-place to get **absolute** value of elements <br>
 * @category unaryOperator
 * @category inplace
 */
export const abs = (arr, start = 0, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] *= arr[i] < 0 ? -1 : 1;
    }
    return arr;
};
/** mutate array in-place to get **negative** value of elements <br>
 * @category unaryOperator
 * @category inplace
 */
export const neg = (arr, start = 0, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] *= -1;
    }
    return arr;
};
/** mutate array in-place to get **bitwise complement** value of elements <br>
 * @category unaryOperator
 * @category inplace
*/
export const bcomp = (arr, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] = ~arr[i];
    }
    return arr;
};
/// SCALAR OPERATIONS
/// TODO consider replacing some functions entirely with a linear function `y = ax + b`.
/** mutate array in-place to get **bitwise and** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const band = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] &= value;
    }
    return arr;
};
/** mutate array in-place to get **bitwise or** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const bor = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] |= value;
    }
    return arr;
};
/** mutate array in-place to get **bitwise xor** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const bxor = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] ^= value;
    }
    return arr;
};
/** mutate array in-place to get **bitwise left-shift** (`<<`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const blsh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] <<= value;
    }
    return arr;
};
/** mutate array in-place to get **bitwise right-shift** (`>>`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const brsh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] >>= value;
    }
    return arr;
};
/** mutate array in-place to get **bitwise unsigned right-shift** (`>>>`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const bursh = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] >>>= value;
    }
    return arr;
};
/** mutate array in-place to **add** a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const add = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] += value;
    }
    return arr;
};
/** mutate array in-place to **subtract** a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const sub = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] -= value;
    }
    return arr;
};
/** mutate array in-place to **multiply** by a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const mult = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] *= value;
    }
    return arr;
};
/** mutate array in-place to **divide** by a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const div = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] /= value;
    }
    return arr;
};
/** mutate array in-place to raise it to the **power** of a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export const pow = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] **= value;
    }
    return arr;
};
/** mutate array in-place to get the **remainder** (`%`) when divided by scalar `value` <br>
 * note that this is slightly different from the modulo {@link mod} operator, as this can have a negative sign <br>
 * @category scalarOperator
 * @category inplace
*/
export const rem = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] %= value;
    }
    return arr;
};
/** mutate array in-place to get the **modulo** when divided by scalar `value` <br>
 * note that this is slightly different from the remainder {@link rem} operator, as this always returns a positive number <br>
 * @category scalarOperator
 * @category inplace
*/
export const mod = (arr, value, start, end) => {
    start ??= 0;
    end ??= arr.length;
    for (let i = start; i < end; i++) {
        arr[i] = ((arr[i] % value) + value) % value;
    }
    return arr;
};
