/** utility functions for common object structures and `Object` manipulation.
 * 
 * @module
*/

import { array_isArray, number_POSITIVE_INFINITY, object_defineProperty, object_getOwnPropertyDescriptor, object_getOwnPropertyNames, object_getOwnPropertySymbols, object_getPrototypeOf } from "./alias.ts"
import { resolveRange } from "./array1d.ts"
import { max } from "./numericmethods.ts"
import type { ConstructorOf, PrototypeOf } from "./typedefs.ts"


/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields. */
export interface Rect {
	x: number
	y: number
	width: number
	height: number
}

/** represents an `ImageData` with optional color space information. */
export interface SimpleImageData extends Omit<ImageData, "colorSpace" | "data"> {
	data: Uint8ClampedArray | Uint8Array
	colorSpace?: PredefinedColorSpace
}

/** get an equivalent rectangle where the `height` and `width` are positive.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const
 * 	my_rect: Rect = { x: -20, y: 100, width: 50, height: -30 },
 * 	my_abs_rect = positiveRect(my_rect)
 * 
 * assertEquals(my_abs_rect, {
 * 	x: -20,
 * 	y: 70,
 * 	width: 50,
 * 	height: 30,
 * })
 * ```
*/
export const positiveRect = (r: Rect): Rect => {
	let { x, y, width, height } = r
	if (width < 0) {
		width *= -1 // width is now positive
		x -= width // x has been moved further to the left
	}
	if (height < 0) {
		height *= -1 // height is now positive
		y -= height // y has been moved further to the top
	}
	return { x, y, width, height }
}

/** get the constructor of a class's instance.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * class K { constructor(public value: any) { } }
 * 
 * const a = new K(1)
 * const b = new (constructorOf(a))(2) // equivalent to `const b = new K(2)`
 * 
 * a satisfies K
 * b satisfies K
 * assertEquals(a !== b, true)
 * ```
*/
export const constructorOf = <T, Args extends any[] = any[]>(class_instance: T): ConstructorOf<T, Args> => {
	return object_getPrototypeOf(class_instance).constructor
}

/** use the constructor of a class's instance to construct a new instance.
 * 
 * this is useful for avoiding pollution of code with `new` keyword along with some wonky placement of braces to make your code work.
 * 
 * @example
 * ```ts
 * class K {
 * 	value: number
 * 
 * 	constructor(value1: number, value2: number) {
 * 		this.value = value1 + value2
 * 	}
 * }
 * 
 * const a = new K(1, 1)
 * const b = constructFrom(a, 2, 2) // equivalent to `const b = new K(2, 2)`
 * 
 * // vanilla way of constructing `const c = new K(3, 3)` using `a`
 * const c = new (Object.getPrototypeOf(a).constructor)(3, 3)
 * 
 * a satisfies K
 * b satisfies K
 * c satisfies K
 * ```
*/
export const constructFrom = <T, Args extends any[] = any[]>(class_instance: T, ...args: Args): T => {
	return new (constructorOf(class_instance))(...args)
}

/** get the prototype object of a class.
 * 
 * this is useful when you want to access bound-methods of an instance of a class, such as the ones declared as:
 * 
 * ```ts ignore
 * class X {
 * 	methodOfProto() { }
 * }
 * ```
 * 
 * these bound methods are not available via destructure of an instance, because they then lose their `this` context.
 * the only functions that can be destructured without losing their `this` context are the ones declared via assignment:
 * 
 * ```ts ignore
 * class X {
 * 	fn = () => { }
 * 	fn2 = function () { }
 * }
 * ```
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const
 * 	array_proto = prototypeOfClass(Array<number>),
 * 	arr = [1, 2, 3, 4, 5]
 * 
 * array_proto.push.call(arr, 6)
 * assertEquals(arr, [1, 2, 3, 4, 5, 6])
 * 
 * const slow_push_to_arr = (...values: number[]) => (arr.push(...values))
 * // the following declaration is more performant than `slow_push_to_arr`,
 * // and it also has lower memory footprint.
 * const fast_push_to_arr = array_proto.push.bind(arr)
 * 
 * slow_push_to_arr(7, 8)  // sloww & bigg
 * fast_push_to_arr(9, 10) // quicc & smol
 * assertEquals(arr, [1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
 * ```
*/
export const prototypeOfClass = <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>): PrototypeOf<typeof cls> => {
	return cls.prototype
}

