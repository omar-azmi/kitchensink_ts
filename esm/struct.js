/** utility functions for common object structures and `Object` manipulation.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import { array_isArray, object_defineProperty, object_getPrototypeOf } from "./builtin_aliases_deps.js";
/** get an equivalent rect where all dimensions are positive */
export const positiveRect = (r) => {
    let { x, y, width, height } = r;
    if (width < 0) {
        width *= -1; // width is now positive
        x -= width; // x has been moved further to the left
    }
    if (height < 0) {
        height *= -1; // height is now positive
        y -= height; // y has been moved further to the top
    }
    return { x, y, width, height };
};
/** get the constructor of a class's instance.
 * @example
 * ```ts
 * class K { constructor(value) { this.value = value } }
 * const a = new K(1)
 * const b = new (constructorOf(a))(2) // equivalent to `const b = new K(2)`
 * ```
*/
export const constructorOf = (class_instance) => {
    return object_getPrototypeOf(class_instance).constructor;
};
/** use the constructor of a class's instance to construct a new instance. <br>
 * this is useful for avoiding pollution of code with `new` keyword along with some wonky placement of braces to make your code work. <br>
 * @example
 * ```ts
 * class K { constructor(value1, value2) { this.value = value1 + value2 } }
 * const a = new K(1, 1)
 * const b = constructFrom(a, 2, 2) // equivalent to `const b = new K(2, 2)`
 * const c = new (Object.getPrototypeOf(a).constructor)(3, 3) // vanilla way of constructing `const c = new K(3, 3)` using `a`
 * ```
*/
export const constructFrom = (class_instance, ...args) => {
    return new (constructorOf(class_instance))(...args);
};
/** get the prototype object of a class. <br>
 * this is useful when you want to access bound-methods of an instance of a class, such as the ones declared as: `class X { methodOfProto(){ } }`. <br>
 * these bound methods are not available via destructure of an instance, because they then lose their `this` context. <br>
 * the only functions that can be destructured without losing their `this` context are the ones declared via assignment: `class X { fn = () => { }, fn2 = function(){ } }` <br>
 * @example
 * ```ts
 * const array_proto = prototypeOfClass(Array<number>)
 * let arr = [1, 2, 3, 4, 5]
 * array_proto.push(arr, 6)
 * console.log(arr) // [1, 2, 3, 4, 5, 6]
 * const push_to_arr = array_proto.push.bind(arr) // more performant than `push_to_arr = (value) => (arr.push(value))`, and also has lower memory footprint
 * push_to_arr(7, 8, 9)
 * console.log(arr) // [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * ```
*/
export const prototypeOfClass = (cls) => {
    return cls.prototype;
};
/** monkey patch the prototype of a class.
 *
 * TODO: give usage examples and situations where this will be useful.
*/
export const monkeyPatchPrototypeOfClass = (cls, key, value) => {
    object_defineProperty(prototypeOfClass(cls), key, { value });
};
/** check if `obj` is either an object or function. */
export const isComplex = (obj) => {
    const obj_type = typeof obj;
    return obj_type === "object" || obj_type === "function";
};
/** check if `obj` is neither an object nor a function. */
export const isPrimitive = (obj) => {
    return !isComplex(obj);
};
/** check if `obj` is a function.
 *
 * TODO: consider if it would be a good idea to include a generic parameter for the function's signature.
 * i.e.: `<FN extends Function = Function>(obj: any): obj is FN`
*/
export const isFunction = (obj) => {
    return typeof obj === "function";
};
/** check if `obj` is an `Object`. */
export const isObject = (obj) => {
    return typeof obj === "object";
};
/** check if `obj` is an array. */
export const isArray = array_isArray;
/** check if `obj` is a string. */
export const isString = (obj) => {
    return typeof obj === "string";
};
/** check if `obj` is a number. */
export const isNumber = (obj) => {
    return typeof obj === "number";
};
/** check if `obj` is a bigint. */
export const isBigint = (obj) => {
    return typeof obj === "bigint";
};
/** check if `obj` is either a number or a bigint. */
export const isNumeric = (obj) => {
    return typeof obj === "number" || typeof obj === "bigint";
};
/** check if `obj` is boolean. */
export const isBoolean = (obj) => {
    return typeof obj === "boolean";
};
/** check if `obj` is a symbol. */
export const isSymbol = (obj) => {
    return typeof obj === "symbol";
};
