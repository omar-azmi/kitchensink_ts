/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link "builtin_aliases"}. <br>
 * this module is also re-exported by {@link "mod"}, as it is also useful for external projects and helps in their minification when bundled.
 * 
 * @module
*/

import type { MaybePromiseLike } from "./typedefs.ts"

export const
	/** a no-operation function */
	noop: () => void = () => { },
	/** test if an array is empty */
	array_isEmpty = (array: ArrayLike<any>): boolean => (array.length === 0),
	string_fromCharCode = String.fromCharCode,
	/** turn a string to uppercase */
	string_toUpperCase = (str: string) => str.toUpperCase(),
	/** turn a string to lowercase */
	string_toLowerCase = (str: string) => str.toLowerCase(),
	/** create a promise that resolves immediately */
	promise_resolve = /*@__PURE__*/ Promise.resolve.bind(Promise),
	/** create a promise that rejects immediately */
	promise_reject = /*@__PURE__*/ Promise.reject.bind(Promise),
	/** create a promise that never resolves */
	promise_forever = <T>() => new Promise<T>(noop),
	/** create a promise with external (i.e. outside of scope) resolve and reject controls.
	 * this was created before the existence of {@link Promise.withResolvers}.
	 * if you'd like to use that instead, see the alias {@link promise_withResolvers}.
	*/
	promise_outside = <T>(): [
		promise: Promise<T>,
		resolve: (value: MaybePromiseLike<T>) => void,
		reject: (reason?: any) => void
	] => {
		let
			resolve: (value: MaybePromiseLike<T>) => void,
			reject: (reason?: any) => void

		const promise = new Promise<T>((_resolve, _reject) => {
			resolve = _resolve
			reject = _reject
		})
		return [promise, resolve!, reject!]
	},
	/** create a promise with external resolver and rejecter functions, provided in an object form.
	 * if you'd like a more minifiable version, consider using the array equivalent: {@link promise_outside}.
	*/
	promise_withResolvers = () => Promise.withResolvers(),
	/** get the current high-precision time in milliseconds. */
	performance_now = () => performance.now()

export const {
	from: array_from,
	isArray: array_isArray,
	of: array_of,
} = Array

export const {
	MAX_VALUE: number_MAX_VALUE,
	NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
	POSITIVE_INFINITY: number_POSITIVE_INFINITY,
	isFinite: number_isFinite,
	isInteger: number_isInteger,
	isNaN: number_isNaN,
	parseFloat: number_parseFloat,
	parseInt: number_parseInt,
} = Number

export const {
	max: math_max,
	min: math_min,
	random: math_random,
} = Math

export const {
	assign: object_assign,
	defineProperty: object_defineProperty,
	entries: object_entries,
	fromEntries: object_fromEntries,
	keys: object_keys,
	getPrototypeOf: object_getPrototypeOf,
	values: object_values,
} = Object

export const date_now = Date.now

export const {
	iterator: symbol_iterator,
	toStringTag: symbol_toStringTag,
} = Symbol

export const
	dom_setTimeout = setTimeout,
	dom_clearTimeout = clearTimeout,
	dom_setInterval = setInterval,
	dom_clearInterval = clearInterval

export const {
	assert: console_assert,
	clear: console_clear,
	debug: console_debug,
	dir: console_dir,
	error: console_error,
	log: console_log,
	table: console_table,
} = console
