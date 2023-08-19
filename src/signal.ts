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


type Computation = () => void
type ComputationId = number
type Cleanup = () => void
type Updater<T> = (prev_value: T) => T
export type Accessor<T> = () => T
export type Setter<T> = (value: T | Updater<T>) => void
export type AccessorSetter<T> = [Accessor<T>, Setter<T>]
export type MemoFn<T> = () => T
export type EffectFn = () => Cleanup | void
export type EqualityFn<T> = (prev_value: T, new_value: T) => boolean
export type EqualityCheck<T> = undefined | false | EqualityFn<T>

export interface CreateSignalOptions<T> {
	equals?: EqualityCheck<T>
}

let active_computation: ComputationScope | undefined = undefined
let computation_id_counter: ComputationId = 0
const default_equality = (<T>(v1: T, v2: T) => (v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => false) satisfies EqualityFn<any>

export class Signal<T> {
	private observers: Map<ComputationId, Computation> = new Map()
	private equals: EqualityFn<T>

	constructor(
		private value: T,
		equals?: EqualityCheck<T>,
	) {
		this.equals = equals === false ? falsey_equality : (equals ?? default_equality)
	}

	getValue: Accessor<T> = () => {
		if (active_computation) {
			this.observers.set(active_computation.id, active_computation.computation)
		}
		return this.value
	}

	setValue: Setter<T> = (value) => {
		value = typeof value === "function" ? (value as Updater<T>)(this.value) : value
		if (this.equals(this.value, value)) { return }
		this.value = value
		for (const fn of this.observers.values()) {
			fn()
		}
	}
}

class ComputationScope {
	constructor(
		public computation: Computation,
		public cleanup?: Cleanup,
		public id: ComputationId = computation_id_counter++,
	) {
		this.run()
	}

	run = (): void => {
		if (this.cleanup) { this.cleanup() }
		active_computation = this
		this.computation()
		active_computation = undefined
	}

	dispose = (): void => {
		if (this.cleanup) { this.cleanup() }
	}
}

export const
	createSignal = <T>(initial_value: T, options?: CreateSignalOptions<T>): AccessorSetter<T> => {
		const signal = new Signal(initial_value, options?.equals)
		return [signal.getValue, signal.setValue]
	},
	createMemo = <T>(fn: MemoFn<T>, options?: CreateSignalOptions<T>): Accessor<T> => {
		const [getValue, setValue] = createSignal<T>(undefined as T, options)
		new ComputationScope(() => setValue(fn()))
		return getValue
	},
	createEffect = (fn: EffectFn): void => {
		let cleanup: Cleanup | void
		new ComputationScope(
			() => (cleanup = fn()),
			() => { if (cleanup) { cleanup() } }
		)
	}

export const
	batch = (fn: Computation): void => {
		const prev_active_computation = active_computation
		active_computation = undefined
		fn()
		active_computation = prev_active_computation
	},
	untrack = <T>(fn: MemoFn<T>): T => {
		const prev_active_computation = active_computation
		active_computation = undefined
		const result = fn()
		active_computation = prev_active_computation
		return result
	},
	dependsOn = <T>(dependancies: Iterable<Accessor<any>>, fn: MemoFn<T>): T => {
		for (const dep of dependancies) { dep() }
		return untrack(fn)
	},
	reliesOn = (dependancies: Iterable<Accessor<any>>, fn: MemoFn<any> | EffectFn): EffectFn => {
		return () => { dependsOn(dependancies, fn) }
	}
