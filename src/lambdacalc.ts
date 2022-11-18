/** utility functions for numeric array manipulation through lambda calculus (aka higher order functions, or `HOF`) <br>
 * many functions in the {@link numericarray} module can be recreated here with a much smaller minified-size footprint. <br>
 * naturally, this comes at a performance cost of around 5 times when dealing with complex equation with many parameters. <br>
 * however, when dealing with simple computations and few parameters (such as the addition of two arrays), lambdacalc functions
 * are exactly as fast as their `for...loop` counterparts, despite the abstraction. this is all thanks to modren JIT. <br>
 * check out my benchmarks if you're not convinced: (whom am I even speaking to besides myself? go commit sepuku concurrently)
 * - bechmark for abstracting arithmetics as a function then applying it over a loop (aka vectorization):
 *   - [link](https://gist.github.com/omar-azmi/27295d0e2b0116ccdbdf42e04ea51103)
 * - bechmark for testing different vectorization techniques against fastest possible `for...loop` computation:
 *   - [link](https://gist.github.com/omar-azmi/52795febf5789b6e8c9033afb703bba0)
 * @module
*/

import { ArrayFixedLength, IndexNumericMapFunc, NumericArray, NumericMapFunc } from "./typedefs.ts"

/** a `Vectorizer` is a function that takes in a scalar multivariable math function `map_func` (consisting of `ParamLength` number of variables) <br>
 * and applies that scalar function for each input parameters given by `input_arrs[:][i]`, then writes the numeric output to `write_to[i]` <br>
 * ie: $\forall i \in \left[0, \dots \text{write\_to.length} \right), \text{write\_to[i]} = \text{map\_func}\left( \text{input\_arrs[0][i]}, \text{input\_arrs[1][i]}, \dots, \text{input\_arrs[ParamLength - 1][i]} \right)$ <br>
 * under the hood, these tend to be just plain old `for...loop`, but the JIT does the clever part of figuring out that they're optimizable. <br>
 * @param map_func a scalar multivariable function. example: `add_func: NumericMapFunc<2> = (v1: number, v2: number) => v1 + v2`
 * @param write_to specify which array to write your output data to
 * @param input_arrs a list of `ParamLength` number of input arrays to be consumed by `map_func` as input
 * 
 * see {@link vectorize0}, ..., {@link vectorize5}, and {@link vectorizeN} to use the functions that implement this
*/
export type Vectorizer<
	ParamLength extends number,
	A extends NumericArray = any
> = (map_func: NumericMapFunc<ParamLength>, write_to: A, ...input_arrs: ArrayFixedLength<NumericArray, ParamLength>) => void

/** vectorize a zero parameter function <br>
 * @example
 * ```ts
 * const rand = () => 123 * Math.random()
 * const arr = new Float32Array(10_000)
 * vectorize0(rand, arr) // `arr` is now filled with random numbers
 * ```
 * despite being a simple operation with no inputs, this still performs 4 times quicker than `array.map`, probably due to the fact that `array.map` passes three arguments <br>
*/
export const vectorize0: Vectorizer<0> = (map_func, write_to) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func()
}

/** vectorize a one parameter function <br>
 * @example
 * ```ts
 * const abs = (v) => v >= 0 ? v : -v
 * const arr = new Float32Array(10_000).map(() => 123 * (Math.random() - 0.5))
 * vectorize1(rand, arr, arr) // `arr` is now filled with absolute valued random numbers
 * ```
*/
export const vectorize1: Vectorizer<1> = (map_func, write_to, arr1) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func(arr1[i])
}

/** vectorize a two parameter function <br>
 * @example
 * ```ts
 * const mult = (v1, v2) => v1 * v2
 * const arr1 = new Float32Array(10_000).map(() => 123 * (Math.random() - 0.5))
 * const arr2 = new Float32Array(10_000).map(() => 321 * (Math.random() - 0.5))
 * const arr = new Float32Array(10_000)
 * vectorize2(rand, arr, arr1, arr2) // `arr` is now filled with random numbers
 * ```
*/
export const vectorize2: Vectorizer<2> = (map_func, write_to, arr1, arr2) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func(arr1[i], arr2[i])
}

