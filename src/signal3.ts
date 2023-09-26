import {
	bind_array_clear,
	bind_array_push,
	bind_map_clear,
	bind_map_delete,
	bind_map_forEach,
	bind_map_get,
	bind_map_set,
	bind_set_add,
	bind_set_clear,
	bind_set_delete,
	bind_set_has,
} from "./binder.ts"
import { THROTTLE_REJECT, throttle } from "./browser.ts"

const DEBUG = true as const

type ID = number
type UNTRACKED_ID = 0
type FROM = ID
type TO = ID
type HASH_IDS = number

/** type definition for an updater function. */
type Updater<T> = (prev_value?: T) => T

/** type definition for a signal accessor (value getter) function. */
export type Accessor<T> = (observer_id?: TO | UNTRACKED_ID) => T

/** type definition for a signal value setter function. */
export type Setter<T> = (new_value: T | Updater<T>) => boolean

/** type definition for an accessor and setter pair, which is what is returned by {@link createSignal} */
export type AccessorSetter<T> = [Accessor<T>, Setter<T>]

/** type definition for a memorizable function. to be used as a call parameter for {@link createMemo} */
export type MemoFn<T> = (observer_id: TO | UNTRACKED_ID) => T

/** type definition for an effect function. to be used as a call parameter for {@link createEffect} <br>
 * the return value of the function describes whether or not the signal should propagate. <br>
 * if `undefined` or `true` (or truethy), then the effect signal will propagate onto its observer signals,
 * otherwise if it is explicitly `false`, then it won't propagate.
*/
export type EffectFn = (observer_id: TO | UNTRACKED_ID) => void | undefined | boolean

/** a function that forcefully runs the {@link EffectFn} of an effect signal, and then propagates towards the observers of that effect signal. <br>
 * the return value is `true` if the effect is ran and propagated immediately,
 * or `false` if it did not fire immediately because of some form of batching stopped it from doing so.
*/
export type EffectEmitter = () => boolean

/** type definition for an effect accessor (ie for registering as an observer) and an effect forceful-emitter pair, which is what is returned by {@link createEffect} */
export type AccessorEmitter = [Accessor<void>, EffectEmitter]

/** type definition for a value equality check function. */
export type EqualityFn<T> = (prev_value: T | undefined, new_value: T) => boolean

/** type definition for an equality check specification. <br>
 * when `undefined`, javascript's regular `===` equality will be used. <br>
 * when `false`, equality will always be evaluated to false, meaning that setting any value will always fire a signal, even if it's equal.
*/
export type EqualityCheck<T> = undefined | false | EqualityFn<T>

export interface BaseSignalConfig<T> {
	/** give a name to the signal for debuging purposes */
	name?: string

	/** when a signal's value is updated (either through a {@link Setter}, or a change in the value of a dependancy signal in the case of a memo),
	 * then the dependants/observers of THIS signal will only be notified if the equality check function evaluates to a `false`. <br>
	 * see {@link EqualityCheck} to see its function signature and default behavior when left `undefined`
	*/
	equals?: EqualityCheck<T>

	/** when `false`, the computaion/effect function will be be evaluated/run immediately after it is declared. <br>
	 * however, if left `undefined`, or `true`, the function's execution will be put off until the reactive signal returned by the createXYZ is called/accessed. <br>
	 * by default, `defer` is `true`, and reactivity is not immediately executed during initialization. <br>
	 * the reason why you might want to defer a reactive function is because the body of the reactive function may contain symbols/variables
	 * that have not been defined yet, in which case an error will be raised, unless you choose to defer the first execution. <br>
	*/
	defer?: boolean

	/** initial value declaration for reactive signals. <br>
	 * its purpose is only to be used as a previous value (`prev_value`) for the optional `equals` equality function,
	 * so that you don't get an `undefined` as the `prev_value` on the very first comparison.
	*/
	value?: T
}

const enum SignalUpdateStatus {
	PENDING_ASYNC = -1,
	NOT_UPDATED = 0,
	UPDATED = 1,
}

const default_equality = (<T>(v1: T, v2: T) => (v1 === v2)) satisfies EqualityFn<any>
const falsey_equality = (<T>(v1: T, v2: T) => false) satisfies EqualityFn<any>
const hash_ids = (ids: ID[]): HASH_IDS => {
	const sqrt_len = ids.length ** 0.5
	return ids.reduce((sum, id) => sum + id * (id + sqrt_len), 0)
}

