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
import { array_isEmpty, object_assign } from "./builtin_aliases_deps.ts"

const DEBUG = true as const

interface InvertibleGraphEdges<ID extends PropertyKey, FROM extends ID = ID, TO extends ID = ID> {
	/** forward mapping of directed edges. not intended for direct mutaion, since it will ruin the invertibility with the reverse map if you're not careful. */
	fmap: Map<FROM, Set<TO>>

	/** reverse mapping of directed edges. not intended for direct mutaion, since it will ruin the invertibility with the forward map if you're not careful. */
	rmap: Map<TO, Set<FROM>>

	/** at a specific source node `src_id` in the forward map, add an aditional destination node `dst_id`,
	 * and then also append `src_id` to `dst_id` in the reverse map to maintain invertibility.
	*/
	fadd: (src_id: FROM, dst_id: TO) => void

	/** at a specific destination node `dst_id` in the reverse map, add an aditional source node `src_id`,
	 * and then also append `dst_id` to `src_id` in the forward map to maintain invertibility.
	*/
	radd: (dst_id: TO, src_id: FROM) => void

	/** clear out both forward and reverse maps completely of all their entries */
	clear: () => void

	/** delete an `id` in the forward map, and also remove its mentions from the reverse map's entries. <br>
	 * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the forward map at the key,
	 * and keep the node id itself intact (along with the original (now mutated and cleared) `Set<TO>` which the key refers to). <br>
	 * @returns `true` if the node existed in the forward map before deletion, else `false`
	*/
	fdelete: (src_id: FROM, keep_key?: boolean) => boolean

	/** delete an `id` in the reverse map, and also remove its mentions from the forward map's entries. <br>
	 * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the reverse map at the key,
	 * and keep the node id itself intact (along with the original (now mutated and cleared) `Set<FROM>` which the key refers to). <br>
	 * @returns `true` if the node existed in the reverse map before deletion, else `false`
	*/
	rdelete: (dst_id: TO, keep_key?: boolean) => boolean

	/** at a specific `id` in the forward map, remove/delete the list of destination nodes `dst_ids`,
	 * and then also remove `id` from each of the list of `dst_ids` in the reverse map to maintain invertibility.
	*/
	fremove: (src_id: FROM, ...dst_ids: TO[]) => void

	/** at a specific `id` in the reverse map, remove/delete the list of source nodes `src_ids`,
	 * and then also remove `id` from each of the list of `src_ids` in the reverse map to maintain invertibility.
	*/
	rremove: (dst_id: TO, ...src_ids: FROM[]) => void


}


const NODE_TYPE_LEN = 4 as const

type ID = number
type FROM = number
type TO = number

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
	const forward_items = fmap_get(src_id) ?? (fmap_set(src_id, new Set()) && fmap_get(src_id)!)
	if (!forward_items.has(dst_id)) {
		forward_items.add(dst_id)
		if (!rmap_get(dst_id)?.add(src_id)) {
			rmap_set(dst_id, new Set([src_id]))
		}
	}
}

const radd = (dst_id: TO, src_id: FROM) => fadd(src_id, dst_id)

const
	all_signals = new Map<ID, SignalBase<any>>(),
	all_signals_get = bind_map_get(all_signals),
	all_signals_set = bind_map_set(all_signals)


class SignalBase<T> {
	rid: TO | 0
	value?: T

	constructor(
		public id: ID,
		public fn: (observer_id: TO | 0) => T
	) {
		this.rid = id as unknown as TO
		all_signals_set(id, this)
	}

	get = (observer_id?: TO | 0): T => {
		let { id, rid, value } = this
		if (observer_id) {
			// register this.id to observer
			fadd(id, observer_id)
		}
		if (rid || value === undefined) {
			this.run()
			this.rid = 0
			value = this.value
		}
		if (DEBUG) {
			console.table([["GET_ID", "OBSERVER_ID", "VALUE"], [id, observer_id, value]])
		}
		return value as T
	}

	run = () => {
		this.value = this.fn(this.rid)
	}
}
//}

