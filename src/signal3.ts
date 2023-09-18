import {
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

const DEBUG = true as const
const NODE_TYPE_LEN = 4 as const

type ID = number
type FROM = number
type TO = number
type HASH_IDS = number

//const createContext = <ID = number, FROM = number, TO = number>() => {
let id_counter: number = 0
const
	increment_id_counter = (): number => (id_counter += NODE_TYPE_LEN),
	fmap = new Map<FROM, Set<TO>>(),
	rmap = new Map<TO, Set<FROM>>(),
	fmap_get = bind_map_get(fmap),
	rmap_get = bind_map_get(rmap),
	fmap_set = bind_map_set(fmap),
	rmap_set = bind_map_set(rmap),
	fmap_delete = bind_map_delete(fmap),
	rmap_delete = bind_map_delete(rmap),
	fmap_clear = bind_map_clear(fmap),
	rmap_clear = bind_map_clear(rmap)

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

const radd = (dst_id: TO, src_id: FROM) => fadd(src_id, dst_id)

const
	hash_ids = (ids: ID[]): HASH_IDS => {
		return (ids.reduce((sum, id) => sum + id ** 2, ids.length ** 7)) ** (1 / 2)
	},
	ids_to_visit_cache = new Map<HASH_IDS, Set<ID>>(),
	ids_to_visit_cache_get = bind_map_get(ids_to_visit_cache),
	ids_to_visit_cache_set = bind_map_set(ids_to_visit_cache),
	ids_to_visit_cache_clear = bind_map_clear(ids_to_visit_cache),
	ids_to_visit_cache_add_entry = (source_ids: ID[]): Set<ID> => {
		const
			to_visit = new Set<ID>(),
			to_visit_add = bind_set_add(to_visit),
			to_visit_has = bind_set_has(to_visit),
			to_visit_delete = bind_set_delete(to_visit)
		const dfs_visiter = (id: ID) => {
			if (!to_visit_has(id)) {
				to_visit_add(id)
				fmap.get(id)?.forEach(dfs_visiter)
			}
		}
		source_ids.forEach(dfs_visiter)
		return to_visit
	},
	get_ids_to_visit = (...source_ids: ID[]): Set<ID> => {
		const hash = hash_ids(source_ids)
		return ids_to_visit_cache_get(hash) ?? (
			ids_to_visit_cache_set(hash, ids_to_visit_cache_add_entry(source_ids)) &&
			ids_to_visit_cache_get(hash)!
		)
	}

const
	all_signals = new Map<ID, BaseSignal<any>>(),
	all_signals_get = bind_map_get(all_signals),
	all_signals_set = bind_map_set(all_signals)


class BaseSignal<T> {
	constructor(
		public id: ID,
		public value?: T
	) {
		all_signals_set(id, this)
	}

	get = (observer_id?: TO | 0): T => {
		if (observer_id) {
			// register this.id to observer
			fadd(this.id, observer_id)
		}
		if (DEBUG) {
			console.log("GET_ID:\t", this.id , "\tby OBSERVER_ID:\t", observer_id, "\twith VALUE\t", this.value)
		}
		return this.value as T
	}

	set = (new_value: T): boolean => {
		const old_value = this.value
		this.value = new_value
		return old_value !== new_value
	}

	run(): boolean {
		return true
	}
}

const
	to_visit_this_cycle = new Set<ID>(),
	to_visit_this_cycle_add = bind_set_add(to_visit_this_cycle),
	to_visit_this_cycle_delete = bind_set_delete(to_visit_this_cycle),
	to_visit_this_cycle_clear = bind_set_clear(to_visit_this_cycle),
	updated_this_cycle = new Map<ID, boolean>(),
	updated_this_cycle_get = bind_map_get(updated_this_cycle),
	updated_this_cycle_set = bind_map_set(updated_this_cycle),
	updated_this_cycle_clear = bind_map_clear(updated_this_cycle)

const propagateSignalUpdate = (id: ID) => {
	if (to_visit_this_cycle_delete(id)) {
		if (DEBUG) { console.log("UPDATE_CYCLE\t", "visiting    id:\t", id) }
		// first make sure that all of this signal's dependencies are up to date (should they be among the set of ids to visit this update cycle)
		const dependencies = rmap_get(id)
		let any_updated_dependency = (dependencies?.size ?? 0) === 0
		for (const dep_id of dependencies ?? []) {
			propagateSignalUpdate(dep_id)
			any_updated_dependency ||= updated_this_cycle_get(dep_id) ?? false
		}
		// now, depending on two AND criterias:
		// 1) at least one dependency has updated
		// 2) AND, this signal's value has changed after the update computation (ie `run()` method)
		// if both criterias are met, then this signal should propagate forward towards its observers
		const this_signal_should_propagate = any_updated_dependency && (all_signals_get(id)?.run() ?? false)
		updated_this_cycle_set(id, this_signal_should_propagate)
		if (DEBUG) { console.log("UPDATE_CYCLE\t", this_signal_should_propagate ? "propagating id:\t" : "blocking    id:\t", id) }
		if (this_signal_should_propagate) {
			fmap_get(id)?.forEach(propagateSignalUpdate)
		}
	}
}

class StateSignal<T> extends BaseSignal<T> {
	declare value: T

	constructor(
		id: ID,
		value: T
	) {
		super(id, value)
		const set_value = this.set
		const set = (new_value: T): boolean => {
			const value_changed = set_value(new_value)
			if (value_changed) {
				to_visit_this_cycle_clear()
				updated_this_cycle_clear()
				// clone the ids to visit into the "visit cycle for this update"
				get_ids_to_visit(id).forEach(to_visit_this_cycle_add)
				propagateSignalUpdate(id)
			}
			return value_changed
		}
		this.set = set
	}
}


class ReactiveSignal<T> extends BaseSignal<T> {
	run: () => boolean

	constructor(
		id: ID,
		fn: (observer_id: TO | 0) => T
	) {
		super(id)
		let rid: TO | 0 = id
		const get_value = this.get
		const set_value = this.set
		const run = (): boolean => {
			return set_value(fn(rid))
		}
		const get = (observer_id?: TO | 0): T => {
			if (rid || this.value === undefined) {
				run()
				rid = 0
			}
			return get_value(observer_id)
		}
		this.get = get
		this.run = run
	}
}
//}

const
	A = new StateSignal("A", 1),
	B = new StateSignal("B", 2),
	C = new StateSignal("C", 3),
	H = new ReactiveSignal("H", (id) => A.get(id) + G.get(id)),
	G = new ReactiveSignal("G", (id) => - D.get(id) + E.get(id) + 100),
	D = new ReactiveSignal("D", (id) => A.get(id) * 0 + 10),
	E = new ReactiveSignal("E", (id) => B.get(id) + F.get(id) + D.get(id) + C.get(id)),
	F = new ReactiveSignal("F", (id) => C.get(id) + 20),
	I = new ReactiveSignal("I", (id) => F.get(id) - 100)

I.get()
H.get()

let start = performance.now()
for (let A_value = 0; A_value < 100_000; A_value++) {
	A.set(A_value)
}
let end = performance.now()
console.log("time:\t", end - start, " ms") // takes 220ms to 300ms for updating signal `A` 100_000 times (with `DEBUG` off) (dfs nodes to update/visit are cached after first run)

A.set(10)
B.set(10)

/* TODO:
1) implement `batch` state.set and `untrack` state.set
2) implement createContext
3) implement effect signal
4) implement lazy signal
5) remove dependance on id types
6) check collision resistance of your hash_ids function
7) implement a maximum size for `ids_to_visit_cache`, after which it starts deleting the old entries (or most obscure/least called ones). this size should be set when creating a new context
8) implement `isEqual` and `defer: false`/`immediate: true` config options when creating signals
9) implement gradually comuted signal (i.e. diff-able computaion signal based on each dependency signal's individual change)
10) rename `ReactiveSignal` to a `MemoSignal`
11) create tests and examples
12) document how it works through a good graphical illustration
13) develop asynchronous signals
14) `ids_to_visit_cache` needs to be entirely flushed whenever ANY new signal is created under ANY circumstances (`ids_to_visit_cache_clear` should be executed in `BaseSignal.constructor`)
15) when caching `ids_to_visit`, only immediately cache single source `ids_to_visit`, and then when a multi source `ids_to_visit` is requested, combine/merge/union the two sources of single source `ids_to_visit`, and then cache this result too
16) batch set should be more primitive than `StateSignal.set`. in fact `StateSignal.set` should utilize batch setting underneath
	alternatively, add an aditional parameter `untrack?: boolean = false` to `StateSignal.set` that avoids propagation of the state signal.
*/
