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
 *
 * // minified expression:
 * const a = 10
 * ```
 *
 * using a combination of the "pure" annotation and the iife evaluatation feature of esbuild, we can create minifiable and tree-shakable aliases:
 *
 * ```ts
 * // unminified iife
 * const math_constructor = Math
 * export const math_max = // \@__PURE__ annotation goes here, but cannot be placed in this doc comment
 * 	(() => math_constructor.max)()
 * export const math_min = // \@__PURE__ annotation goes here, but cannot be placed in this doc comment
 * 	(() => math_constructor.min)()
 *
 * // minified and tree-shakable expression:
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
const array_constructor = Array, bigint_constructor = BigInt, date_constructor = Date, json_constructor = JSON, math_constructor = Math, number_constructor = Number, object_constructor = Object, promise_constructor = Promise, response_constructor = Response, string_constructor = String, symbol_constructor = Symbol, console_object = console, performance_object = performance;
/** a no-operation function */
export const noop = () => { };
// `Array` aliases
/** test if an array is empty */
export const array_isEmpty = (array) => (array.length === 0);
/** alias for `Array.from`. */
export const array_from = /*@__PURE__*/ (() => array_constructor.from)();
/** alias for `Array.fromAsync`. */
export const array_fromAsync = /*@__PURE__*/ (() => array_constructor.fromAsync)();
/** alias for `Array.isArray`. but I'd recommend using {@link isArray} instead. */
export const array_isArray = /*@__PURE__*/ (() => array_constructor.isArray)();
/** alias for `Array.of`. */
export const array_of = /*@__PURE__*/ (() => array_constructor.of)();
// `BigInt` aliases
/** alias for `BigInt.asIntN`. */
export const bigint_asIntN = /*@__PURE__*/ (() => bigint_constructor.asIntN)();
/** alias for `BigInt.asUintN`. */
export const bigint_asUintN = /*@__PURE__*/ (() => bigint_constructor.asUintN)();
// `Date` aliases
/** alias for `Date.UTC`. */
export const date_UTC = /*@__PURE__*/ (() => date_constructor.UTC)();
/** alias for `Date.now`. */
export const date_now = /*@__PURE__*/ (() => date_constructor.now)();
/** alias for `Date.parse`. */
export const date_parse = /*@__PURE__*/ (() => date_constructor.parse)();
// `JSON` aliases
/** alias for `JSON.parse`. */
export const json_parse = /*@__PURE__*/ (() => json_constructor.parse)();
/** alias for `JSON.stringify`. */
export const json_stringify = /*@__PURE__*/ (() => json_constructor.stringify)();
// `Math` aliases
// numeric comparison functions
/** alias for `Math.max`. */
export const math_max = /*@__PURE__*/ (() => math_constructor.max)();
/** alias for `Math.min`. */
export const math_min = /*@__PURE__*/ (() => math_constructor.min)();
/** alias for `Math.sign`. */
export const math_sign = /*@__PURE__*/ (() => math_constructor.sign)();
// numeric rounding functions
/** alias for `Math.ceil`. */
export const math_ceil = /*@__PURE__*/ (() => math_constructor.ceil)();
/** alias for `Math.floor`. */
export const math_floor = /*@__PURE__*/ (() => math_constructor.floor)();
/** alias for `Math.fround`. */
export const math_fround = /*@__PURE__*/ (() => math_constructor.fround)();
/** alias for `Math.round`. */
export const math_round = /*@__PURE__*/ (() => math_constructor.round)();
/** alias for `Math.trunc`. but I'd recommend using `const my_int = my_float | 0` for truncating a float. */
export const math_trunc = /*@__PURE__*/ (() => math_constructor.trunc)();
// triginometric functions
/** alias for `Math.acos`. */
export const math_acos = /*@__PURE__*/ (() => math_constructor.acos)();
/** alias for `Math.acosh`. */
export const math_acosh = /*@__PURE__*/ (() => math_constructor.acosh)();
/** alias for `Math.asin`. */
export const math_asin = /*@__PURE__*/ (() => math_constructor.asin)();
/** alias for `Math.asinh`. */
export const math_asinh = /*@__PURE__*/ (() => math_constructor.asinh)();
/** alias for `Math.atan`. */
export const math_atan = /*@__PURE__*/ (() => math_constructor.atan)();
/** alias for `Math.atan2`. */
export const math_atan2 = /*@__PURE__*/ (() => math_constructor.atan2)();
/** alias for `Math.atanh`. */
export const math_atanh = /*@__PURE__*/ (() => math_constructor.atanh)();
/** alias for `Math.cos`. */
export const math_cos = /*@__PURE__*/ (() => math_constructor.cos)();
/** alias for `Math.cosh`. */
export const math_cosh = /*@__PURE__*/ (() => math_constructor.cosh)();
/** alias for `Math.sin`. */
export const math_sin = /*@__PURE__*/ (() => math_constructor.sin)();
/** alias for `Math.sinh`. */
export const math_sinh = /*@__PURE__*/ (() => math_constructor.sinh)();
/** alias for `Math.tan`. */
export const math_tan = /*@__PURE__*/ (() => math_constructor.tan)();
/** alias for `Math.tanh`. */
export const math_tanh = /*@__PURE__*/ (() => math_constructor.tanh)();
// math functions
/** alias for `Math.abs`. */
export const math_abs = /*@__PURE__*/ (() => math_constructor.abs)();
/** alias for `Math.cbrt`. */
export const math_cbrt = /*@__PURE__*/ (() => math_constructor.cbrt)();
/** alias for `Math.exp`. */
export const math_exp = /*@__PURE__*/ (() => math_constructor.exp)();
/** alias for `Math.expm1`. */
export const math_expm1 = /*@__PURE__*/ (() => math_constructor.expm1)();
/** alias for `Math.log`. */
export const math_log = /*@__PURE__*/ (() => math_constructor.log)();
/** alias for `Math.log10`. */
export const math_log10 = /*@__PURE__*/ (() => math_constructor.log10)();
/** alias for `Math.log1p`. */
export const math_log1p = /*@__PURE__*/ (() => math_constructor.log1p)();
/** alias for `Math.log2`. */
export const math_log2 = /*@__PURE__*/ (() => math_constructor.log2)();
/** alias for `Math.pow`. */
export const math_pow = /*@__PURE__*/ (() => math_constructor.pow)();
/** alias for `Math.sqrt`. */
export const math_sqrt = /*@__PURE__*/ (() => math_constructor.sqrt)();
// integer math
/** alias for `Math.clz32`. */
export const math_clz32 = /*@__PURE__*/ (() => math_constructor.clz32)();
/** alias for `Math.imul`. */
export const math_imul = /*@__PURE__*/ (() => math_constructor.imul)();
// multi-value functions
/** alias for `Math.hypot`. */
export const math_hypot = /*@__PURE__*/ (() => math_constructor.hypot)();
// randomization functions
/** alias for `Math.random`. */
export const math_random = /*@__PURE__*/ (() => math_constructor.random)();
// math constants
/** alias for `Math.E`. */
export const math_E = /*@__PURE__*/ (() => math_constructor.E)();
/** alias for `Math.LN10`. */
export const math_LN10 = /*@__PURE__*/ (() => math_constructor.LN10)();
/** alias for `Math.LN2`. */
export const math_LN2 = /*@__PURE__*/ (() => math_constructor.LN2)();
/** alias for `Math.LOG10E`. */
export const math_LOG10E = /*@__PURE__*/ (() => math_constructor.LOG10E)();
/** alias for `Math.LOG2E`. */
export const math_LOG2E = /*@__PURE__*/ (() => math_constructor.LOG2E)();
/** alias for `Math.PI`. */
export const math_PI = /*@__PURE__*/ (() => math_constructor.PI)();
/** alias for `Math.SQRT1_2`. */
export const math_SQRT1_2 = /*@__PURE__*/ (() => math_constructor.SQRT1_2)();
/** alias for `Math.SQRT2`. */
export const math_SQRT2 = /*@__PURE__*/ (() => math_constructor.SQRT2)();
// `Number` aliases
/** alias for `Number.EPSILON`. */
export const number_EPSILON = /*@__PURE__*/ (() => number_constructor.EPSILON)();
/** alias for `Number.MAX_SAFE_INTEGER`. */
export const number_MAX_SAFE_INTEGER = /*@__PURE__*/ (() => number_constructor.MAX_SAFE_INTEGER)();
/** alias for `Number.MAX_VALUE`. */
export const number_MAX_VALUE = /*@__PURE__*/ (() => number_constructor.MAX_VALUE)();
/** alias for `Number.MIN_SAFE_INTEGER`. */
export const number_MIN_SAFE_INTEGER = /*@__PURE__*/ (() => number_constructor.MIN_SAFE_INTEGER)();
/** alias for `Number.MIN_VALUE`. */
export const number_MIN_VALUE = /*@__PURE__*/ (() => number_constructor.MIN_VALUE)();
/** alias for `Number.NEGATIVE_INFINITY`. */
export const number_NEGATIVE_INFINITY = /*@__PURE__*/ (() => number_constructor.NEGATIVE_INFINITY)();
/** alias for `Number.NaN`. */
export const number_NaN = /*@__PURE__*/ (() => number_constructor.NaN)();
/** alias for `Number.POSITIVE_INFINITY`. */
export const number_POSITIVE_INFINITY = /*@__PURE__*/ (() => number_constructor.POSITIVE_INFINITY)();
/** alias for `Number.isFinite`. */
export const number_isFinite = /*@__PURE__*/ (() => number_constructor.isFinite)();
/** alias for `Number.isInteger`. */
export const number_isInteger = /*@__PURE__*/ (() => number_constructor.isInteger)();
/** alias for `Number.isNaN`. */
export const number_isNaN = /*@__PURE__*/ (() => number_constructor.isNaN)();
/** alias for `Number.isSafeInteger`. */
export const number_isSafeInteger = /*@__PURE__*/ (() => number_constructor.isSafeInteger)();
/** alias for `Number.parseFloat`. */
export const number_parseFloat = /*@__PURE__*/ (() => number_constructor.parseFloat)();
/** alias for `Number.parseInt`. */
export const number_parseInt = /*@__PURE__*/ (() => number_constructor.parseInt)();
// `Object` aliases
/** alias for `Object.assign`. */
export const object_assign = /*@__PURE__*/ (() => object_constructor.assign)();
/** alias for `Object.create`. */
export const object_create = /*@__PURE__*/ (() => object_constructor.create)();
/** alias for `Object.defineProperties`. */
export const object_defineProperties = /*@__PURE__*/ (() => object_constructor.defineProperties)();
/** alias for `Object.defineProperty`. */
export const object_defineProperty = /*@__PURE__*/ (() => object_constructor.defineProperty)();
/** alias for `Object.entries`. */
export const object_entries = /*@__PURE__*/ (() => object_constructor.entries)();
/** alias for `Object.freeze`. */
export const object_freeze = /*@__PURE__*/ (() => object_constructor.freeze)();
/** alias for `Object.fromEntries`. */
export const object_fromEntries = /*@__PURE__*/ (() => object_constructor.fromEntries)();
/** alias for `Object.getOwnPropertyDescriptor`. */
export const object_getOwnPropertyDescriptor = /*@__PURE__*/ (() => object_constructor.getOwnPropertyDescriptor)();
/** alias for `Object.getOwnPropertyDescriptors`. */
export const object_getOwnPropertyDescriptors = /*@__PURE__*/ (() => object_constructor.getOwnPropertyDescriptors)();
/** alias for `Object.getOwnPropertyNames`. */
export const object_getOwnPropertyNames = /*@__PURE__*/ (() => object_constructor.getOwnPropertyNames)();
/** alias for `Object.getOwnPropertySymbols`. */
export const object_getOwnPropertySymbols = /*@__PURE__*/ (() => object_constructor.getOwnPropertySymbols)();
/** alias for `Object.getPrototypeOf`. */
export const object_getPrototypeOf = /*@__PURE__*/ (() => object_constructor.getPrototypeOf)();
/** alias for `Object.groupBy`. */
export const object_groupBy = /*@__PURE__*/ (() => object_constructor.groupBy)();
/** alias for `Object.hasOwn`. */
export const object_hasOwn = /*@__PURE__*/ (() => object_constructor.hasOwn)();
/** alias for `Object.is`. */
export const object_is = /*@__PURE__*/ (() => object_constructor.is)();
/** alias for `Object.isExtensible`. */
export const object_isExtensible = /*@__PURE__*/ (() => object_constructor.isExtensible)();
/** alias for `Object.isFrozen`. */
export const object_isFrozen = /*@__PURE__*/ (() => object_constructor.isFrozen)();
/** alias for `Object.isSealed`. */
export const object_isSealed = /*@__PURE__*/ (() => object_constructor.isSealed)();
/** alias for `Object.keys`. */
export const object_keys = /*@__PURE__*/ (() => object_constructor.keys)();
/** alias for `Object.preventExtensions`. */
export const object_preventExtensions = /*@__PURE__*/ (() => object_constructor.preventExtensions)();
/** alias for `Object.seal`. */
export const object_seal = /*@__PURE__*/ (() => object_constructor.seal)();
/** alias for `Object.setPrototypeOf`. */
export const object_setPrototypeOf = /*@__PURE__*/ (() => object_constructor.setPrototypeOf)();
/** alias for `Object.values`. */
export const object_values = /*@__PURE__*/ (() => object_constructor.values)();
// `Promise` aliases
/** create a promise that never resolves. */
export const promise_forever = () => new Promise(noop);
/** create a promise with external (i.e. outside of scope) resolve and reject controls.
 * this was created before the existence of {@link Promise.withResolvers}.
 * if you'd like to use that instead, see the alias {@link promise_withResolvers}.
*/
export const promise_outside = () => {
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return [promise, resolve, reject];
};
/** alias for `Promise.all`. */
export const promise_all = /*@__PURE__*/ promise_constructor.all.bind(promise_constructor);
/** alias for `Promise.allSettled`. */
export const promise_allSettled = /*@__PURE__*/ promise_constructor.allSettled.bind(promise_constructor);
/** alias for `Promise.any`. */
export const promise_any = /*@__PURE__*/ promise_constructor.any.bind(promise_constructor);
/** alias for `Promise.race`. */
export const promise_race = /*@__PURE__*/ promise_constructor.race.bind(promise_constructor);
/** alias for `Promise.reject`. */
export const promise_reject = /*@__PURE__*/ promise_constructor.reject.bind(promise_constructor);
/** alias for `Promise.resolve`. */
export const promise_resolve = /*@__PURE__*/ promise_constructor.resolve.bind(promise_constructor);
/** alias for `Promise.withResolvers`. <br>
 * create a promise with external resolver and rejecter functions, provided in an object form.
 *
 * if you'd like a more minifiable version, consider using the array equivalent: {@link promise_outside}.
*/
export const promise_withResolvers = /*@__PURE__*/ promise_constructor.withResolvers.bind(promise_constructor);
// `Response` aliases
/** alias for `Response.error`. */
export const response_error = /*@__PURE__*/ (() => response_constructor.error)();
/** alias for `Response.json`. */
export const response_json = /*@__PURE__*/ (() => response_constructor.json)();
/** alias for `Response.redirect`. */
export const response_redirect = /*@__PURE__*/ (() => response_constructor.redirect)();
// `String` aliases
/** turn a string to uppercase */
export const string_toUpperCase = (str) => str.toUpperCase();
/** turn a string to lowercase */
export const string_toLowerCase = (str) => str.toLowerCase();
/** alias for `String.fromCharCode` */
export const string_fromCharCode = /*@__PURE__*/ (() => string_constructor.fromCharCode)();
/** alias for `String.fromCodePoint` */
export const string_fromCodePoint = /*@__PURE__*/ (() => string_constructor.fromCodePoint)();
/** alias for `String.raw` */
export const string_raw = /*@__PURE__*/ (() => string_constructor.raw)();
// `Symbol` aliases
/** alias for `Symbol.asyncDispose`. */
export const symbol_asyncDispose = /*@__PURE__*/ (() => symbol_constructor.asyncDispose)();
/** alias for `Symbol.asyncIterator`. */
export const symbol_asyncIterator = /*@__PURE__*/ (() => symbol_constructor.asyncIterator)();
/** alias for `Symbol.dispose`. */
export const symbol_dispose = /*@__PURE__*/ (() => symbol_constructor.dispose)();
/** alias for `Symbol.for`. */
export const symbol_for = /*@__PURE__*/ (() => symbol_constructor.for)();
/** alias for `Symbol.hasInstance`. */
export const symbol_hasInstance = /*@__PURE__*/ (() => symbol_constructor.hasInstance)();
/** alias for `Symbol.isConcatSpreadable`. */
export const symbol_isConcatSpreadable = /*@__PURE__*/ (() => symbol_constructor.isConcatSpreadable)();
/** alias for `Symbol.iterator`. */
export const symbol_iterator = /*@__PURE__*/ (() => symbol_constructor.iterator)();
/** alias for `Symbol.keyFor`. */
export const symbol_keyFor = /*@__PURE__*/ (() => symbol_constructor.keyFor)();
/** alias for `Symbol.match`. */
export const symbol_match = /*@__PURE__*/ (() => symbol_constructor.match)();
/** alias for `Symbol.matchAll`. */
export const symbol_matchAll = /*@__PURE__*/ (() => symbol_constructor.matchAll)();
/** alias for `Symbol.metadata`. */
export const symbol_metadata = /*@__PURE__*/ (() => symbol_constructor.metadata)();
/** alias for `Symbol.replace`. */
export const symbol_replace = /*@__PURE__*/ (() => symbol_constructor.replace)();
/** alias for `Symbol.search`. */
export const symbol_search = /*@__PURE__*/ (() => symbol_constructor.search)();
/** alias for `Symbol.species`. */
export const symbol_species = /*@__PURE__*/ (() => symbol_constructor.species)();
/** alias for `Symbol.split`. */
export const symbol_split = /*@__PURE__*/ (() => symbol_constructor.split)();
/** alias for `Symbol.toPrimitive`. */
export const symbol_toPrimitive = /*@__PURE__*/ (() => symbol_constructor.toPrimitive)();
/** alias for `Symbol.toStringTag`. */
export const symbol_toStringTag = /*@__PURE__*/ (() => symbol_constructor.toStringTag)();
/** alias for `Symbol.unscopables`. */
export const symbol_unscopables = /*@__PURE__*/ (() => symbol_constructor.unscopables)();
// `console` aliases
/** alias for `console.assert`. */
export const console_assert = /*@__PURE__*/ (() => console_object.assert)();
/** alias for `console.clear`. */
export const console_clear = /*@__PURE__*/ (() => console_object.clear)();
/** alias for `console.count`. */
export const console_count = /*@__PURE__*/ (() => console_object.count)();
/** alias for `console.countReset`. */
export const console_countReset = /*@__PURE__*/ (() => console_object.countReset)();
/** alias for `console.debug`. */
export const console_debug = /*@__PURE__*/ (() => console_object.debug)();
/** alias for `console.dir`. */
export const console_dir = /*@__PURE__*/ (() => console_object.dir)();
/** alias for `console.dirxml`. */
export const console_dirxml = /*@__PURE__*/ (() => console_object.dirxml)();
/** alias for `console.error`. */
export const console_error = /*@__PURE__*/ (() => console_object.error)();
/** alias for `console.group`. */
export const console_group = /*@__PURE__*/ (() => console_object.group)();
/** alias for `console.groupCollapsed`. */
export const console_groupCollapsed = /*@__PURE__*/ (() => console_object.groupCollapsed)();
/** alias for `console.groupEnd`. */
export const console_groupEnd = /*@__PURE__*/ (() => console_object.groupEnd)();
/** alias for `console.info`. */
export const console_info = /*@__PURE__*/ (() => console_object.info)();
/** alias for `console.log`. */
export const console_log = /*@__PURE__*/ (() => console_object.log)();
/** alias for `console.table`. */
export const console_table = /*@__PURE__*/ (() => console_object.table)();
/** alias for `console.time`. */
export const console_time = /*@__PURE__*/ (() => console_object.time)();
/** alias for `console.timeEnd`. */
export const console_timeEnd = /*@__PURE__*/ (() => console_object.timeEnd)();
/** alias for `console.timeLog`. */
export const console_timeLog = /*@__PURE__*/ (() => console_object.timeLog)();
/** alias for `console.timeStamp`. */
export const console_timeStamp = /*@__PURE__*/ (() => console_object.timeStamp)();
/** alias for `console.trace`. */
export const console_trace = /*@__PURE__*/ (() => console_object.trace)();
/** alias for `console.warn`. */
export const console_warn = /*@__PURE__*/ (() => console_object.warn)();
// `performance` aliases
/** get the current high-precision time in milliseconds. <br> alias for `performance.now`. */
export const performance_now = /*@__PURE__*/ performance_object.now.bind(performance_object);
// built-in `window` function aliases
/** alias for the function `window.setTimeout`. */
export const dom_setTimeout = setTimeout;
/** alias for the function `window.clearTimeout`. */
export const dom_clearTimeout = clearTimeout;
/** alias for the function `window.setInterval`. */
export const dom_setInterval = setInterval;
/** alias for the function `window.clearInterval`. */
export const dom_clearInterval = clearInterval;
/** alias for the function `window.encodeURI`. */
export const dom_encodeURI = encodeURI;
/** alias for the function `window.encodeURIComponent`. */
export const dom_encodeURIComponent = encodeURIComponent;