// scheduler
const
	pending: Set<TO> = new Set<TO>(),
	pending_add = bind_set_add(pending),
	pending_delete = bind_set_delete(pending),
	pending_clear = bind_set_clear(pending),
	// count (value) of number of edges going INTO an id (key). (aka the number of dependencies an id has)
	deps_count: Map<TO, number> = new Map<TO, number>(),
	deps_count_get = bind_map_get(deps_count),
	deps_count_set = bind_map_set(deps_count),
	deps_count_clear = bind_map_clear(deps_count),
	// count (value) of number of rejected edges going INTO an id (key). (aka the number of dependencies, of an id, which have been rejected)
	// if the count tops up to the total number of edges going into the `id` (`rejected_deps_count[id] === get(id).size`),
	// then we will also have to reject `id`, and propagate its rejection's effect onto its dependants
	rejected_deps_count: Map<TO, number> = new Map<TO, number>(),
	rejected_deps_count_get = bind_map_get(rejected_deps_count),
	rejected_deps_count_set = bind_map_set(rejected_deps_count),
	rejected_deps_count_clear = bind_map_clear(rejected_deps_count),
	rforEach = bind_map_forEach(rmap)

const clear = () => {
	pending_clear()
	deps_count_clear()
	rejected_deps_count_clear()
	rforEach((src_ids, dst_id) => {
		deps_count_set(dst_id, src_ids.size)
	})
}

const fire = (...src_ids: FROM[]) => {
	clear();
	(src_ids as unknown[] as TO[]).forEach(pending_add)
}

const resolve = (...ids: ID[]): TO[] => {
	const next_ids: TO[] = []
	for (const id of ids as TO[]) {
		if (pending_delete(id)) {
			all_signals_get(id)!.run()
			fmap_get(id as unknown as FROM)?.forEach((dst_id) => {
				// `deps_count_get(dst_id)` may be undefined due to a dependency that was adder later (after a firing cycle had begun).
				// in that case, we look it up from `rmap_get(dst_id).size`, which should contain the updated info.
				// but if that too turns out to be undefined, then we fall back to `1 - 1`
				const deps_count_of_id = (
					deps_count_get(dst_id) ??
					rmap_get(dst_id)?.size ??
					1
				) - 1
				if (deps_count_of_id <= 0) {
					// `dst_id` now has no unresolved dependencies left. therefore we can push it `next_ids`, and eventually to `pending`
					next_ids.push(dst_id)
				}
				deps_count_set(dst_id, deps_count_of_id)
			})
		}
	}
	next_ids.forEach(pending_add)
	return next_ids
}

const reject = (...ids: ID[]): TO[] => {
	const next_rejected_ids: TO[] = []
	for (const id of ids as TO[]) {
		pending_delete(id)
		fmap_get(id as unknown as FROM)?.forEach((dst_id) => {
			const rejected_deps_count_of_id = (rejected_deps_count_get(dst_id) ?? 0) + 1
			rejected_deps_count_set(dst_id, rejected_deps_count_of_id)
			if (rejected_deps_count_of_id >= (rmap_get(dst_id)?.size ?? 0)) {
				// `dst_id` now has had all of its dependencies rejected. therefore we must now push it `next_rejected_ids`, and eventually to reject it on the next recursion
				next_rejected_ids.push(dst_id)
			}
		})
	}
	return (ids as TO[]).concat(
		array_isEmpty(next_rejected_ids) ?
			next_rejected_ids :
			reject(...next_rejected_ids)
	)
}



const
	A = new SignalBase("A", () => 1),
	B = new SignalBase("B", () => 2),
	C = new SignalBase("C", () => 3),
	D = new SignalBase("D", (id) => A.get(id) + 10),
	E = new SignalBase("E", (id) => B.get(id) + F.get(id) + D.get(id) + C.get(id)),
	F = new SignalBase("F", (id) => C.get(id) + 20),
	G = new SignalBase("G", (id) => E.get(id) + 100),
	H = new SignalBase("H", (id) => G.get(id) + A.get(id)),
	I = new SignalBase("I", (id) => F.get(id) - 100)