/** configuration options for slicing the prototype chain returned by {@link prototypeChainOfObject}.
 * 
 * only the following combination of options are supported:
 * - `start` and `end`
 * - `start` and `delta`
 * - `end` and `delta`
 * 
 * if all three options are defined, then the `delta` option will be ignored.
*/
export interface PrototypeChainOfObjectConfig {
	/** the inclusive starting depth of the returned prototype chain. defaults to `0`.
	 * 
	 * it can be one of the following:
	 * - a positive integer: slices the full prototype chain starting from the given index.
	 * - a negative integer: slices the full prototype chain starting from the end of the sequence.
	 * - an object: slices the full prototype chain starting from the point where the given object is found (inclusive).
	 *   if the object is not found then the `start` option will be treated as `0` (i.e. starting from beginning of the chain array).
	*/
	start?: number | Object

	/** the exclusive ending depth of the returned prototype chain. defaults to `-1`.
	 * 
	 * it can be one of the following:
	 * - a positive integer: slices the full prototype chain ending at the given index.
	 * - a negative integer: slices the full prototype chain from the end of the sequence.
	 * - an object or `null`: slices the full prototype chain ending at the point where the given object is found (exclusive).
	 *   if the object is not found then the `end` option will be treated as `-1` (i.e. ending at the end of the chain array).
	*/
	end?: number | Object | null

	/** the additional depth to traverse on top of either {@link start} or {@link end}.
	 * make sure that you always provide a positive number.
	 * 
	 * - when the `start` option is specified, you will be given `delta` number of prototype elements after the starting point.
	 * - when the `end` option is specified, you will be given `delta` number of prototype elements before the ending point.
	*/
	delta?: number
}

/** get the prototype chain of an object, with optional slicing options.
 * 
 * @param obj the object whose prototype chain is to be found.
 * @param config optional configuration for slicing the full prototype chain.
 * @returns the sliced prototype chain of the given object.
 * 
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const
 * 	fn = prototypeChainOfObject,
 * 	eq = assertEquals
 * 
 * class A extends Array { }
 * class B extends A { }
 * class C extends B { }
 * class D extends C { }
 * 
 * const
 * 	a = new A(0),
 * 	b = new B(0),
 * 	c = new C(0),
 * 	d = new D(0)
 * 
 * eq(fn(d), [D.prototype, C.prototype, B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * eq(fn(b), [B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * 
 * // slicing the prototype chain, starting from index 2 till the end
 * eq(fn(d, { start: 2 }), [B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * 
 * // slicing using a negative index
 * eq(fn(d, { start: -2 }), [Object.prototype, null])
 * 
 * // slicing using an object
 * eq(fn(d, { start: B.prototype }), [B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * 
 * // when the slicing object is not found, the start index will be assumed to be `0` (default value)
 * eq(fn(d, { start: Set.prototype }), [D.prototype, C.prototype, B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * 
 * // slicing between the `start` index (inclusive) and the end index
 * eq(fn(d, { start: 2, end:    6 }), [B.prototype, A.prototype, Array.prototype, Object.prototype])
 * eq(fn(d, { start: 2, end:   -1 }), [B.prototype, A.prototype, Array.prototype, Object.prototype])
 * eq(fn(d, { start: 2, end: null }), [B.prototype, A.prototype, Array.prototype, Object.prototype])
 * 
 * // if the end index is not found, the slicing will occur till the end
 * eq(fn(d, { end: Set.prototype}), [D.prototype, C.prototype, B.prototype, A.prototype, Array.prototype, Object.prototype, null])
 * 
 * // slicing using a `delta` argument will let you define how many elements you wish to:
 * // - traverse forward from the `start` index
 * // - traverse backwards from the `end` index
 * eq(fn(d, { start:  2, delta: 3 }), [B.prototype, A.prototype, Array.prototype])
 * eq(fn(d, { end:   -2, delta: 2 }), [A.prototype, Array.prototype])
 * eq(fn(d, { end: null, delta: 4 }), [B.prototype, A.prototype, Array.prototype, Object.prototype])
 * 
 * eq(fn(d,  { start: 1, delta: 1 }), fn(c,  { start: 0, delta: 1 }))
 * eq(fn(c,  { start: 1, delta: 1 }), fn(b,  { start: 0, delta: 1 }))
 * eq(fn(b,  { start: 1, delta: 1 }), fn(a,  { start: 0, delta: 1 }))
 * eq(fn(a,  { start: 1, delta: 1 }), fn([], { start: 0, delta: 1 }))
 * eq(fn([], { start: 1, delta: 1 }), fn({}, { start: 0, delta: 1 }))
 * 
 * // you cannot acquire the prototype chain of the `null` object
 * assertThrows(() => { fn(null) })
 * ```
*/
export function prototypeChainOfObject(obj: any, config: PrototypeChainOfObjectConfig = {}): object[] {
	let { start, end, delta } = config
	const full_chain: object[] = []
	// collecting the full prototype chain, until `obj` becomes `null`, which is always the last thing in a prototype chain.
	while ((obj = object_getPrototypeOf(obj))) { full_chain.push(obj) }
	full_chain.push(null as unknown as Object)
	const full_chain_length = full_chain.length
	if (isObject(start)) {
		start = max(0, full_chain.indexOf(start))
	}
	if (isObject(end)) {
		const end_index = full_chain.indexOf(end)
		end = end_index < 0 ? undefined : end_index
	}
	// both `start` and `end` are either numbers or undefined now.
	if ((delta !== undefined) && ((start ?? end) !== undefined)) {
		// in here, `delta` is defined and one of either `start` or `end` is undefined
		if (start !== undefined) { end = (start as number) + delta }
		else { start = (end as number) - delta }
	}
	// now that any potential `delta` has been resolved into a `start` and `end`,
	// we only need to resolve possible negative indexes and then slice the prototype chain
	[start, end] = resolveRange(start as number | undefined, end as number | undefined, full_chain_length)
	return full_chain.slice(start as number | undefined, end as number | undefined)
}