/** transforms a regular equality check function ({@link BaseSignalConfig.equals}) into a one that throttles when called too frequently. <br>
 * this means that a singal composed of this as its `equals` function will limit propagating itself further, until at least `delta_time_ms`
 * amount of time has passed since the last time it was potentially propagated.
 * 
 * @param delta_time_ms the time interval in milliseconds for throttling
 * @param base_equals use an optional customized equality checking function. otherwise the default `prev_value === new_value` comparison will be used
 * @returns a throttled version of the equality checking function which would prematurely return a `true` if called too frequently (ie within `delta_time_ms` interval since the last actual equality cheking)
 * 
 * @example
 * ```ts
 * const { createState, createMemo, createEffect } = createContext()
 * const [A, setA] = createState(0)
 * const B = createMemo((id) => {
 * 	return A(id) ** 0.5
 * }, { equals: throttlingEquals(500) }) // at least 500ms must pass before `B` propagates itself onto `C`
 * const [C, fireC] = createEffect((id) => {
 * 	// SOME EXPENSIVE COMPUTATION OR EFFECT //
 * 	console.log("C says Hi!, and B is of the value:", B(id))
 * }, { defer: false })
 * // it is important that you note that `B` will be recomputed each time `setA(...)` is fired.
 * // it is only that `B` won't propagate to `C` (even if it changes in value) if at least 500ms have not passed
 * setInterval(() => setA(A() + 1), 10)
 * ```
*/
export const throttlingEquals = <T>(delta_time_ms: number, base_equals?: EqualityCheck<T>): EqualityCheck<T> => {
	const
		base_equals_fn = base_equals === false ? falsey_equality : (base_equals ?? default_equality),
		throttled_equals = throttle(delta_time_ms, base_equals_fn)
	return (prev_value: T | undefined, new_value: T) => {
		const is_equal = throttled_equals(prev_value, new_value)
		return is_equal === THROTTLE_REJECT ? true : is_equal
	}
}

