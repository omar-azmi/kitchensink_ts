/** aliases for built-in functions. <br>
 * using aliases of nested functions makes your script more minifiable. <br>
 * for instance, `Math.min(...nums)` is probably not minifiable by many bundlers,
 * however, `import {math_min} from "@oazmi/kitchensink/builtin_aliases"; math_min(...nums)` is minifiable by most bundlers. <br>
 *
 * nothing here is re-exported by {@link "mod"}. you will have to import this file directly to use any alias.
 *
 * @module
*/
import "./_dnt.polyfills.js";
export * from "./builtin_aliases_deps.js";
export declare const math_sign: (x: number) => number, math_abs: (x: number) => number, math_round: (x: number) => number, math_ceil: (x: number) => number, math_floor: (x: number) => number, math_trunc: (x: number) => number, math_fround: (x: number) => number, math_sin: (x: number) => number, math_cos: (x: number) => number, math_tan: (x: number) => number, math_asin: (x: number) => number, math_acos: (x: number) => number, math_atan: (x: number) => number, math_sinh: (x: number) => number, math_cosh: (x: number) => number, math_tanh: (x: number) => number, math_asinh: (x: number) => number, math_acosh: (x: number) => number, math_atanh: (x: number) => number, math_atan2: (y: number, x: number) => number, math_cbrt: (x: number) => number, math_clz32: (x: number) => number, math_exp: (x: number) => number, math_expm1: (x: number) => number, math_hypot: (...values: number[]) => number, math_imul: (x: number, y: number) => number, math_log: (x: number) => number, math_log10: (x: number) => number, math_log1p: (x: number) => number, math_log2: (x: number) => number, math_pow: (x: number, y: number) => number, math_sqrt: (x: number) => number, math_E: number, math_LN10: number, math_LN2: number, math_LOG10E: number, math_LOG2E: number, math_PI: number, math_SQRT1_2: number, math_SQRT2: number;
export declare const number_EPSILON: number, number_MAX_SAFE_INTEGER: number, number_MIN_SAFE_INTEGER: number, number_MIN_VALUE: number, number_NaN: number, number_isSafeInteger: (number: unknown) => boolean;
export declare const bigint_asIntN: (bits: number, int: bigint) => bigint, bigint_asUintN: (bits: number, int: bigint) => bigint;
export declare const string_fromCodePoint: (...codePoints: number[]) => string, string_raw: (template: {
    raw: readonly string[] | ArrayLike<string>;
}, ...substitutions: any[]) => string;
export declare const json_parse: (text: string, reviver?: (this: any, key: string, value: any) => any) => any, json_stringify: {
    (value: any, replacer?: (this: any, key: string, value: any) => any, space?: string | number): string;
    (value: any, replacer?: (number | string)[] | null, space?: string | number): string;
};
export declare const promise_all: {
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>[]>;
    <T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: Awaited<T[P]>; }>;
}, promise_allSettled: {
    <T extends readonly unknown[] | []>(values: T): Promise<{ -readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>; }>;
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<PromiseSettledResult<Awaited<T>>[]>;
}, promise_any: {
    <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
}, promise_race: {
    <T>(values: Iterable<T | PromiseLike<T>>): Promise<Awaited<T>>;
    <T extends readonly unknown[] | []>(values: T): Promise<Awaited<T[number]>>;
};
export declare const response_error: () => Response, response_json: (data: any, init?: ResponseInit) => Response, response_redirect: (url: string | URL, status?: number) => Response;
export declare const object_create: {
    (o: object | null): any;
    (o: object | null, properties: PropertyDescriptorMap & ThisType<any>): any;
}, object_defineProperties: <T>(o: T, properties: PropertyDescriptorMap & ThisType<any>) => T, object_freeze: {
    <T extends Function>(f: T): T;
    <T extends {
        [idx: string]: U | null | undefined | object;
    }, U extends string | bigint | number | boolean | symbol>(o: T): Readonly<T>;
    <T>(o: T): Readonly<T>;
}, object_getOwnPropertyDescriptor: (o: any, p: PropertyKey) => PropertyDescriptor | undefined, object_getOwnPropertyDescriptors: <T>(o: T) => { [P in keyof T]: TypedPropertyDescriptor<T[P]>; } & {
    [x: string]: PropertyDescriptor;
}, object_getOwnPropertyNames: (o: any) => string[], object_getOwnPropertySymbols: (o: any) => symbol[], object_hasOwn: (o: object, v: PropertyKey) => boolean, object_is: (value1: any, value2: any) => boolean, object_isExtensible: (o: any) => boolean, object_isFrozen: (o: any) => boolean, object_isSealed: (o: any) => boolean, object_preventExtensions: <T>(o: T) => T, object_seal: <T>(o: T) => T, object_setPrototypeOf: (o: any, proto: object | null) => any;
export declare const date_UTC: {
    (year: number, monthIndex: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number;
    (year: number, monthIndex?: number, date?: number, hours?: number, minutes?: number, seconds?: number, ms?: number): number;
}, date_parse: (s: string) => number;
//# sourceMappingURL=builtin_aliases.d.ts.map