/** get an object's list of **owned** keys (string keys and symbol keys).
 * 
 * > [!note]
 * > **owned** keys of an object are not the same as just _any_ key of the object.
 * > an owned key is one that it **directly** owned by the object, not owned through inheritance, such as the class methods.
 * > more precisely, in javascript, which ever member of an object that we call a _property_, is an **owned** key.
 * 
 * if you wish to acquire **all remaining** inherited keys of an object, you will want use {@link getInheritedPropertyKeys}.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const
 * 	symbol_h = Symbol("symbol h"),
 * 	symbol_i = Symbol("symbol i"),
 * 	symbol_j = Symbol("symbol j")
 * 
 * class A {
 * 	a = { v: 1 }
 * 	b = { v: 2 }
 * 	c: { v: number }
 * 	d() { return { v: 4 } }
 * 	e() { return { v: 5 } }
 * 	f = () => { return { v: 6 } }
 * 	g: () => ({ v: number })
 * 	[symbol_h]() { return { v: 8 } }
 * 	[symbol_i] = () => { return { v: 9 } }
 * 
 * 	constructor() {
 * 		this.c = { v: 3 }
 * 		this.g = () => { return { v: 7 } }
 * 	}
 * }
 * 
 * class B extends A {
 * 	override a = { v: 11 }
 * 	override e() { return { v: 15 } }
 * 	//@ts-ignore: typescript does not permit defining a method over the name of an existing property
 * 	override g() { return { v: 17 } }
 * 	[symbol_j] = () => { return { v: 20 } }
 * 
 * 	constructor() { super() }
 * }
 * 
 * const
 * 	a = new A(),
 * 	b = new B()
 * 
 * assertEquals(b.a, { v: 11 })
 * assertEquals(b.b, { v: 2 })
 * assertEquals(b.c, { v: 3 })
 * assertEquals(b.d(), { v: 4 })
 * assertEquals(b.e(), { v: 15 })
 * assertEquals(b.f(), { v: 6 })
 * assertEquals(b.g(), { v: 7 }) // notice that the overridden method is not called, and the property is called instead
 * assertEquals(Object.getPrototypeOf(b).g(), { v: 17 })
 * assertEquals(b[symbol_h](), { v: 8 })
 * assertEquals(b[symbol_i](), { v: 9 })
 * assertEquals(b[symbol_j](), { v: 20 })
 * 
 * assertEquals(
 * 	new Set(getOwnPropertyKeys(a)),
 * 	new Set(["a", "b", "c", "f", "g", symbol_i]),
 * )
 * assertEquals(
 * 	new Set(getOwnPropertyKeys(Object.getPrototypeOf(a))),
 * 	new Set(["constructor", "d", "e", symbol_h]),
 * )
 * assertEquals(
 * 	new Set(getOwnPropertyKeys(b)),
 * 	new Set(["a", "b", "c", "f", "g", symbol_i, symbol_j]),
 * )
 * assertEquals(
 * 	new Set(getOwnPropertyKeys(Object.getPrototypeOf(b))),
 * 	new Set(["constructor", "e", "g"]),
 * )
 * ```
*/
export const getOwnPropertyKeys = <T extends object>(obj: T): (keyof T)[] => {
	return [
		...object_getOwnPropertyNames(obj),
		...object_getOwnPropertySymbols(obj),
	] as (keyof T)[]
}