export const createContext = () => {
	let
		id_counter: number = 0,
		batch_nestedness = 0

	const
		fmap = new Map<FROM, Set<TO>>(),
		rmap = new Map<TO, Set<FROM>>(),
		fmap_get = bind_map_get(fmap),
		rmap_get = bind_map_get(rmap),
		fmap_set = bind_map_set(fmap),
		rmap_set = bind_map_set(rmap)

	const fadd = (src_id: FROM, dst_id: TO) => {
		const forward_items = fmap_get(src_id) ?? (
			fmap_set(src_id, new Set()) &&
			fmap_get(src_id)!
		)
		if (!forward_items.has(dst_id)) {
			forward_items.add(dst_id)
			if (!rmap_get(dst_id)?.add(src_id)) {
				rmap_set(dst_id, new Set([src_id]))
			}
		}
	}

	const
		ids_to_visit_cache = new Map<HASH_IDS, Set<ID>>(),
		ids_to_visit_cache_get = bind_map_get(ids_to_visit_cache),
		ids_to_visit_cache_set = bind_map_set(ids_to_visit_cache),
		ids_to_visit_cache_clear = bind_map_clear(ids_to_visit_cache),
		ids_to_visit_cache_create_new_entry = (source_ids: ID[]): Set<ID> => {
			const
				to_visit = new Set<ID>(),
				to_visit_add = bind_set_add(to_visit),
				to_visit_has = bind_set_has(to_visit)
			const dfs_visiter = (id: ID) => {
				if (!to_visit_has(id)) {
					to_visit_add(id)
					fmap_get(id)?.forEach(dfs_visiter)
				}
			}
			source_ids.forEach(dfs_visiter)
			return to_visit
		},
		get_ids_to_visit = (...source_ids: ID[]): Set<ID> => {
			const hash = hash_ids(source_ids)
			return ids_to_visit_cache_get(hash) ?? (
				ids_to_visit_cache_set(hash, ids_to_visit_cache_create_new_entry(source_ids)) &&
				ids_to_visit_cache_get(hash)!
			)
		}

	const
		all_signals = new Map<ID, BaseSignal<any>>(),
		all_signals_get = bind_map_get(all_signals),
		all_signals_set = bind_map_set(all_signals)

	const
		to_visit_this_cycle = new Set<ID>(),
		to_visit_this_cycle_add = bind_set_add(to_visit_this_cycle),
		to_visit_this_cycle_delete = bind_set_delete(to_visit_this_cycle),
		to_visit_this_cycle_clear = bind_set_clear(to_visit_this_cycle),
		updated_this_cycle = new Map<ID, SignalUpdateStatus>(),
		updated_this_cycle_get = bind_map_get(updated_this_cycle),
		updated_this_cycle_set = bind_map_set(updated_this_cycle),
		updated_this_cycle_clear = bind_map_clear(updated_this_cycle),
		batched_ids: FROM[] = [],
		batched_ids_push = bind_array_push(batched_ids),
		batched_ids_clear = bind_array_clear(batched_ids),
		fireUpdateCycle = (...source_ids: FROM[]) => {
			to_visit_this_cycle_clear()
			updated_this_cycle_clear()
			// clone the ids to visit into the "visit cycle for this update"
			get_ids_to_visit(...source_ids).forEach(to_visit_this_cycle_add)
			// fire the signal and propagate its reactivity.
			// the souce signals are `force`d in order to skip any unresolved dependency check.
			// this is needed because although state signals do not have dependencies, effect signals may have one.
			// but effect signals are themselves designed to be fired/ran as standalone signals
			for (const source_id of source_ids) {
				propagateSignalUpdate(source_id, true)
			}
		},
		startBatching = () => (++batch_nestedness),
		endBatching = () => {
			if (--batch_nestedness <= 0) {
				batch_nestedness = 0
				fireUpdateCycle(...batched_ids_clear())
			}
		},
		scopedBatching = <T extends any = void, ARGS extends any[] = []>(
			fn: (...args: ARGS) => T,
			...args: ARGS
		): T => {
			startBatching()
			const return_value = fn(...args)
			endBatching()
			return return_value
		}

	const propagateSignalUpdate = (id: ID, force?: true | any) => {
		if (to_visit_this_cycle_delete(id)) {
			if (DEBUG) { console.log("UPDATE_CYCLE\t", "visiting   :\t", all_signals_get(id)?.name) }
			// first make sure that all of this signal's dependencies are up to date (should they be among the set of ids to visit this update cycle)
			// `any_updated_dependency` is always initially `false`. however, if the signal id was `force`d, then it would be `true`, and skip dependency checking and updating.
			// you must use `force === true` for `StateSignal`s (because they are dependency free), or for a independently fired `EffectSignal`
			let any_updated_dependency: SignalUpdateStatus = force === true ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.NOT_UPDATED
			if (any_updated_dependency <= SignalUpdateStatus.NOT_UPDATED) {
				for (const dependency_id of rmap_get(id) ?? []) {
					propagateSignalUpdate(dependency_id)
					any_updated_dependency |= updated_this_cycle_get(dependency_id) ?? SignalUpdateStatus.NOT_UPDATED
				}
			}
			// now, depending on two AND criterias:
			// 1) at least one dependency has updated (or must be free of dependencies via `force === true`)
			// 2) AND, this signal's value has changed after the update computation (ie `run()` method)
			// if both criterias are met, then this signal should propagate forward towards its observers
			const this_signal_update_status: SignalUpdateStatus = any_updated_dependency >= SignalUpdateStatus.UPDATED ?
				(all_signals_get(id)?.run() ?? SignalUpdateStatus.NOT_UPDATED) :
				any_updated_dependency as (SignalUpdateStatus.NOT_UPDATED | SignalUpdateStatus.PENDING_ASYNC)
			updated_this_cycle_set(id, this_signal_update_status)
			if (DEBUG) { console.log("UPDATE_CYCLE\t", this_signal_update_status > 0 ? "propagating:\t" : this_signal_update_status < 0 ? "delaying    \t" : "blocking   :\t", all_signals_get(id)?.name) }
			if (this_signal_update_status >= SignalUpdateStatus.UPDATED) {
				fmap_get(id)?.forEach(propagateSignalUpdate)
			} else if (this_signal_update_status <= SignalUpdateStatus.PENDING_ASYNC) {
				batched_ids_push(id)
			}
		}
	}

	const log_get_request = DEBUG ? (observed_id: FROM, observer_id?: TO | UNTRACKED_ID) => {
		const
			observed_signal = all_signals_get(observed_id)!,
			observer_signal = observer_id ? all_signals_get(observer_id)! : { name: "untracked" }
		console.log(
			"GET:\t", observed_signal.name,
			"\tby OBSERVER:\t", observer_signal.name,
			"\twith VALUE\t", observed_signal.value,
		)
	} : () => { }

	class BaseSignal<T> {
		get: Accessor<T>
		set: Setter<T>
		id: number
		name?: string

		constructor(
			public value?: T,
			{
				name,
				equals
			}: BaseSignalConfig<T> = {},
		) {
			const
				id = ++id_counter,
				equals_fn = equals === false ? falsey_equality : (equals ?? default_equality)
			// register the new signal
			all_signals_set(id, this)
			// clear the `ids_to_visit_cache`, because the old cache won't include this new signal in any of this signal's dependency pathways.
			// the pathway (ie DFS) has to be re-discovered for this new signal to be included in it
			ids_to_visit_cache_clear()
			this.id = id
			this.name = name

			this.get = (observer_id?: TO | UNTRACKED_ID): T => {
				if (observer_id) {
					// register this.id to observer
					fadd(id, observer_id)
				}
				if (DEBUG) { log_get_request(id, observer_id) }
				return this.value as T
			}

			this.set = (new_value: T | Updater<T>): boolean => {
				const old_value = this.value
				return !equals_fn(old_value, (
					this.value = typeof new_value === "function" ?
						(new_value as Updater<T>)(old_value) :
						new_value
				))
			}
		}

		public run(): SignalUpdateStatus {
			return SignalUpdateStatus.UPDATED
		}
	}

	class StateSignal<T> extends BaseSignal<T> {
		declare value: T

		constructor(
			value: T,
			config?: BaseSignalConfig<T>,
		) {
			super(value, config)
			const
				id = this.id,
				set_value = this.set

			this.set = (new_value: T | Updater<T>): boolean => {
				const value_has_changed = set_value(new_value)
				if (value_has_changed) { batch_nestedness <= 0 ? fireUpdateCycle(id) : batched_ids_push(id) }
				return value_has_changed
			}
		}
	}

	class MemoSignal<T> extends BaseSignal<T> {
		constructor(
			fn: MemoFn<T>,
			config?: BaseSignalConfig<T>,
		) {
			super(config?.value, config)
			let rid: TO | UNTRACKED_ID = this.id
			const get_value = this.get
			const set_value = this.set
			const run = (): SignalUpdateStatus => {
				return set_value(fn(rid)) ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.NOT_UPDATED
			}
			const get = (observer_id?: TO | UNTRACKED_ID): T => {
				if (rid) {
					run()
					rid = 0 as UNTRACKED_ID
				}
				return get_value(observer_id)
			}
			this.get = get
			this.run = run
			if (config?.defer === false) { get() }
		}
	}

	class LazySignal<T> extends BaseSignal<T> {
		constructor(
			fn: MemoFn<T>,
			config?: BaseSignalConfig<T>,
		) {
			super(config?.value, config)
			let
				rid: TO | UNTRACKED_ID = this.id,
				dirty: 0 | 1 = 1
			const get_value = this.get
			const set_value = this.set
			const run = (): SignalUpdateStatus.UPDATED => {
				return (dirty = 1)
			}
			const get = (observer_id?: TO | UNTRACKED_ID): T => {
				if (rid || dirty) {
					set_value(fn(rid))
					dirty = 1
					rid = 0 as UNTRACKED_ID
				}
				return get_value(observer_id)
			}
			this.get = get
			this.run = run
			if (config?.defer === false) { get() }
		}
	}

	class EffectSignal extends BaseSignal<void> {
		constructor(
			fn: EffectFn,
			config?: BaseSignalConfig<void>,
		) {
			super(undefined, config)
			const
				id = this.id,
				get_value = this.get
			let rid: TO | UNTRACKED_ID = id
			const run = (): SignalUpdateStatus => {
				const signal_should_propagate = fn(rid) !== false
				if (rid) { rid = 0 as UNTRACKED_ID }
				return signal_should_propagate ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.NOT_UPDATED
			}
			// a non-untracked observer (which is what all new observers are) depending on an effect signal will result in the triggering of effect function.
			// this is an intentional design choice so that effects can be scaffolded on top of other effects.
			const get = (observer_id?: TO | UNTRACKED_ID): void => {
				if (observer_id) {
					run()
					get_value(observer_id)
				}
			}
			const set = () => {
				const effect_will_fire_immediately = batch_nestedness <= 0
				effect_will_fire_immediately ? fireUpdateCycle(id) : batched_ids_push(id)
				return effect_will_fire_immediately
			}
			this.get = get
			this.run = run
			this.set = set
			if (config?.defer === false) { set() }
		}
	}

	class AsyncMemoSignal<T> extends BaseSignal<T | Promise<T>> {
		constructor(
			fn: MemoFn<Promise<T>>,
			config?: BaseSignalConfig<T | Promise<T>>,
		) {
			super(config?.value, config)
			let
				current_promise: undefined | Promise<SignalUpdateStatus.UPDATED | SignalUpdateStatus.NOT_UPDATED>,
				rid: TO | UNTRACKED_ID = this.id
			const get_value = this.get
			const set_value = this.set
			const run = (): SignalUpdateStatus => {
				current_promise ??= fn(rid).then(
					(resolved_value: T) => {
						current_promise = undefined
						return set_value(resolved_value) ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.NOT_UPDATED
					}
				)



				return set_value(fn(rid)) ? SignalUpdateStatus.UPDATED : SignalUpdateStatus.NOT_UPDATED
			}
			const get = (observer_id?: TO | UNTRACKED_ID): T => {
				if (rid) {
					run()
					rid = 0 as UNTRACKED_ID
				}
				return get_value(observer_id)
			}
			this.get = get
			this.run = run
			if (config?.defer === false) { get() }
		}
	}

	const createState = <T>(value: T, config?: BaseSignalConfig<T>): AccessorSetter<T> => {
		const new_signal = new StateSignal(value, config)
		return [new_signal.get, new_signal.set]
	}

	const createMemo = <T>(fn: MemoFn<T>, config?: BaseSignalConfig<T>): Accessor<T> => {
		const new_signal = new MemoSignal(fn, config)
		return new_signal.get
	}

	const createLazy = <T>(fn: MemoFn<T>, config?: BaseSignalConfig<T>): Accessor<T> => {
		const new_signal = new LazySignal(fn, config)
		return new_signal.get
	}

	const createEffect = (fn: EffectFn, config?: BaseSignalConfig<void>): AccessorEmitter => {
		const new_signal = new EffectSignal(fn, config)
		return [new_signal.get, new_signal.set]
	}

	return {
		createState, createMemo, createLazy, createEffect,
		startBatching, endBatching, scopedBatching,
	}
}

