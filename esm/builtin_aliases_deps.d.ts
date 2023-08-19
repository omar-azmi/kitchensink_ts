/** a collection of aliases for built-in functions used internally by other submodules of this library. <br>
 * the collection of built-in aliases not used internally by any submodules are available in {@link ./builtin_aliases}. <br>
 *
 * nothing here is re-exported by `./mod.ts`. you will have to import this file directly to use any alias.
 * @module
*/
export declare const string_fromCharCode: (...codes: number[]) => string, promise_resolve: {
    (): Promise<void>;
    <T>(value: T): Promise<Awaited<T>>;
    <T_1>(value: T_1 | PromiseLike<T_1>): Promise<Awaited<T_1>>;
};
export declare const number_isInteger: (number: unknown) => boolean, number_MAX_VALUE: number, number_NEGATIVE_INFINITY: number, number_POSITIVE_INFINITY: number;
