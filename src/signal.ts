/** a sugar-free, fat-free, and low-calorie clone of the popular reactivity library [SolidJS](https://github.com/solidjs/solid). <br>
 * for under a 100 javascript lines, you get:
 * - a few core reactivity functions: {@link createSignal}, {@link createMemo}, and {@link createEffect}
 * - a few core utility functions: {@link batch}, {@link untrack}, and {@link reliesOn} (similar to `on(...)` in solid-js) <br>
 * but in exchange, you sacrifice: DOM manipulation, scheduler, asynchronicity (promises), infinite loop checks, shortest update path, and much more. <br>
 * but hey, cheer up. cuz youz gonna loze sum wei8 ma8! <br>
 * TODO add usage examples
 * @module
*/

import { min } from "./numericmethods.ts"

/** type definition for a computation function. */
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

/** represents options when creating a signal via {@link createSignal}. */
export interface CreateSignalOptions<T> {
	/** when a signal's value is updated (either through a {@link Setter}, or a change in the value of a dependancy signal in the case of a memo),
	 * then the dependants/observers of THIS signal will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>
}

/** represents options when creating an effect signal via {@link createEffect}. */
export interface CreateEffectOptions {
	/** when `true`, the effect function {@link EffectFn} will not be evaluated immediately (ie the first execution will be skipped),
	 * and its execution will be put off until the function returned by {@link createEffect} is called. <br>
	 * by default, `defer` is `false`, and effects are immediately executed during initialization. <br>
	 * the reason why you might want to defer an effect is because the body of the effect function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	*/
	defer?: boolean
}

/** represents options when creating a memo signal via {@link createMemo}. */
export interface CreateMemoOptions<T> extends CreateSignalOptions<T> {
	/** when `true`, the memo function {@link MemoFn} will not be evaluated immediately (ie the first execution will be skipped),
	 * and its execution will be put off until the first time the memo signal's accessor {@link Accessor} is called. <br>
	 * by default, `defer` is `false`, and memos are immediately evaluated for a value during initialization. <br>
	 * the reason why you might want to defer a memo's value is because the body of the memo function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	 * note that defering adds an additional arrow function call. so its better to change your code pattern where performance needs to be higher. <br>
	 * also do not fear the first execution for being potentially redundant, because adding a defer call layer will certainly be worse on subsequent calls.
	*/
	defer?: boolean
}

let active_computation: ComputationScope | undefined = undefined
let computation_id_counter: ComputationId = 0
const default_equality = (<T>(v1: T, v2: T) => (v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => false) satisfies EqualityFn<any>
const noop: () => void = () => (undefined)
let pause_reactivity_stack = 0
export const pauseReactivity = () => { pause_reactivity_stack++ }
export const resumeReactivity = () => { pause_reactivity_stack = min(pause_reactivity_stack - 1, 0) }
export const resetReactivity = () => { pause_reactivity_stack = 0 }

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

	/** get the current value of the signal, and also become a dependant observer of this signal. <br>
	 * note that this is an arrow function because `getValue` is typically destructured and then passed around with the `Signal`'s `this` context being lost. <br>
	 * if this were a regular class method delaration (ie: `getValue() {...}`), then it would be necessary to always call it via `this.getValue()`. <br>
	 * using it via `const { getter: getValue } = this; getter()` would result in an error, because `this` is lost from `getter`'s context now. <br>
	 * @returns the current value.
	*/
	getValue: Accessor<T> = () => {
		if (active_computation && pause_reactivity_stack === 0) {
			this.observers.set(active_computation.id, active_computation.computation)
		}
		return this.value
	}

	/** set the value of the signal, and if the new value is not equal to the old value, notify the dependant observers to rerun. <br>
	 * note that this is an arrow function because `setValue` is typically destructured and then passed around with the `Signal`'s `this` context being lost. <br>
	 * if this were a regular class method delaration (ie: `setValue(xyz) {...}`), then it would be necessary to always call it via `this.setValue(xyz)`. <br>
	 * using it via `const { setter: setValue } = this; setter(xyz)` would result in an error, because `this` is lost from `setter`'s context now. <br>
	 * @param value new value or updater function.
	*/
	setValue: Setter<T> = (value) => {
		value = typeof value === "function" ? (value as Updater<T>)(this.value) : value
		if (this.equals(this.value, value)) { return }
		this.value = value
		if (pause_reactivity_stack > 0) { return }
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
	run(): void {
		if (this.cleanup) { this.cleanup() }
		active_computation = this
		this.computation()
		active_computation = undefined
	}

	/** dispose of the computation scope. */
	dispose(): void {
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
export const createMemo = <T>(fn: MemoFn<T>, options?: CreateMemoOptions<T>): Accessor<T> => {
	const [getValue, setValue] = createSignal<T>(undefined as T, options)
	if (options?.defer) {
		let executed = false
		return () => {
			if (!executed) {
				new ComputationScope(() => setValue(fn()))
				executed = true
			}
			return getValue()
		}
	}
	new ComputationScope(() => setValue(fn()))
	return getValue
}

/** create a reactive effect using an effect function.
 * @param fn effect function to run. {@link see EffectFn}.
*/
export const createEffect = (fn: EffectFn, options?: CreateEffectOptions): (() => void) => {
	let cleanup: Cleanup | void
	const execute_effect = () => {
		new ComputationScope(
			() => (cleanup = fn()),
			() => { if (cleanup) { cleanup() } }
		)
	}
	if (options?.defer) {
		return execute_effect
	}
	execute_effect()
	return noop
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
