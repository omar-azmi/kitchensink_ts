/** a sugar-free, fat-free, and low-calorie clone of the popular reactivity library [SolidJS](https://github.com/solidjs/solid). <br>
 * for under a 100 javascript lines, you get:
 * - a few core reactivity functions: {@link createSignal}, {@link createMemo}, and {@link createEffect}
 * - a few core utility functions: {@link batch}, {@link untrack}, and {@link reliesOn} (similar to `on(...)` in solid-js) <br>
 * but in exchange, you sacrifice: DOM manipulation, scheduler, asynchronicity (promises), infinite loop checks, shortest update path, and much more. <br>
 * but hey, cheer up. cuz youz gonna loze sum wei8 ma8! <br>
 * TODO add documentation to you bloody functions you lazy dork. also explain the intent of your various types. yadi yada
 * @module
*/
import "./_dnt.polyfills.js";
type Computation = () => void;
type Cleanup = () => void;
type Updater<T> = (prev_value: T) => T;
export type Accessor<T> = () => T;
export type Setter<T> = (value: T | Updater<T>) => void;
export type AccessorSetter<T> = [Accessor<T>, Setter<T>];
export type MemoFn<T> = () => T;
export type EffectFn = () => Cleanup | void;
export type EqualityFn<T> = (prev_value: T, new_value: T) => boolean;
export type EqualityCheck<T> = undefined | false | EqualityFn<T>;
export interface CreateSignalOptions<T> {
    equals?: EqualityCheck<T>;
}
export declare class Signal<T> {
    private value;
    private observers;
    private equals;
    constructor(value: T, equals?: EqualityCheck<T>);
    getValue: Accessor<T>;
    setValue: Setter<T>;
}
export declare const createSignal: <T>(initial_value: T, options?: CreateSignalOptions<T> | undefined) => AccessorSetter<T>, createMemo: <T>(fn: MemoFn<T>, options?: CreateSignalOptions<T> | undefined) => Accessor<T>, createEffect: (fn: EffectFn) => void;
export declare const batch: (fn: Computation) => void, untrack: <T>(fn: MemoFn<T>) => T, dependsOn: <T>(dependancies: Iterable<Accessor<any>>, fn: MemoFn<T>) => T, reliesOn: (dependancies: Iterable<Accessor<any>>, fn: MemoFn<any> | EffectFn) => EffectFn;
export {};
