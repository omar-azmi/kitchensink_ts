/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link ./builtin_aliases}. <br>
 * 
 * nothing here is re-exported by `./mod.ts`. you will have to import this file directly to use any alias.
 * @module
*/

export const {
	from: array_from,
	isArray: array_isArray,
	of: array_of,
} = Array

export const
	array_isEmpty = (array: ArrayLike<any>): boolean => (array.length === 0),
	string_fromCharCode = String.fromCharCode,
	promise_resolve = Promise.resolve

export const {
	isInteger: number_isInteger,
	MAX_VALUE: number_MAX_VALUE,
	NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
	POSITIVE_INFINITY: number_POSITIVE_INFINITY,
} = Number

export const {
	assign: object_assign,
	getPrototypeOf: object_getPrototypeOf
} = Object

export const {
	iterator: symbol_iterator,
	toStringTag: symbol_toStringTag,
} = Symbol
