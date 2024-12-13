/** utility functions for common object structures and `Object` manipulation.
 * 
 * @module
*/
import "./_dnt.polyfills.js";


import { array_isArray, object_defineProperty, object_getPrototypeOf } from "./alias.js"
import type { ConstructorOf, PrototypeOf } from "./typedefs.js"


/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields. */
export type Rect = { x: number, y: number, width: number, height: number }

/** represents an `ImageData` with optional color space information. */
export interface SimpleImageData extends Omit<ImageData, "colorSpace" | "data"> {
	data: Uint8ClampedArray | Uint8Array
	colorSpace?: PredefinedColorSpace
}

/** get an equivalent rect where all dimensions are positive. */
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