/** get all **inherited** list of keys (string keys and symbol keys) of an object, up till a certain `depth`.
 * 
 * directly owned keys will not be returned.
 * for that, you should use the {@link getOwnPropertyKeys} function.
 * 
 * the optional `depth` parameter lets you control how deep you'd like to go collecting the inherited keys.
 * 
 * @param obj the object whose inherited keys are to be listed.
 * @param depth the inheritance depth until which the function will accumulate keys for.
 *   - if an object `A` is provided as the `depth`,
 *     then all inherited keys up until `A` is reached in the inheritance chain will be collected, but not including the keys of `A`.
 *   - if a number `N` is provided as the `depth`,
 *     then the function will collect keys from `N` number of prototypes up the inheritance chain.
 *     - a depth of `0` would imply no traversal.
 *     - a depth of `1` would only traverse the first direct prototype of `obj` (i.e. `getOwnPropertyKeys(Object.getPrototypeOf(obj))`).
 *   @defaultValue `Object.prototype`
 * @returns an array of keys that the object has inherited (string or symbolic keys).
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * const
 * 	symbol_h = Symbol("symbol h"),
 * 	symbol_i = Symbol("symbol i"),
 * 	symbol_j = Symbol("symbol j")
 * 
 * class A {
 * 	a = { v: 1 }
 * 	b = { v: 2 }
 * 	c: { v: number }
 * 	d() { return { v: 4 } }
 * 	e() { return { v: 5 } }
 * 	f = () => { return { v: 6 } }
 * 	g: () => ({ v: number })
 * 	[symbol_h]() { return { v: 8 } }
 * 	[symbol_i] = () => { return { v: 9 } }
 * 
 * 	constructor() {
 * 		this.c = { v: 3 }
 * 		this.g = () => { return { v: 7 } }
 * 	}
 * }
 * 
 * class B extends A {
 * 	override a = { v: 11 }
 * 	override e() { return { v: 15 } }
 * 	//@ts-ignore: typescript does not permit defining a method over the name of an existing property
 * 	override g() { return { v: 17 } }
 * 	[symbol_j] = () => { return { v: 20 } }
 * 
 * 	constructor() { super() }
 * }
 * 
 * const
 * 	a = new A(),
 * 	b = new B()
 * 
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(a)),
 * 	new Set(["constructor", "d", "e", symbol_h]),
 * )
 * 
 * // below, notice how the inherited keys of `a` equal to its prototype's owned keys.
 * // this is because methods of instances of `A` are defined on the prototype (i.e. properties of the prototype, rather than the instances').
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(a)),
 * 	new Set(getOwnPropertyKeys(A.prototype)),
 * )
 * 
 * // also notice that inherited keys of `A.prototype` comes out as empty here,
 * // even though it does techinally inherit members from its own prototype (which is `Object.prototype`).
 * // the reason is that by default, we do not go deeper than `Object.prototype` to look for more keys.
 * // this is because from an end-user's perspective, those keys are not useful.
 * assertEquals(
 * 	getInheritedPropertyKeys(A.prototype),
 * 	[],
 * )
 * 
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b)),
 * 	new Set(["constructor", "e", "g", "d", symbol_h]),
 * )
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b)),
 * 	new Set([
 * 		...getOwnPropertyKeys(B.prototype),
 * 		...getInheritedPropertyKeys(B.prototype),
 * 	]),
 * )
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(B.prototype)),
 * 	new Set(["constructor", "e", "d", symbol_h]),
 * )
 * 
 * // testing out various depth
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(a, 1)),
 * 	new Set(getOwnPropertyKeys(A.prototype)),
 * )
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b, 1)),
 * 	new Set(getOwnPropertyKeys(B.prototype)),
 * )
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b, A.prototype)),
 * 	new Set(getOwnPropertyKeys(B.prototype)),
 * )
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b, 2)),
 * 	new Set([
 * 		...getOwnPropertyKeys(B.prototype),
 * 		...getOwnPropertyKeys(A.prototype),
 * 	]),
 * )
 * // below, we collect all inherited keys of `b`, including those that come from `Object.prototype`,
 * // which is the base ancestral prototype of all objects.
 * // to do that, we set the `depth` to `null`, which is the prototype of `Object.prototype`.
 * // the test below may fail in new versions of javascript, where 
 * assertEquals(
 * 	new Set(getInheritedPropertyKeys(b, null)),
 * 	new Set([
 * 		"constructor", "e", "g", "d", symbol_h,
 * 		"__defineGetter__", "__defineSetter__", "hasOwnProperty", "__lookupGetter__", "__lookupSetter__",
 * 		"isPrototypeOf", "propertyIsEnumerable", "toString", "valueOf", "toLocaleString",
 * 	]),
 * )
 * ```
*/
export const getInheritedPropertyKeys = <T extends object>(obj: T, depth: (number | Object | null) = prototypeOfClass(Object)): (keyof T)[] => {
	// weird but expected facts:
	// - `Object.prototype !== Object.getPrototypeOf(Object)`
	// - `Object.prototype === Object.getPrototypeOf({})`
	// - `null === Object.getPrototypeOf(Object.prototype)`
	// - `you === "ugly"`
	const
		prototype_chain = prototypeChainOfObject(obj, { start: 0, end: depth }),
		inherited_keys: (keyof T)[] = prototype_chain
			.map((prototype) => (getOwnPropertyKeys(prototype)))
			.flat(1)
	return [...(new Set(inherited_keys))]
}

