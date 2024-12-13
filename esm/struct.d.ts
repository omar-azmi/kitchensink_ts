/** utility functions for common object structures and `Object` manipulation.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import type { ConstructorOf, PrototypeOf } from "./typedefs.js";
/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields. */
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/** represents an `ImageData` with optional color space information. */
export interface SimpleImageData extends Omit<ImageData, "colorSpace" | "data"> {
    data: Uint8ClampedArray | Uint8Array;
    colorSpace?: PredefinedColorSpace;
}
/** get an equivalent rect where all dimensions are positive. */
export declare const positiveRect: (r: Rect) => Rect;
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
export declare const constructorOf: <T, Args extends any[] = any[]>(class_instance: T) => ConstructorOf<T, Args>;
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
export declare const constructFrom: <T, Args extends any[] = any[]>(class_instance: T, ...args: Args) => T;
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
export declare const prototypeOfClass: <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>) => PrototypeOf<typeof cls>;
/** monkey patch the prototype of a class.
 *
 * TODO: give usage examples and situations where this will be useful.
*/
export declare const monkeyPatchPrototypeOfClass: <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>, key: keyof T, value: T[typeof key]) => void;
/** type definition of a primitive javascript object. */
export type PrimitiveObject = string | number | bigint | boolean | symbol | undefined;
/** type definition of a non-primitive javascript object. */
export type ComplexObject = object | Function;
/** check if `obj` is either an object or function. */
export declare const isComplex: (obj: any) => obj is ComplexObject;
/** check if `obj` is neither an object nor a function. */
export declare const isPrimitive: (obj: any) => obj is PrimitiveObject;
/** check if `obj` is a `function`.
 *
 * TODO: consider if it would be a good idea to include a generic parameter for the function's signature.
 * i.e.: `<FN extends Function = Function>(obj: any): obj is FN`
*/
export declare const isFunction: (obj: any) => obj is Function;
/** check if `obj` is an `Object`. */
export declare const isObject: <T extends object = object>(obj: any) => obj is T;
/** check if `obj` is an `Array`. */
export declare const isArray: (<T = any>(obj: any) => obj is Array<T>);
/** check if `obj` is a `string`. */
export declare const isString: (obj: any) => obj is string;
/** check if `obj` is a `number`. */
export declare const isNumber: (obj: any) => obj is number;
/** check if `obj` is a `bigint`. */
export declare const isBigint: (obj: any) => obj is bigint;
/** check if `obj` is either a `number` or a `bigint`. */
export declare const isNumeric: (obj: any) => obj is (number | bigint);
/** check if `obj` is `boolean`. */
export declare const isBoolean: (obj: any) => obj is boolean;
/** check if `obj` is a `symbol`. */
export declare const isSymbol: (obj: any) => obj is symbol;
//# sourceMappingURL=struct.d.ts.map