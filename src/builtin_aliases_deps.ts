/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link ./builtin_aliases}. <br>
 * this module is also re-exported by `./mod.ts`, as it is also useful for external projects and helps in their minification when bundled.
 * @module
*/

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
	/** create a promise with external (i.e. outside of scope) resolve and reject controls */
	promise_outside = <T>(): [
		promise: Promise<T>,
		resolve: (value: T | PromiseLike<T>) => void,
		reject: (reason?: any) => void
	] => {
		let
			resolve: (value: T | PromiseLike<T>) => void,
			reject: (reason?: any) => void

		const promise = new Promise<T>((_resolve, _reject) => {
			resolve = _resolve
			reject = _reject
		})
		return [promise, resolve!, reject!]
	}

export const {
	from: array_from,
	isArray: array_isArray,
	of: array_of,
} = Array

export const {
	isInteger: number_isInteger,
	MAX_VALUE: number_MAX_VALUE,
	NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
	POSITIVE_INFINITY: number_POSITIVE_INFINITY,
} = Number

export const {
	assign: object_assign,
	create: object_create,
	defineProperty: object_defineProperty,
	entries: object_entries,
	fromEntries: object_fromEntries,
	getOwnPropertyDescriptor: object_getOwnPropertyDescriptor,
	getOwnPropertyDescriptors: object_getOwnPropertyDescriptors,
	getOwnPropertyNames: object_getOwnPropertyNames,
	getOwnPropertySymbols: object_getOwnPropertySymbols,
	keys: object_keys,
	getPrototypeOf: object_getPrototypeOf,
	setPrototypeOf: object_setPrototypeOf,
	values: object_values,
} = Object

export const object_getOwnPropertyKeys = <T extends object>(obj: T): (keyof T)[] => {
	return [
		... /* @__PURE__ */ object_getOwnPropertyNames(obj),
		... /* @__PURE__ */ object_getOwnPropertySymbols(obj),
	] as (keyof T)[]
}

export const object_getInheritedPropertyKeys = <T extends object>(obj: T): (keyof T)[] => {
	// TODO: `Object.prototype` can be minified had we used `prototypeOfClass` from `struct.ts`, but this file is intended to be dependency free.
	// consider moving the function `prototypeOfClass` to this file instead.
	const
		object_proto = Object.prototype,
		inherited_keys: (keyof T)[] = []
	while ((obj = object_getPrototypeOf(obj)) !== object_proto) {
		inherited_keys.push(...object_getOwnPropertyKeys(obj))
	}
	return [...(new Set(inherited_keys))]
}

export const object_getterPropertyKeys = <T extends object>(obj: T): (keyof T)[] => {
	return object_getOwnPropertyKeys(obj).filter((key) => ("get" in object_getOwnPropertyDescriptor(obj, key)!))
}

export const object_setterPropertyKeys = <T extends object>(obj: T): (keyof T)[] => {
	return object_getOwnPropertyKeys(obj).filter((key) => ("set" in object_getOwnPropertyDescriptor(obj, key)!))
}

export const date_now = Date.now

export const {
	iterator: symbol_iterator,
	toStringTag: symbol_toStringTag,
} = Symbol

export const {
	apply: reflect_apply,
	construct: reflect_construct,
	get: reflect_get,
	set: reflect_set,
} = Reflect

export const
	dom_setTimeout = setTimeout,
	dom_clearTimeout = clearTimeout,
	dom_setInterval = setInterval,
	dom_clearInterval = clearInterval