/** get all **owned** getter property keys of an object `obj` (string keys and symbol keys).
 * 
 * TODO: in the future, consider creating a `getInheritedGetterKeys` function with the same signature as `getInheritedPropertyKeys`.
 * 
 * > [!note]
 * > inherited getter property keys will not be included.
 * > only directly defined getter property keys (aka owned keys) will be listed.
*/
export const getOwnGetterKeys = <T extends object>(obj: T): (keyof T)[] => {
	return getOwnPropertyKeys(obj).filter((key) => ("get" in object_getOwnPropertyDescriptor(obj, key)!))
}

/** get all **owned** setter property keys of an object `obj` (string keys and symbol keys).
 * 
 * TODO: in the future, consider creating a `getInheritedSetterKeys` function with the same signature as `getInheritedPropertyKeys`.
 * 
 * > [!note]
 * > inherited setter property keys will not be included.
 * > only directly defined setter property keys (aka owned keys) will be listed.
*/
export const getOwnSetterKeys = <T extends object>(obj: T): (keyof T)[] => {
	return getOwnPropertyKeys(obj).filter((key) => ("set" in object_getOwnPropertyDescriptor(obj, key)!))
}

/** monkey patch the prototype of a class.
 * 
 * TODO: give usage examples and situations where this will be useful.
*/
export const monkeyPatchPrototypeOfClass = <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>, key: keyof T, value: T[typeof key]): void => {
	object_defineProperty(prototypeOfClass(cls), key, { value })
}

/** type definition of a primitive javascript object. */
export type PrimitiveObject = string | number | bigint | boolean | symbol | undefined

/** type definition of a non-primitive javascript object. */
export type ComplexObject = object | Function

/** check if `obj` is either an object or function. */
export const isComplex = (obj: any): obj is ComplexObject => {
	const obj_type = typeof obj
	return obj_type === "object" || obj_type === "function"
}

/** check if `obj` is neither an object nor a function. */
export const isPrimitive = (obj: any): obj is PrimitiveObject => {
	return !isComplex(obj)
}

/** check if `obj` is a `function`.
 * 
 * TODO: consider if it would be a good idea to include a generic parameter for the function's signature.
 * i.e.: `<FN extends Function = Function>(obj: any): obj is FN`
*/
export const isFunction = (obj: any): obj is Function => {
	return typeof obj === "function"
}

/** check if `obj` is an `Object`. */
export const isObject = <T extends object = object>(obj: any): obj is T => {
	return typeof obj === "object"
}

/** check if `obj` is an `Array`. */
export const isArray: (<T = any>(obj: any) => obj is Array<T>) = array_isArray

/** check if `obj` is a `string`. */
export const isString = (obj: any): obj is string => {
	return typeof obj === "string"
}

/** check if `obj` is a `number`. */
export const isNumber = (obj: any): obj is number => {
	return typeof obj === "number"
}

/** check if `obj` is a `bigint`. */
export const isBigint = (obj: any): obj is bigint => {
	return typeof obj === "bigint"
}

/** check if `obj` is either a `number` or a `bigint`. */
export const isNumeric = (obj: any): obj is (number | bigint) => {
	return typeof obj === "number" || typeof obj === "bigint"
}

/** check if `obj` is `boolean`. */
export const isBoolean = (obj: any): obj is boolean => {
	return typeof obj === "boolean"
}

/** check if `obj` is a `symbol`. */
export const isSymbol = (obj: any): obj is symbol => {
	return typeof obj === "symbol"
}
