/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link ./builtin_aliases}. <br>
 *
 * nothing here is re-exported by `./mod.ts`. you will have to import this file directly to use any alias.
 * @module
*/
import "./_dnt.polyfills.js";
export const 
/** a no-operation function */
noop = () => { }, 
/** test if an array is empty */
array_isEmpty = (array) => (array.length === 0), string_fromCharCode = String.fromCharCode, 
/** turn a string to uppercase */
string_toUpperCase = (str) => str.toUpperCase(), 
/** turn a string to lowercase */
string_toLowerCase = (str) => str.toLowerCase(), 
/** create a promise that resolves immediately */
promise_resolve = /*@__PURE__*/ Promise.resolve.bind(Promise), 
/** create a promise that rejects immediately */
promise_reject = /*@__PURE__*/ Promise.reject.bind(Promise), 
/** create a promise that never resolves */
promise_forever = () => new Promise(noop), 
/** create a promise with external (i.e. outside of scope) resolve and reject controls */
promise_outside = () => {
    let resolve, reject;
    const promise = new Promise((_resolve, _reject) => {
        resolve = _resolve;
        reject = _reject;
    });
    return [promise, resolve, reject];
};
export const { from: array_from, isArray: array_isArray, of: array_of, } = Array;
export const { isInteger: number_isInteger, MAX_VALUE: number_MAX_VALUE, NEGATIVE_INFINITY: number_NEGATIVE_INFINITY, POSITIVE_INFINITY: number_POSITIVE_INFINITY, } = Number;
export const { assign: object_assign, defineProperty: object_defineProperty, keys: object_keys, getPrototypeOf: object_getPrototypeOf, values: object_values, } = Object;
export const date_now = Date.now;
export const { iterator: symbol_iterator, toStringTag: symbol_toStringTag, } = Symbol;
export const dom_setTimeout = setTimeout, dom_clearTimeout = clearTimeout, dom_setInterval = setInterval, dom_clearInterval = clearInterval;
