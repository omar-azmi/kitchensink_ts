/** a sugar-free, fat-free, and low-calorie clone of the popular reactivity library [SolidJS](https://github.com/solidjs/solid). <br>
 * for under a 100 javascript lines, you get:
 * - a few core reactivity functions: {@link createSignal}, {@link createMemo}, and {@link createEffect}
 * - a few core utility functions: {@link batch}, {@link untrack}, and {@link reliesOn} (similar to `on(...)` in solid-js) <br>
 * but in exchange, you sacrifice: DOM manipulation, scheduler, asynchronicity (promises), infinite loop checks, shortest update path, and much more. <br>
 * but hey, cheer up. cuz youz gonna loze sum wei8 ma8! <br>
 * TODO add usage examples
 * @module
*/
/** type definition for a computation function. */
import "./_dnt.polyfills.js";
type Computation = () => void;
/** type definition for a cleanup function. */
type Cleanup = () => void;
/** type definition for an updater function. */
type Updater<T> = (prev_value: T) => T;
/** type definition for a signal accessor (value getter) function. */
export type Accessor<T> = () => T;
/** type definition for a signal value setter function. */
export type Setter<T> = (value: T | Updater<T>) => void;
/** type definition for an accessor and setter pair, which is what is returned by {@link createSignal} */
export type AccessorSetter<T> = [Accessor<T>, Setter<T>];
/** type definition for a memorizable function. to be used as a call parameter for {@link createMemo} */
export type MemoFn<T> = () => T;
/** type definition for an effect function. to be used as a call parameter for {@link createEffect} */
export type EffectFn = () => Cleanup | void;
/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T, new_value: T) => boolean;
/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>;
/** represents options when creating a signal. */
export interface CreateSignalOptions<T> {
    equals?: EqualityCheck<T>;
}
/** a reactive signal that holds a value and updates its dependant observers when the value changes. */
export declare class Signal<T> {
    private value;
    private observers;
    private equals;
    /** create a new `Signal` instance.
     * @param value initial value of the signal.
     * @param equals optional equality check function for value comparison.
    */
    constructor(value: T, equals?: EqualityCheck<T>);
    /** get the current value of the signal, and also become a dependant observer of this signal.
     * @returns the current value.
    */
    getValue: Accessor<T>;
    /** set the value of the signal, and if the new value is not equal to the old value, notify the dependant observers to rerun.
     * @param value new value or updater function.
    */
    setValue: Setter<T>;
}
/** create a reactive signal with an initial value.
 * @param initial_value initial value of the signal.
 * @param options options for signal creation. see {@link CreateSignalOptions}.
 * @returns an accessor and setter pair for the signal.
*/
export declare const createSignal: <T>(initial_value: T, options?: CreateSignalOptions<T> | undefined) => AccessorSetter<T>;
/** create a reactive memo using a memoization function.
 * @param fn memoization function. see {@link MemoFn}.
 * @param options options for memo creation.
 * @returns an accessor for the memoized value.
*/
export declare const createMemo: <T>(fn: MemoFn<T>, options?: CreateSignalOptions<T> | undefined) => Accessor<T>;
/** create a reactive effect using an effect function.
 * @param fn effect function to run. {@link see EffectFn}.
*/
export declare const createEffect: (fn: EffectFn) => void;
/** batch multiple computations together for efficient execution.
 * @param fn computation function containing multiple reactive operations.
*/
export declare const batch: (fn: Computation) => void;
/** temporarily disable tracking of reactive dependencies within a function.
 * @param fn function containing reactive dependencies.
 * @returns the result of the function.
*/
export declare const untrack: <T>(fn: MemoFn<T>) => T;
/** evaluate a function with explicit reactive dependencies.
 * @param dependencies list of reactive dependencies to consider.
 * @param fn function containing reactive logic with a return value.
 * @returns the result of the {@link fn} function.
*/
export declare const dependsOn: <T>(dependancies: Iterable<Accessor<any>>, fn: MemoFn<T>) => MemoFn<T>;
/** create an effect that explicitly depends on specified reactive dependencies.
 * @param dependencies list of reactive dependencies to consider for the effect.
 * @param fn function containing reactive logic for the effect.
 * @returns an effect function that tracks the specified dependency signals.
*/
export declare const reliesOn: (dependancies: Iterable<Accessor<any>>, fn: MemoFn<any> | EffectFn) => EffectFn;
export {};