/** vectorize a three parameter function <br>
 * @example
 * ```ts
 * const linear = (x, a, b) => a * x + b
 * const arrX = new Float32Array(10_000).map(() => 123 * (Math.random() - 0.5))
 * const arrA = new Float32Array(10_000).map(() => 321 * (Math.random() - 0.5))
 * const arrB = new Float32Array(10_000).fill(42)
 * const arr = new Float32Array(10_000)
 * vectorize3(rand, arr, arrX, arrA, arrB)
 * ```
*/
export const vectorize3: Vectorizer<3> = (map_func, write_to, arr1, arr2, arr3) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func(arr1[i], arr2[i], arr3[i])
}

/** vectorize a four parameter function <br>
 * see {@link vectorize3} for lower parameter case
*/
export const vectorize4: Vectorizer<4> = (map_func, write_to, arr1, arr2, arr3, arr4) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i])
}

/** vectorize a five parameter function <br>
 * see {@link vectorize4} for lower parameter case
*/
export const vectorize5: Vectorizer<5> = (map_func, write_to, arr1, arr2, arr3, arr4, arr5) => {
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func(arr1[i], arr2[i], arr3[i], arr4[i], arr5[i])
}

/** {@link Vectorizer} function for arbitrary number of input parameters, <br>
 * but nearly 40 times slower than the numbered vectorized functions: {@link vectorize0} to {@link vectorize5}
*/
export const vectorizeN: Vectorizer<number> = (map_func, write_to, ...arrs) => {
	const param_length = arrs.length
	const params = Array(param_length).fill(0) as ArrayFixedLength<number, number>
	for (let i = 0; i < write_to.length; i++) {
		for (let p = 0; p < param_length; p++) params[p] = arrs[p][i]
		write_to[i] = map_func(...params)
	}
}

export type VectorizerIndex<
	ParamLength extends number,
	A extends NumericArray = any
> = (index_map_func: IndexNumericMapFunc<ParamLength>, write_to: A, ...input_arrs: ArrayFixedLength<NumericArray, ParamLength>) => void

/** TODO better documentation
 * @example
 * ```ts
 * declare const arrA: number[], arrB: number[], arrC: number[], arrD: number[], arrE: number[], arr: number[]
 * const add2_fromindex_HOF: IndexNumericMapFunc<2> = (a1, a2) => (i) => a1[i] + a2[i]
 * const poly4_fromindex_HOF: IndexNumericMapFunc<4> = (a1, a2, a3, a4) => (i) => a1[i] + a2[i] ** (3 / 2) + a3[i] ** (4 / 3) + a4[i] ** (5 / 4)
 * const add5_fromindex_HOF: IndexNumericMapFunc<5> = (a1, a2, a3, a4, a5) => (i) => a1[i] + a2[i] + a3[i] + a4[i] + a5[i]
 * vectorizeIndexHOF(add2_fromindex_HOF, arrC, arrA, arrB)
 * vectorizeIndexHOF(poly4_fromindex_HOF, arrE, arrA, arrB, arrC, arrD)
 * vectorizeIndexHOF(add5_fromindex_HOF, arr, arrA, arrB, arrC, arrD, arrE)
 * ```
*/
const vectorizeIndexHOF = <ParamLength extends number, A extends NumericArray = any>(index_map_func_hof: IndexNumericMapFunc<ParamLength>, write_to: A, ...input_arrs: ArrayFixedLength<NumericArray, ParamLength>): void => {
	const map_func_index = index_map_func_hof(...input_arrs)
	for (let i = 0; i < write_to.length; i++) write_to[i] = map_func_index(i)
}
