/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link "builtin_aliases"}. <br>
 * this module is also re-exported by {@link "mod"}, as it is also useful for external projects and helps in their minification when bundled.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import type { MaybePromiseLike } from "./typedefs.js";
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
    <T>(value: T | PromiseLike<T>): Promise<Awaited<T>>;
}, 
/** create a promise that rejects immediately */
promise_reject: <T = never>(reason?: any) => Promise<T>, 
/** create a promise with external resolver and rejecter functions, provided in an object form.
 * if you'd like a more minifiable version, consider using the array equivalent: {@link promise_outside}.
*/
promise_withResolvers: {
    <T>(): PromiseWithResolvers<T>;
    <T>(): {
        promise: Promise<T>;
        resolve: (value: T | PromiseLike<T>) => void;
        reject: (reason?: any) => void;
    };
}, 
/** create a promise that never resolves */
promise_forever: <T>() => Promise<T>, 
/** create a promise with external (i.e. outside of scope) resolve and reject controls.
 * this was created before the existence of {@link Promise.withResolvers}.
 * if you'd like to use that instead, see the alias {@link promise_withResolvers}.
*/
promise_outside: <T>() => [promise: Promise<T>, resolve: (value: MaybePromiseLike<T>) => void, reject: (reason?: any) => void], 
/** get the current high-precision time in milliseconds. */
performance_now: () => DOMHighResTimeStamp;
export declare const array_from: {
    <T>(arrayLike: ArrayLike<T>): T[];
    <T, U>(arrayLike: ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
    <T>(iterable: Iterable<T> | ArrayLike<T>): T[];
    <T, U>(iterable: Iterable<T> | ArrayLike<T>, mapfn: (v: T, k: number) => U, thisArg?: any): U[];
}, array_fromAsync: {
    <T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | PromiseLike<T>> | ArrayLike<T | PromiseLike<T>>): Promise<T[]>;
    <T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
    <T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | Promise<T>> | ArrayLike<T | Promise<T>>): Promise<T[]>;
    <T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
}, array_isArray: (arg: any) => arg is any[], array_of: <T>(...items: T[]) => T[];
export declare const number_MAX_VALUE: number, number_NEGATIVE_INFINITY: number, number_POSITIVE_INFINITY: number, number_isFinite: (number: unknown) => boolean, number_isInteger: (number: unknown) => boolean, number_isNaN: (number: unknown) => boolean, number_parseFloat: (string: string) => number, number_parseInt: (string: string, radix?: number) => number;
export declare const math_max: (...values: number[]) => number, math_min: (...values: number[]) => number, math_random: () => number;
export declare const object_assign: {
    <T extends {}, U>(target: T, source: U): T & U;
    <T extends {}, U, V>(target: T, source1: U, source2: V): T & U & V;
    <T extends {}, U, V, W>(target: T, source1: U, source2: V, source3: W): T & U & V & W;
    (target: object, ...sources: any[]): any;
}, object_defineProperty: <T>(o: T, p: PropertyKey, attributes: PropertyDescriptor & ThisType<any>) => T, object_entries: {
    <T>(o: {
        [s: string]: T;
    } | ArrayLike<T>): [string, T][];
    (o: {}): [string, any][];
}, object_fromEntries: {
    <T = any>(entries: Iterable<readonly [PropertyKey, T]>): {
        [k: string]: T;
    };
    (entries: Iterable<readonly any[]>): any;
}, object_keys: {
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
export declare const dom_setTimeout: typeof setTimeout, dom_clearTimeout: typeof clearTimeout, dom_setInterval: typeof setInterval, dom_clearInterval: typeof clearInterval, dom_encodeURI: typeof encodeURI;
export declare const console_assert: {
    (condition?: boolean, ...data: any[]): void;
    (value: any, message?: string, ...optionalParams: any[]): void;
}, console_clear: {
    (): void;
    (): void;
}, console_debug: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}, console_dir: {
    (item?: any, options?: any): void;
    (obj: any, options?: import("util").InspectOptions): void;
}, console_error: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}, console_log: {
    (...data: any[]): void;
    (message?: any, ...optionalParams: any[]): void;
}, console_table: {
    (tabularData?: any, properties?: string[]): void;
    (tabularData: any, properties?: readonly string[]): void;
};
//# sourceMappingURL=builtin_aliases_deps.d.ts.map