console.log(I.get())





class Context<ID extends number, FROM extends ID = ID, TO extends ID = ID> implements InvertibleGraphEdges<ID, FROM, TO> {
	// edge manipulation
	declare fmap: Map<FROM, Set<TO>>
	declare rmap: Map<TO, Set<FROM>>
	declare fadd: (src_id: FROM, dst_id: TO) => void
	declare radd: (dst_id: TO, src_id: FROM) => void
	declare clear_map: () => void
	declare fdelete: (src_id: FROM, keep_key?: boolean | undefined) => boolean
	declare rdelete: (dst_id: TO, keep_key?: boolean | undefined) => boolean
	declare fremove: (src_id: FROM, ...dst_ids: TO[]) => void
	declare rremove: (dst_id: TO, ...src_ids: FROM[]) => void
	// schedule manipulation
	declare pending: Set<TO>
	declare clear: () => void
	declare fire: (...src_ids: FROM[]) => void
	declare resolve: (...ids: ID[]) => TO[]
	declare reject: (...ids: ID[]) => TO[]


	constructor() {
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

		const fadd: this["fadd"] = (src_id: FROM, dst_id: TO) => {
			const forward_items = fmap_get(src_id) ?? (fmap_set(src_id, new Set()) && fmap_get(src_id)!)
			if (!forward_items.has(dst_id)) {
				forward_items.add(dst_id)
				if (!rmap_get(dst_id)?.add(src_id)) {
					rmap_set(dst_id, new Set([src_id]))
				}
			}
		}

		const radd: this["radd"] = (dst_id: TO, src_id: FROM) => fadd(src_id, dst_id)

		const clear_map: this["clear_map"] = () => {
			fmap_clear()
			rmap_clear()
		}

		const fdelete: this["fdelete"] = (src_id: FROM, keep_key: boolean = false): boolean => {
			const forward_items = fmap_get(src_id)
			if (forward_items) {
				// first remove all mentions of `id` from the reverse mapping
				forward_items.forEach((dst_id) => {
					rmap_get(dst_id)!.delete(src_id)
				})
				if (keep_key) { forward_items.clear() }
				else { keep_key = fmap_delete(src_id) }
			}
			return keep_key
		}

		const rdelete: this["rdelete"] = (dst_id: TO, keep_key: boolean = false): boolean => {
			const reverse_items = rmap_get(dst_id)
			if (reverse_items) {
				// first remove all mentions of `id` from the reverse mapping
				reverse_items.forEach((src_id) => {
					fmap_get(src_id)!.delete(dst_id)
				})
				if (keep_key) { reverse_items.clear() }
				else { keep_key = rmap_delete(dst_id) }
			}
			return keep_key
		}

		const fremove: this["fremove"] = (src_id: FROM, ...dst_ids: TO[]) => {
			const forward_items = fmap_get(src_id)
			if (forward_items) {
				const forward_items_delete = bind_set_delete(forward_items)
				dst_ids.forEach((dst_id) => {
					if (forward_items_delete(dst_id)) {
						rmap_get(dst_id)!.delete(src_id)
					}
				})
			}
		}

		const rremove: this["rremove"] = (dst_id: TO, ...src_ids: FROM[]) => {
			const reverse_items = rmap_get(dst_id)
			if (reverse_items) {
				const reverse_items_delete = bind_set_delete(reverse_items)
				src_ids.forEach((src_id) => {
					if (reverse_items_delete(src_id)) {
						fmap_get(src_id)!.delete(dst_id)
					}
				})
			}
		}

		// scheduler
		const
			pending: Set<TO> = new Set<TO>(),
			pending_add = bind_set_add(pending),
			pending_delete = bind_set_delete(pending),
			pending_clear = bind_set_clear(pending),
			// count (value) of number of edges going INTO an id (key). (aka the number of dependencies an id has)
			deps_count: Map<TO, number> = new Map<TO, number>(),
			deps_count_get = bind_map_get(deps_count),
			deps_count_set = bind_map_set(deps_count),
			deps_count_clear = bind_map_clear(deps_count),
			// count (value) of number of rejected edges going INTO an id (key). (aka the number of dependencies, of an id, which have been rejected)
			// if the count tops up to the total number of edges going into the `id` (`rejected_deps_count[id] === get(id).size`),
			// then we will also have to reject `id`, and propagate its rejection's effect onto its dependants
			rejected_deps_count: Map<TO, number> = new Map<TO, number>(),
			rejected_deps_count_get = bind_map_get(rejected_deps_count),
			rejected_deps_count_set = bind_map_set(rejected_deps_count),
			rejected_deps_count_clear = bind_map_clear(rejected_deps_count),
			rforEach = bind_map_forEach(rmap)

		const clear: this["clear"] = () => {
			pending_clear()
			deps_count_clear()
			rejected_deps_count_clear()
			rforEach((src_ids, dst_id) => {
				deps_count_set(dst_id, src_ids.size)
			})
		}

		const fire: this["fire"] = (...src_ids: FROM[]) => {
			clear();
			(src_ids as unknown[] as TO[]).forEach(pending_add)
		}

		const resolve: this["resolve"] = (...ids: ID[]): TO[] => {
			const next_ids: TO[] = []
			for (const id of ids as TO[]) {
				if (pending_delete(id)) {
					fmap_get(id as unknown as FROM)?.forEach((dst_id) => {
						// `deps_count_get(dst_id)` may be undefined due to a dependency that was adder later (after a firing cycle had begun).
						// in that case, we look it up from `rmap_get(dst_id).size`, which should contain the updated info.
						// but if that too turns out to be undefined, then we fall back to `1 - 1`
						const deps_count_of_id = (
							deps_count_get(dst_id) ??
							rmap_get(dst_id)?.size ??
							1
						) - 1
						if (deps_count_of_id <= 0) {
							// `dst_id` now has no unresolved dependencies left. therefore we can push it `next_ids`, and eventually to `pending`
							next_ids.push(dst_id)
						}
						deps_count_set(dst_id, deps_count_of_id)
					})
				}
			}
			next_ids.forEach(pending_add)
			return next_ids
		}

		const reject: this["reject"] = (...ids: ID[]): TO[] => {
			const next_rejected_ids: TO[] = []
			for (const id of ids as TO[]) {
				pending_delete(id)
				fmap_get(id as unknown as FROM)?.forEach((dst_id) => {
					const rejected_deps_count_of_id = (rejected_deps_count_get(dst_id) ?? 0) + 1
					rejected_deps_count_set(dst_id, rejected_deps_count_of_id)
					if (rejected_deps_count_of_id >= (rmap_get(dst_id)?.size ?? 0)) {
						// `dst_id` now has had all of its dependencies rejected. therefore we must now push it `next_rejected_ids`, and eventually to reject it on the next recursion
						next_rejected_ids.push(dst_id)
					}
				})
			}
			return (ids as TO[]).concat(
				array_isEmpty(next_rejected_ids) ?
					next_rejected_ids :
					reject(...next_rejected_ids)
			)
		}



		class SignalBase {
			id = increment_id_counter() as ID
			declare rid: ID | 0

			constructor() {
				this.rid = this.id

			}

			/**  */
			fire = () => {
				fire(this.id as FROM)
			}

			get = (observer_id: TO | 0) => {
				if (observer_id) {
					fadd(this.id as FROM, observer_id)
				}
				console.log("GET: ", this.id, " OBSERVER: ", observer_id)
				return
			}

		}

		object_assign(this, { pending, clear, fire, resolve, reject })

	}

}


/*
let A, B, C, D, E, F, G, H, I

G.fn = (id: number) => {
	E(id)
	D(id)
}
// add(E, G); add(D, G)
// OR: radd(G, E, D)

D.fn = (id: number) => {
	A(id)
}

E.fn = (id: number) => {
	D(id)
	C(id)
	F(id)
	B(id)
}

F.fn = (id: number) => {
	C(id)
}
*/
