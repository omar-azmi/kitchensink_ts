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

type Computation = () => void

/** type definition for a computation ID. */
type ComputationId = number

/** type definition for a cleanup function. */
type Cleanup = () => void

/** type definition for an updater function. */
type Updater<T> = (prev_value: T) => T

/** type definition for a signal accessor (value getter) function. */
export type Accessor<T> = () => T

/** type definition for a signal value setter function. */
export type Setter<T> = (value: T | Updater<T>) => void

/** type definition for an accessor and setter pair, which is what is returned by {@link createSignal} */
export type AccessorSetter<T> = [Accessor<T>, Setter<T>]

/** type definition for a memorizable function. to be used as a call parameter for {@link createMemo} */
export type MemoFn<T> = () => T

/** type definition for an effect function. to be used as a call parameter for {@link createEffect} */
export type EffectFn = () => Cleanup | void

/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T, new_value: T) => boolean

/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>

/** represents options when creating a signal. */
export interface CreateSignalOptions<T> {
	equals?: EqualityCheck<T>
}

let active_computation: ComputationScope | undefined = undefined
let computation_id_counter: ComputationId = 0
const default_equality = (<T>(v1: T, v2: T) => (v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => false) satisfies EqualityFn<any>

/** a reactive signal that holds a value and updates its dependant observers when the value changes. */
export class Signal<T> {
	private observers: Map<ComputationId, Computation> = new Map()
	private equals: EqualityFn<T>

	/** create a new `Signal` instance.
	 * @param value initial value of the signal.
	 * @param equals optional equality check function for value comparison.
	*/
	constructor(
		private value: T,
		equals?: EqualityCheck<T>,
	) {
		this.equals = equals === false ? falsey_equality : (equals ?? default_equality)
	}

	/** get the current value of the signal, and also become a dependant observer of this signal.
	 * @returns the current value.
	*/
	getValue: Accessor<T> = () => {
		if (active_computation) {
			this.observers.set(active_computation.id, active_computation.computation)
		}
		return this.value
	}

	/** set the value of the signal, and if the new value is not equal to the old value, notify the dependant observers to rerun.
	 * @param value new value or updater function.
	*/
	setValue: Setter<T> = (value) => {
		value = typeof value === "function" ? (value as Updater<T>)(this.value) : value
		if (this.equals(this.value, value)) { return }
		this.value = value
		for (const fn of this.observers.values()) {
			fn()
		}
	}
}

/** represents a computation scope for managing reactive computations. */
class ComputationScope {
	/** create a new computation scope.
	 * @param computation the computation function to run.
	 * @param cleanup optional cleanup function to execute after the computation.
	 * @param id optional computation ID.
	*/
	constructor(
		public computation: Computation,
		public cleanup?: Cleanup,
		public id: ComputationId = computation_id_counter++,
	) {
		this.run()
	}

	/** run the computation within this scope. */
	run = (): void => {
		if (this.cleanup) { this.cleanup() }
		active_computation = this
		this.computation()
		active_computation = undefined
	}

	/** dispose of the computation scope. */
	dispose = (): void => {
		if (this.cleanup) { this.cleanup() }
	}
}

/** create a reactive signal with an initial value.
 * @param initial_value initial value of the signal.
 * @param options options for signal creation. see {@link CreateSignalOptions}.
 * @returns an accessor and setter pair for the signal.
*/
export const createSignal = <T>(initial_value: T, options?: CreateSignalOptions<T>): AccessorSetter<T> => {
	const signal = new Signal(initial_value, options?.equals)
	return [signal.getValue, signal.setValue]
}

/** create a reactive memo using a memoization function.
 * @param fn memoization function. see {@link MemoFn}.
 * @param options options for memo creation.
 * @returns an accessor for the memoized value.
*/
export const createMemo = <T>(fn: MemoFn<T>, options?: CreateSignalOptions<T>): Accessor<T> => {
	const [getValue, setValue] = createSignal<T>(undefined as T, options)
	new ComputationScope(() => setValue(fn()))
	return getValue
}

/** create a reactive effect using an effect function.
 * @param fn effect function to run. {@link see EffectFn}.
*/
export const createEffect = (fn: EffectFn): void => {
	let cleanup: Cleanup | void
	new ComputationScope(
		() => (cleanup = fn()),
		() => { if (cleanup) { cleanup() } }
	)
}

/** batch multiple computations together for efficient execution.
 * @param fn computation function containing multiple reactive operations.
*/
export const batch = (fn: Computation): void => {
	const prev_active_computation = active_computation
	active_computation = undefined
	fn()
	active_computation = prev_active_computation
}

/** temporarily disable tracking of reactive dependencies within a function.
 * @param fn function containing reactive dependencies.
 * @returns the result of the function.
*/
export const untrack = <T>(fn: MemoFn<T>): T => {
	const prev_active_computation = active_computation
	active_computation = undefined
	const result = fn()
	active_computation = prev_active_computation
	return result
}

/** evaluate a function with explicit reactive dependencies.
 * @param dependencies list of reactive dependencies to consider.
 * @param fn function containing reactive logic with a return value.
 * @returns the result of the {@link fn} function.
*/
export const dependsOn = <T>(dependancies: Iterable<Accessor<any>>, fn: MemoFn<T>): MemoFn<T> => {
	return () => {
		for (const dep of dependancies) { dep() }
		return untrack(fn)
	}
}

/** create an effect that explicitly depends on specified reactive dependencies.
 * @param dependencies list of reactive dependencies to consider for the effect.
 * @param fn function containing reactive logic for the effect.
 * @returns an effect function that tracks the specified dependency signals.
*/
export const reliesOn = (dependancies: Iterable<Accessor<any>>, fn: MemoFn<any> | EffectFn): EffectFn => {
	return () => {
		for (const dep of dependancies) { dep() }
		untrack(fn)
	}
}
