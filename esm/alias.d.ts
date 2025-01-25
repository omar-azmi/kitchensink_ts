/** a huge collection of aliases for built-in javascript objects and functions.
 * using the exports from this submodule will let you greatly minify your code,
 * and also reduce the number of dynamic function dispatches on built-in class's static methods.
 *
 * > [!warning]
 * > micro-optimization is **BAD** - _people of the old_. <br>
 * > micro-optimization might result in poorer JIT performance - _some old timer_. <br>
 * > micro-optimization is what you do as a bad programmer - _linus torvalds (not)_. <br>
 * > micro-optimization costs millions to revert - _linus tech tips (not)_.
 *
 * ## export naming convention
 *
 * the objects/functions exported by this submodule follow the following naming convention:
 * - the name starts with a lowercase version of the built-in class/object.
 *   so for instance, `Math` becomes `math`.
 * - followed by an underscore (`"_"`)
 * - followed by the name of the method/property of that object.
 *
 * ### examples
 *
 * - `ThingName.MethodName` -> `thingname_MethodName`
 * - `Math.max` -> `math_max`
 * - `Object.fromEntries` -> `object_fromEntries`
 * - `Array.isArray` -> `array_isArray`
 * - `performance.now` -> `performance_now`
 * - `console.log` -> `console_log`
 *
 * ## minifiablility
 *
 * this submodule needs esbuild's intelligent minifier to shrink it down in it size.
 *
 * each export is declared separately for two reasons:
 * - using destructuring, such as `export const { from, isArray, of } = Array`, is not tree-shakable by esbuild,
 *   because destructuring _may_ have property-accessor side effects (even though it isn't the case here).
 *   as such, it is impossible to instruct esbuild that a statement is "pure" (i.e. free of side effects).
 *   and so, we will be left with a ton of unused exported baggage that will end up in the final bundle.
 * - we cannot add documentation comment to destructured variables, and so, our documentation coverage score will drastically drop.
 *
 * the only way to tell esbuild that an expression is "pure" is when a `"@__PURE__"` multiline comment is added before a
 * _function call_ (yes, it has to be a function call). this way, esbuild will tree shake the assigned variable if it is not used.
 *
 * moreover, esbuild will also evaluate simple iife (immediately invoked function expression), such as the following:
 *
 * ```ts
 * // unminified iife
 * const a = (() => 5 * 2)() // a = 10
 * ```
 *
 * ```ts
 * // minified expression generated by esbuild:
 * const a = 10
 * ```
 *
 * using a combination of the "pure" annotation and the iife evaluatation feature of esbuild, we can create minifiable and tree-shakable aliases:
 *
 * ```ts ignore
 * // unminified iife
 * const math_constructor = Math
 * export const math_max = /* @__PURE__ *\/ (() => math_constructor.max)()
 * export const math_min = /* @__PURE__ *\/ (() => math_constructor.min)()
 * ```
 *
 * ```ts ignore
 * // resulting minified and tree-shakable expression generated by esbuild:
 * const
 * 	a = Math,
 * 	b = a.max,
 * 	c = a.min
 * export { b as math_max, c as math_min }
 * ```
 *
 * ## aliases used by this library (`@oazmi/kitchensink`)
 *
 * the following static method aliases are used internally by this library.
 * so importing any these aliases will likely not add any additional size to your minified scripts.
 *
 * ### `Array`
 * - `from`
 * - `fromAsync`
 * - `isArray`
 * - `of`
 *
 * ### `Date`
 * - `now`
 *
 * ### `Math`
 * - `max`
 * - `min`
 * - `random`
 *
 * ### `Number`
 * - `MAX_VALUE`
 * - `isInteger`
 * - `parseInt`
 *
 * ### `Object`
 * - `assign`
 * - `defineProperty`
 * - `entries`
 * - `getPrototypeOf`
 *
 * ### `Promise`
 * - `resolve`
 *
 * ### `String`
 * - `fromCharCode`
 *
 * ### `Symbol`
 * - `iterator`
 * - `toStringTag`
 *
 * ### `console`
 * - `assert`
 * - `error`
 * - `log`
 * - `table`
 *
 * ### `performance`
 * - `now`
 *
 * ### built-in `window` functions
 * - `clearInterval`
 * - `clearTimeout`
 * - `encodeURI`
 * - `setInterval`
 * - `setTimeout`
 *
 * @module
*/
import "./_dnt.polyfills.js";
import type { MaybePromiseLike } from "./typedefs.js";
/** a no-operation function */
export declare const noop: () => void;
/** test if an array is empty */
export declare const array_isEmpty: (array: ArrayLike<any>) => boolean;
/** alias for `Array.from`. */
export declare const array_from: ArrayConstructor["from"];
/** alias for `Array.fromAsync`. */
export declare const array_fromAsync: ArrayConstructor["fromAsync"];
/** alias for `Array.isArray`. but I'd recommend using {@link isArray} instead. */
export declare const array_isArray: ArrayConstructor["isArray"];
/** alias for `Array.of`. */
export declare const array_of: ArrayConstructor["of"];
/** alias for `BigInt.asIntN`. */
export declare const bigint_asIntN: BigIntConstructor["asIntN"];
/** alias for `BigInt.asUintN`. */
export declare const bigint_asUintN: BigIntConstructor["asUintN"];
/** alias for `Date.UTC`. */
export declare const date_UTC: DateConstructor["UTC"];
/** alias for `Date.now`. */
export declare const date_now: DateConstructor["now"];
/** alias for `Date.parse`. */
export declare const date_parse: DateConstructor["parse"];
/** alias for `JSON.parse`. */
export declare const json_parse: JSON["parse"];
/** alias for `JSON.stringify`. */
export declare const json_stringify: JSON["stringify"];
/** alias for `Math.max`. */
export declare const math_max: Math["max"];
/** alias for `Math.min`. */
export declare const math_min: Math["min"];
/** alias for `Math.sign`. */
export declare const math_sign: Math["sign"];
/** alias for `Math.ceil`. */
export declare const math_ceil: Math["ceil"];
/** alias for `Math.floor`. */
export declare const math_floor: Math["floor"];
/** alias for `Math.fround`. */
export declare const math_fround: Math["fround"];
/** alias for `Math.round`. */
export declare const math_round: Math["round"];
/** alias for `Math.trunc`. but I'd recommend using `const my_int = my_float | 0` for truncating a float. */
export declare const math_trunc: Math["trunc"];
/** alias for `Math.acos`. */
export declare const math_acos: Math["acos"];
/** alias for `Math.acosh`. */
export declare const math_acosh: Math["acosh"];
/** alias for `Math.asin`. */
export declare const math_asin: Math["asin"];
/** alias for `Math.asinh`. */
export declare const math_asinh: Math["asinh"];
/** alias for `Math.atan`. */
export declare const math_atan: Math["atan"];
/** alias for `Math.atan2`. */
export declare const math_atan2: Math["atan2"];
/** alias for `Math.atanh`. */
export declare const math_atanh: Math["atanh"];
/** alias for `Math.cos`. */
export declare const math_cos: Math["cos"];
/** alias for `Math.cosh`. */
export declare const math_cosh: Math["cosh"];
/** alias for `Math.sin`. */
export declare const math_sin: Math["sin"];
/** alias for `Math.sinh`. */
export declare const math_sinh: Math["sinh"];
/** alias for `Math.tan`. */
export declare const math_tan: Math["tan"];
/** alias for `Math.tanh`. */
export declare const math_tanh: Math["tanh"];
/** alias for `Math.abs`. */
export declare const math_abs: Math["abs"];
/** alias for `Math.cbrt`. */
export declare const math_cbrt: Math["cbrt"];
/** alias for `Math.exp`. */
export declare const math_exp: Math["exp"];
/** alias for `Math.expm1`. */
export declare const math_expm1: Math["expm1"];
/** alias for `Math.log`. */
export declare const math_log: Math["log"];
/** alias for `Math.log10`. */
export declare const math_log10: Math["log10"];
/** alias for `Math.log1p`. */
export declare const math_log1p: Math["log1p"];
/** alias for `Math.log2`. */
export declare const math_log2: Math["log2"];
/** alias for `Math.pow`. */
export declare const math_pow: Math["pow"];
/** alias for `Math.sqrt`. */
export declare const math_sqrt: Math["sqrt"];
/** alias for `Math.clz32`. */
export declare const math_clz32: Math["clz32"];
/** alias for `Math.imul`. */
export declare const math_imul: Math["imul"];
/** alias for `Math.hypot`. */
export declare const math_hypot: Math["hypot"];
/** alias for `Math.random`. */
export declare const math_random: Math["random"];
/** alias for `Math.E`. */
export declare const math_E: Math["E"];
/** alias for `Math.LN10`. */
export declare const math_LN10: Math["LN10"];
/** alias for `Math.LN2`. */
export declare const math_LN2: Math["LN2"];
/** alias for `Math.LOG10E`. */
export declare const math_LOG10E: Math["LOG10E"];
/** alias for `Math.LOG2E`. */
export declare const math_LOG2E: Math["LOG2E"];
/** alias for `Math.PI`. */
export declare const math_PI: Math["PI"];
/** alias for `Math.SQRT1_2`. */
export declare const math_SQRT1_2: Math["SQRT1_2"];
/** alias for `Math.SQRT2`. */
export declare const math_SQRT2: Math["SQRT2"];
/** alias for `Number.EPSILON`. */
export declare const number_EPSILON: NumberConstructor["EPSILON"];
/** alias for `Number.MAX_SAFE_INTEGER`. */
export declare const number_MAX_SAFE_INTEGER: NumberConstructor["MAX_SAFE_INTEGER"];
/** alias for `Number.MAX_VALUE`. */
export declare const number_MAX_VALUE: NumberConstructor["MAX_VALUE"];
/** alias for `Number.MIN_SAFE_INTEGER`. */
export declare const number_MIN_SAFE_INTEGER: NumberConstructor["MIN_SAFE_INTEGER"];
/** alias for `Number.MIN_VALUE`. */
export declare const number_MIN_VALUE: NumberConstructor["MIN_VALUE"];
/** alias for `Number.NEGATIVE_INFINITY`. */
export declare const number_NEGATIVE_INFINITY: NumberConstructor["NEGATIVE_INFINITY"];
/** alias for `Number.NaN`. */
export declare const number_NaN: NumberConstructor["NaN"];
/** alias for `Number.POSITIVE_INFINITY`. */
export declare const number_POSITIVE_INFINITY: NumberConstructor["POSITIVE_INFINITY"];
/** alias for `Number.isFinite`. */
export declare const number_isFinite: NumberConstructor["isFinite"];
/** alias for `Number.isInteger`. */
export declare const number_isInteger: NumberConstructor["isInteger"];
/** alias for `Number.isNaN`. */
export declare const number_isNaN: NumberConstructor["isNaN"];
/** alias for `Number.isSafeInteger`. */
export declare const number_isSafeInteger: NumberConstructor["isSafeInteger"];
/** alias for `Number.parseFloat`. */
export declare const number_parseFloat: NumberConstructor["parseFloat"];
/** alias for `Number.parseInt`. */
export declare const number_parseInt: NumberConstructor["parseInt"];
/** alias for `Object.assign`. */
export declare const object_assign: ObjectConstructor["assign"];
/** alias for `Object.create`. */
export declare const object_create: ObjectConstructor["create"];
/** alias for `Object.defineProperties`. */
export declare const object_defineProperties: ObjectConstructor["defineProperties"];
/** alias for `Object.defineProperty`. */
export declare const object_defineProperty: ObjectConstructor["defineProperty"];
/** alias for `Object.entries`. */
export declare const object_entries: ObjectConstructor["entries"];
/** alias for `Object.freeze`. */
export declare const object_freeze: ObjectConstructor["freeze"];
/** alias for `Object.fromEntries`. */
export declare const object_fromEntries: ObjectConstructor["fromEntries"];
/** alias for `Object.getOwnPropertyDescriptor`. */
export declare const object_getOwnPropertyDescriptor: ObjectConstructor["getOwnPropertyDescriptor"];
/** alias for `Object.getOwnPropertyDescriptors`. */
export declare const object_getOwnPropertyDescriptors: ObjectConstructor["getOwnPropertyDescriptors"];
/** alias for `Object.getOwnPropertyNames`. */
export declare const object_getOwnPropertyNames: ObjectConstructor["getOwnPropertyNames"];
/** alias for `Object.getOwnPropertySymbols`. */
export declare const object_getOwnPropertySymbols: ObjectConstructor["getOwnPropertySymbols"];
/** alias for `Object.getPrototypeOf`. */
export declare const object_getPrototypeOf: ObjectConstructor["getPrototypeOf"];
/** alias for `Object.groupBy`. */
export declare const object_groupBy: ObjectConstructor["groupBy"];
/** alias for `Object.hasOwn`. */
export declare const object_hasOwn: ObjectConstructor["hasOwn"];
/** alias for `Object.is`. */
export declare const object_is: ObjectConstructor["is"];
/** alias for `Object.isExtensible`. */
export declare const object_isExtensible: ObjectConstructor["isExtensible"];
/** alias for `Object.isFrozen`. */
export declare const object_isFrozen: ObjectConstructor["isFrozen"];
/** alias for `Object.isSealed`. */
export declare const object_isSealed: ObjectConstructor["isSealed"];
/** alias for `Object.keys`. */
export declare const object_keys: ObjectConstructor["keys"];
/** alias for `Object.preventExtensions`. */
export declare const object_preventExtensions: ObjectConstructor["preventExtensions"];
/** alias for `Object.seal`. */
export declare const object_seal: ObjectConstructor["seal"];
/** alias for `Object.setPrototypeOf`. */
export declare const object_setPrototypeOf: ObjectConstructor["setPrototypeOf"];
/** alias for `Object.values`. */
export declare const object_values: ObjectConstructor["values"];
/** create a promise that never resolves. */
export declare const promise_forever: <T>() => Promise<T>;
/** create a promise with external (i.e. outside of scope) resolve and reject controls.
 * this was created before the existence of {@link Promise.withResolvers}.
 * if you'd like to use that instead, see the alias {@link promise_withResolvers}.
*/
export declare const promise_outside: <T>() => [promise: Promise<T>, resolve: (value: MaybePromiseLike<T>) => void, reject: (reason?: any) => void];
/** alias for `Promise.all`. */
export declare const promise_all: {
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;
    <T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;
};
/** alias for `Promise.allSettled`. */
export declare const promise_allSettled: {
    <T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>; }>;
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<PromiseSettledResult<Awaited<T>>[]>;
};
/** alias for `Promise.any`. */
export declare const promise_any: {
    <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
};
/** alias for `Promise.race`. */
export declare const promise_race: {
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
    <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
};
/** alias for `Promise.reject`. */
export declare const promise_reject: <T = never>(reason?: any) => Promise<T>;
/** alias for `Promise.resolve`. */
export declare const promise_resolve: {
    (): Promise<void>;
    <T>(value: T): Promise<Awaited<T>>;
    <T>(value: T | PromiseLike<T>): Promise<Awaited<T>>;
};
/** alias for `Promise.withResolvers`.
 * create a promise with external resolver and rejecter functions, provided in an object form.
 *
 * if you'd like a more minifiable version, consider using the array equivalent: {@link promise_outside}.
*/
export declare const promise_withResolvers: <T>() => PromiseWithResolvers<T>;
/** alias for `Response.error`. */
export declare const response_error: (typeof Response)["error"];
/** alias for `Response.json`. */
export declare const response_json: (typeof Response)["json"];
/** alias for `Response.redirect`. */
export declare const response_redirect: (typeof Response)["redirect"];
/** turn a string to uppercase */
export declare const string_toUpperCase: (str: string) => string;
/** turn a string to lowercase */
export declare const string_toLowerCase: (str: string) => string;
/** alias for `String.fromCharCode` */
export declare const string_fromCharCode: StringConstructor["fromCharCode"];
/** alias for `String.fromCodePoint` */
export declare const string_fromCodePoint: StringConstructor["fromCodePoint"];
/** alias for `String.raw` */
export declare const string_raw: StringConstructor["raw"];
/** alias for `Symbol.asyncDispose`. */
export declare const symbol_asyncDispose: symbol;
/** alias for `Symbol.asyncIterator`. */
export declare const symbol_asyncIterator: symbol;
/** alias for `Symbol.dispose`. */
export declare const symbol_dispose: symbol;
/** alias for `Symbol.for`. */
export declare const symbol_for: SymbolConstructor["for"];
/** alias for `Symbol.hasInstance`. */
export declare const symbol_hasInstance: symbol;
/** alias for `Symbol.isConcatSpreadable`. */
export declare const symbol_isConcatSpreadable: symbol;
/** alias for `Symbol.iterator`. */
export declare const symbol_iterator: symbol;
/** alias for `Symbol.keyFor`. */
export declare const symbol_keyFor: SymbolConstructor["keyFor"];
/** alias for `Symbol.match`. */
export declare const symbol_match: symbol;
/** alias for `Symbol.matchAll`. */
export declare const symbol_matchAll: symbol;
/** alias for `Symbol.metadata`. */
export declare const symbol_metadata: symbol;
/** alias for `Symbol.replace`. */
export declare const symbol_replace: symbol;
/** alias for `Symbol.search`. */
export declare const symbol_search: symbol;
/** alias for `Symbol.species`. */
export declare const symbol_species: symbol;
/** alias for `Symbol.split`. */
export declare const symbol_split: symbol;
/** alias for `Symbol.toPrimitive`. */
export declare const symbol_toPrimitive: symbol;
/** alias for `Symbol.toStringTag`. */
export declare const symbol_toStringTag: symbol;
/** alias for `Symbol.unscopables`. */
export declare const symbol_unscopables: symbol;
/** alias for `console.assert`. */
export declare const console_assert: Console["assert"];
/** alias for `console.clear`. */
export declare const console_clear: Console["clear"];
/** alias for `console.count`. */
export declare const console_count: Console["count"];
/** alias for `console.countReset`. */
export declare const console_countReset: Console["countReset"];
/** alias for `console.debug`. */
export declare const console_debug: Console["debug"];
/** alias for `console.dir`. */
export declare const console_dir: Console["dir"];
/** alias for `console.dirxml`. */
export declare const console_dirxml: Console["dirxml"];
/** alias for `console.error`. */
export declare const console_error: Console["error"];
/** alias for `console.group`. */
export declare const console_group: Console["group"];
/** alias for `console.groupCollapsed`. */
export declare const console_groupCollapsed: Console["groupCollapsed"];
/** alias for `console.groupEnd`. */
export declare const console_groupEnd: Console["groupEnd"];
/** alias for `console.info`. */
export declare const console_info: Console["info"];
/** alias for `console.log`. */
export declare const console_log: Console["log"];
/** alias for `console.table`. */
export declare const console_table: Console["table"];
/** alias for `console.time`. */
export declare const console_time: Console["time"];
/** alias for `console.timeEnd`. */
export declare const console_timeEnd: Console["timeEnd"];
/** alias for `console.timeLog`. */
export declare const console_timeLog: Console["timeLog"];
/** alias for `console.timeStamp`. */
export declare const console_timeStamp: Console["timeStamp"];
/** alias for `console.trace`. */
export declare const console_trace: Console["trace"];
/** alias for `console.warn`. */
export declare const console_warn: Console["warn"];
/** get the current high-precision time in milliseconds. alias for `performance.now`. */
export declare const performance_now: () => DOMHighResTimeStamp;
/** alias for the function `window.setTimeout`. */
export declare const dom_setTimeout: typeof setTimeout;
/** alias for the function `window.clearTimeout`. */
export declare const dom_clearTimeout: typeof clearTimeout;
/** alias for the function `window.setInterval`. */
export declare const dom_setInterval: typeof setInterval;
/** alias for the function `window.clearInterval`. */
export declare const dom_clearInterval: typeof clearInterval;
/** alias for the function `window.encodeURI`. */
export declare const dom_encodeURI: typeof encodeURI;
/** alias for the function `window.encodeURIComponent`. */
export declare const dom_encodeURIComponent: typeof encodeURIComponent;
//# sourceMappingURL=alias.d.ts.map