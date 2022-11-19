/** utility functions for numeric array manipulation and array math functions
 * @module
*/
import { NumericArray } from "./typedefs.js";
/** @alpha */
export declare const transpose2D: <T>(matrix: T[][]) => T[][];
/** compute the left-to-right running difference between successive elements <br>
 * the returned array's length is decremented by one. as a result, a single element array will turn into an empty array <br>
 * becareful when using with unsigned typed arrays <br>
 * @category copy
*/
export declare const diff: <A extends NumericArray = any>(arr: A, start?: number, end?: number) => A;
/** compute the right-to-left (ie reverse) running difference between preceding elements <br>
 * the returned array's length is decremented by one. as a result, a single element array will turn into an empty array <br>
 * becareful when using with unsigned typed arrays <br>
 * @category copy
*/
export declare const diff_right: <A extends NumericArray = any>(arr: A, start?: number, end?: number) => A;
export declare type unaryOperator = "abs" | "neg" | "comp";
export declare type scalarOperator = "add" | "sub" | "mult" | "div" | "pow" | "rem" | "mod" | "and" | "or" | "xor" | "<<" | ">>" | ">>>";
export declare type elementwiseOperator = scalarOperator;
/** mutate array in-place to get **absolute** value of elements <br>
 * @category unaryOperator
 * @category inplace
 */
export declare const abs: <A extends NumericArray = any>(arr: A, start?: number, end?: number) => A;
/** mutate array in-place to get **negative** value of elements <br>
 * @category unaryOperator
 * @category inplace
 */
export declare const neg: <A extends NumericArray = any>(arr: A, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise complement** value of elements <br>
 * @category unaryOperator
 * @category inplace
*/
export declare const bcomp: <A extends NumericArray = any>(arr: A, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise and** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const band: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise or** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const bor: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise xor** against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const bxor: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise left-shift** (`<<`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const blsh: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise right-shift** (`>>`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const brsh: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get **bitwise unsinged right-shift** (`>>>`) against a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const bursh: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to **add** a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const add: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to **subtract** a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const sub: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to **multiply** by a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const mult: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to **divide** by a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const div: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to raise it to the **power** of a scalar `value` <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const pow: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get the **remainder** (`%`) when divided by scalar `value` <br>
 * note that this is slightly different from the modulo {@link mod} operator, as this can have a negative sign <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const rem: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
/** mutate array in-place to get the **modulo** when divided by scalar `value` <br>
 * note that this is slightly different from the remainder {@link rem} operator, as this always returns a positive number <br>
 * @category scalarOperator
 * @category inplace
*/
export declare const mod: <A extends NumericArray = any>(arr: A, value: number, start?: number, end?: number) => A;
