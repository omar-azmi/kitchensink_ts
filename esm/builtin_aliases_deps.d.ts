/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link ./builtin_aliases}. <br>
 *
 * nothing here is re-exported by `./mod.ts`. you will have to import this file directly to use any alias.
 * @module
*/
import "./_dnt.polyfills.js";
export declare const 
/** a no-operation function */
noop: () => void, 
/** test if an array is empty */
array_isEmpty: (array: ArrayLike<any>) => boolean, string_fromCharCode: (...codes: number[]) => string, 
/** turn a string to uppercase */
string_toUpperCase: (str: string) => string, 
/** turn a string to lowercase */
string_toLowerCase: (str: string) => string, 
/** create a promise that resolves immediately */
promise_resolve: {
    (): Promise<void>;
    <T>(value: T): Promise<Awaited<T>>;
    <T_1>(value: T_1 | PromiseLike<T_1>): Promise<Awaited<T_1>>;
}, 
/** create a promise that rejects immediately */
promise_reject: <T = never>(reason?: any) => Promise<T>, 
/** create a promise that never resolves */
promise_forever: <T>() => Promise<T>, 
/** create a promise with external (i.e. outside of scope) resolve and reject controls */
promise_outside: <T>() => [promise: Promise<T>, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void];
export declare const array_from: {
    <T>(arrayLike: ArrayLike<T>): T[];
    <T_1, U>(arrayLike: ArrayLike<T_1>, mapfn: (v: T_1, k: number) => U, thisArg?: any): U[];
    <T_2>(iterable: Iterable<T_2> | ArrayLike<T_2>): T_2[];
    <T_3, U_1>(iterable: Iterable<T_3> | ArrayLike<T_3>, mapfn: (v: T_3, k: number) => U_1, thisArg?: any): U_1[];
}, array_isArray: (arg: any) => arg is any[], array_of: <T>(...items: T[]) => T[];
export declare const number_isInteger: (number: unknown) => boolean, number_MAX_VALUE: number, number_NEGATIVE_INFINITY: number, number_POSITIVE_INFINITY: number;
export declare const object_assign: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T_1 extends {}, U_1, V>(target: T_1, source1: U_1, source2: V): T_1 & U_1 & V;
    <T_2 extends {}, U_2, V_1, W>(target: T_2, source1: U_2, source2: V_1, source3: W): T_2 & U_2 & V_1 & W;
    (target: object, ...sources: any[]): any;
}, object_defineProperty: <T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>) => T, object_keys: {
    (o: object): string[];
    (o: {}): string[];
}, object_getPrototypeOf: (o: any) => any, object_values: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): T[];
    (o: {}): any[];
};
export declare const date_now: () => number;
export declare const symbol_iterator: symbol, symbol_toStringTag: symbol;
export declare const dom_setTimeout: typeof setTimeout, dom_clearTimeout: typeof clearTimeout, dom_setInterval: typeof setInterval, dom_clearInterval: typeof clearInterval;