const
	{ createState, createMemo, createLazy, createEffect } = createContext(),
	[A, setA] = createState(1, { name: "A" }),
	[B, setB] = createState(2, { name: "B" }),
	[C, setC] = createState(3, { name: "C" }),
	H = createMemo((id) => (A(id) + G(id)), { name: "H" }),
	G = createMemo((id) => (- D(id) + E(id) + 100), { name: "G" }),
	D = createMemo((id) => (A(id) * 0 + 10), { name: "D" }),
	E = createMemo((id) => (B(id) + F(id) + D(id) + C(id)), { name: "E" }),
	F = createMemo((id) => (C(id) + 20), { name: "F" }),
	I = createMemo((id) => (F(id) - 100), { name: "I" }),
	[K, fireK] = createEffect((id) => { console.log("this is effect K, broadcasting", A(id), B(id), E(id)); J(id) }, { name: "K" }),
	[J, fireJ] = createEffect((id) => { console.log("this is effect J, broadcasting", H(id), D(id), E(id)) }, { name: "J" })

I()
H()
K()

let start = performance.now()
for (let A_value = 0; A_value < 100_000; A_value++) {
	setA(A_value)
}
let end = performance.now()
console.log("time:\t", end - start, " ms") // takes 220ms to 300ms for updating signal `A` 100_000 times (with `DEBUG` off) (dfs nodes to update/visit are cached after first run)

setA(10)
setB(10)

/* TODO:
7) implement a maximum size for `ids_to_visit_cache`, after which it starts deleting the old entries (or most obscure/least called ones). this size should be set when creating a new context
9) implement gradually comuted signal (i.e. diff-able computaion signal based on each dependency signal's individual change)
11) create tests and examples
12) document how it works through a good graphical illustration
15) when caching `ids_to_visit`, only immediately cache single source `ids_to_visit`, and then when a multi source `ids_to_visit` is requested, combine/merge/union the two sources of single source `ids_to_visit`, and then cache this result too
17) design a cleanup mechanism, a deletion mechanism, and a frozen-delete mechanism (whereby a computed signal's value is forever frozen, and becomes non-reactive and non-propagating, and destroys its own `fn` computation function)
18) consider designing a "compress" (or maybe call it "collapse" or "crumple") function for a given context, where you specify your input/tweekable signals, and then specify the set of output signals,
	and then the function will collapse all intermediate computations into topologically ordered and executed functions (bare `fn`s).
	naturally, this will not be ideal computation wise, as it will bypass caching of all computed signals' values and force a recomputation on every input-signal update. but it may provide a way for deriving signals out of encapuslated contexts (ie composition)
20) consider if there is a need for a DOM specific signal (one that outputs JSX, but does not create a new JSX/DOM element on every update, but rather it modifies it partially so that it gets reflected directly/immediately in the DOM)
21) it would be nice if we could declare the signal classes outside of the `createContext` function, without losing performance (due to potential property accessing required when accessing the context's `fmap`, `rmap`, etc... local variables). maybe consider a higher order signal-class generator function?
23) add option for `cleanup` function in `BaseSignalConfig` when configuring a newly created signal. its purpose would be to get called when the signal is being destroyed
*/

/* DONE list:
1) [DONE] implement `batch` state.set and `untrack` state.set
2) [DONE, albeit not too impressive] implement createContext
3) [DONE, but needs work. see 22)] implement effect signal
4) [DONE] implement lazy signal
5) [DONE] remove dependance on id types
6) [DONE, I suppose...] check collision resistance of your hash_ids function
8) [DONE] implement `isEqual` and `defer: false`/`immediate: true` config options when creating signals
10) [DONE] rename `ReactiveSignal` to a `MemoSignal`
13) [UNPLANNED, because it requires pure Kahn's alorithm with BFS, whereas I'm currently using a combination of DFS for observers and BFS of untouched dependencies that must be visited. blocking propagation will be more dificult with Kahn, and furthermore, will require async awaiting + promises within the propagation cycle, which will lead to overall significant slowdown] develop asynchronous signals
14) [DONE] `ids_to_visit_cache` needs to be entirely flushed whenever ANY new signal is created under ANY circumstances (`ids_to_visit_cache_clear` should be executed in `BaseSignal.constructor`)
16) [DONE] batch set should be more primitive than `StateSignal.set`. in fact `StateSignal.set` should utilize batch setting underneath
	alternatively
16b) [UNPLANNED] add an aditional parameter `untrack?: boolean = false` to `StateSignal.set` that avoids propagation of the state signal.
19) [DONE, via `throttledEquals` equality function] implement a throttle signal (ie max-polling limiting)
19b) [UNPLANNED, because debouncing will require the current propagation cycle to remain alive, or will require some form of async signals/async propagation cycles/pending singals, which is unplanned] implement debounce signal (awaits a certain amount of time in which update stop occuring, for the signal to eventually fire), and an interval signal (is this one even necessary? perhaps it will be cleaner to use this instead of setInterval)
22) [DONE] EffectSignal.get results in multiple calls to EffectFn. this is not ideal because you will probably want each effect to run only once per cycle, however, the way it currently is, whenever each observer calls EffectSignal.get, the effect function gets called again.
	either consider using a counter/boolean to check if the effect has already run in the current cycle, or use EffectSignal.get purely for observer registration purposes (which may fire EffectFn iff the observer is new).
	and use EffectSignal.set for independent firing of EffectFn in addition to its propagation.
	this will lead to the following design choice: if `[J, fireJ] = createEffect(...)` and `[K, fireK] = createEffect(() => {J(); ...})` then `fireK()` will NOT result in EffectFn of `J` from running. to run `J` and propagate it to `K`, you will need to `fireJ()`
*/
