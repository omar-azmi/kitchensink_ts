/** contains a set of common collections
 * @module
*/
import "./_dnt.polyfills.js";


import {
	bind_array_clear,
	bind_array_pop,
	bind_array_push,
	bind_map_delete,
	bind_map_entries,
	bind_map_forEach,
	bind_map_get,
	bind_map_has,
	bind_map_keys,
	bind_map_set,
	bind_map_values,
	bind_set_add,
	bind_set_delete,
	bind_set_has,
	bind_stack_seek,
} from "./binder.js"
import { array_isEmpty, object_assign, symbol_iterator, symbol_toStringTag } from "./builtin_aliases_deps.js"
import { modulo } from "./numericmethods.js"
import { isComplex, monkeyPatchPrototypeOfClass } from "./struct.js"
import { PrefixProps } from "./typedefs.js"

/** a double-ended circular queue, similar to python's `collection.deque` */
export class Deque<T> {
	private items: T[]
	private front: number = 0
	private back: number
	count: number = 0

	/** a double-ended circular queue, similar to python's `collection.deque` <br>
	 * @param length maximum length of the queue. <br>
	 * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
	*/
	constructor(public length: number) {
		this.items = Array(length)
		this.back = length - 1
	}

	static {
		// we are forced to assign `[Symbol.iterator]` method to the prototype in a static block (on the first class invokation),
		// because `esbuild` does not consider Symbol propety method assignment to be side-effect free.
		// which in turn results in this class being included in any bundle that imports anything from `collections.ts`
		/*@__PURE__*/
		monkeyPatchPrototypeOfClass<Deque<any>>(this, symbol_iterator as typeof Symbol.iterator, function (this: Deque<unknown>) {
			const count = this.count
			let i = 0
			return {
				next: () => i < count ?
					{ value: this.at(i++), done: false } :
					{ value: undefined, done: true }
			}
		})
	}

	/** iterate over the items in this deque, starting from the rear-most item, and ending at the front-most item */
	declare [Symbol.iterator]: () => Iterator<T>

	/** inserts one or more items to the back of the deque. <br>
	 * if the deque is full, it will remove the front item before adding a new item
	*/
	pushBack(...items: T[]): void {
		for (const item of items) {
			if (this.count === this.length) this.popFront()
			this.items[this.back] = item
			this.back = modulo(this.back - 1, this.length)
			this.count++
		}
	}

	/** inserts one or more items to the front of the deque. <br>
	 * if the deque is full, it will remove the rear item before adding a new item
	*/
	pushFront(...items: T[]): void {
		for (const item of items) {
			if (this.count === this.length) this.popBack()
			this.items[this.front] = item
			this.front = modulo(this.front + 1, this.length)
			this.count++
		}
	}

	/** get the item at the back of the deque without removing/popping it */
	getBack(): T | undefined {
		if (this.count === 0) return undefined
		return this.items[modulo(this.back + 1, this.length)]
	}

	/** get the item at the front of the deque without removing/popping it */
	getFront(): T | undefined {
		if (this.count === 0) return undefined
		return this.items[modulo(this.front - 1, this.length)]
	}

	/** removes/pops the item at the back of the deque and returns it */
	popBack(): T | undefined {
		if (this.count === 0) return undefined
		this.back = modulo(this.back + 1, this.length)
		const item = this.items[this.back]
		this.items[this.back] = undefined as T
		this.count--
		return item
	}

	/** removes/pops the item at the front of the deque and returns it */
	popFront(): T | undefined {
		if (this.count === 0) return undefined
		this.front = modulo(this.front - 1, this.length)
		const item = this.items[this.front]
		this.items[this.front] = undefined as T
		this.count--
		return item
	}

	/** rotates the deque `steps` number of positions to the right. <br>
	 * if `steps` is negative, then it will rotate in the left direction. <br>
	 * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
	*/
	rotate(steps: number): void {
		const { front, back, length, count, items } = this
		if (count === 0) return
		steps = modulo(steps, count)
		if (count < length) {
			// move `steps` number of items from the front to the rear
			for (let i = 0; i < steps; i++) {
				const
					b = modulo(back - i, length),
					f = modulo(front - i - 1, length)
				items[b] = items[f]
				items[f] = undefined as T
			}
		}
		this.front = modulo(front - steps, length)
		this.back = modulo(back - steps, length)
	}

	/** reverses the order of the items in the deque. */
	reverse(): void {
		const
			center = (this.count / 2) | 0,
			{ length, front, back, items } = this
		for (let i = 1; i <= center; i++) {
			const
				b = modulo(back + i, length),
				f = modulo(front - i, length),
				temp = items[b]
			items[b] = items[f]
			items[f] = temp
		}
	}

	/** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
	 * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
	 * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
	*/
	private resolveIndex(index: number): number { return modulo(this.back + index + 1, this.length) }

	/** returns the item at the specified index.
	 * @param index The index of the item to retrieve, relative to the rear-most element
	 * @returns The item at the specified index, or `undefined` if the index is out of range
	*/
	at(index: number): T | undefined { return this.items[this.resolveIndex(index)] }

	/** replaces the item at the specified index with a new item. */
	replace(index: number, item: T): void {
		// note that replacing does not increment the indexes of `front` and `back`.
		this.items[modulo(this.back + index + 1, this.count)] = item
	}

	/** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
	 * if the deque is full, it removes the front item before adding the new item.
	*/
	insert(index: number, item: T): void {
		if (this.count === this.length) this.popFront()
		const i = this.resolveIndex(index)
		// `this.items[this.front]` is guaranteed to be empty. so now we push everything ahead of the insertion index `i` one step into the front to make room for the insertion
		for (let j = this.front; j > i; j--) this.items[j] = this.items[j - 1]
		this.items[i] = item
		this.count++
	}
}

/** invert a map */
export const invertMap = <F, R>(forward_map: Map<F, Set<R>>): Map<R, Set<F>> => {
	const reverse_map_keys: R[] = []
	forward_map.forEach((rset) => { reverse_map_keys.push(...rset) })
	const
		reverse_map: Map<R, Set<F>> = new Map(
			[...(new Set<R>(reverse_map_keys))].map(
				(rkey) => [rkey, new Set<F>()]
			)
		),
		get_reverse_map = bind_map_get(reverse_map)
	for (const [fkey, rset] of forward_map) {
		rset.forEach(
			(rkey) => get_reverse_map(rkey)!.add(fkey)
		)
	}
	return reverse_map
}

export type InvertibleMapBase<K, V> = Map<K, Set<V>> & Omit<PrefixProps<Map<V, Set<K>>, "r">, "rclear" | "rset"> & { rset: (key: V, value: Iterable<K>) => InvertibleMapBase<K, V> }

/** an invertible map maintains a bidirectional one-to-many mapping between `keys` (of kind `K`) and collection of values (of kind `Set<V>`). <br>
 * the reverse mapping is also a one-to-many between `keys` (of kind `V`) and collection of values (of kind `Set<K>`). <br>
 * the dual map model of this class allows for quick lookups and mutations both directions. <br>
 * this data structure highly resembles a directed graph's edges. <br>
 *
 * @typeparam K the type of keys in the forward map
 * @typeparam V the type of values in the reverse map
 *
 * @example
 * ```ts
 * const bimap = new InvertibleMap<number, string>()
 * 
 * // add values to the forward map
 * bimap.add(1, "one", "first")
 * bimap.add(2, "two", "second")
 * 
 * // add values to the reverse map
 * bimap.radd("second", 3, 4, 5)
 * 
 * // perform lookups in both directions
 * console.log(bimap.get(1)) // `Set(["one", "first"])`
 * console.log(bimap.rget("second")) // `Set([2, 3, 4, 5])`
 * 
 * // remove entries while maintaining invertibility
 * bimap.delete(6) // `false` because the key never existed
 * bimap.delete(2) // `true`
 * console.log(bimap.rget("second")) // `Set([3, 4, 5])`
 * bimap.rremove("second", 4, 5, 6, 7)
 * console.log(bimap.rget("second")) // `Set([3])`
 * 
 * // iterate over the forward map
 * const bimap_entries: [key: number, values: string[]][] = []
 * for (const [k, v] of bimap) { bimap_entries.push([k, [...v]]) }
 * console.log(bimap_entries) // `[[1, ["one", "first"]], [3, ["second"]], [4, []], [5, []]]`
 * 
 * // clear the entire bidirectional map
 * bimap.clear()
 * ```
*/
export class InvertibleMap<K, V> implements InvertibleMapBase<K, V> {
	/** forward mapping. not intended for direct access, since manually mutating it will ruin the invertibility with the reverse map if you're not careful. */
	declare fmap: Map<K, Set<V>>

	/** reverse mapping. not intended for direct access, since manually mutating it will ruin the invertibility with the forward map if you're not careful. */
	declare rmap: Map<V, Set<K>>

	/** size of the forward map */
	declare size: number

	/** size of the reverse map */
	declare rsize: number

	/** at a specific `key` in the forward map, add the list of `items`,
	 * and then also assign `key` to the list of items in the reverse map to maintain invertibility.
	*/
	declare add: (key: K, ...items: V[]) => void

	/** at a specific `key` in the reverse map, add the list of `items`,
	 * and then also assign `key` to the list of items in the forward map to maintain invertibility.
	*/
	declare radd: (key: V, ...items: K[]) => void

	/** clear out both forward and reverse maps completely of all their entries */
	declare clear: () => void

	/** delete a `key` in the forward map, and also remove its mentions from the reverse map's entries. <br>
	 * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the forward map at the key,
	 * and keep the key itself intact (along with the original (now mutated and clear) `Set<V>` which the key refers to)
	*/
	declare delete: (key: K, keep_key?: boolean) => boolean

	/** delete a `key` in the reverse map, and also remove its mentions from the forward map's entries. <br>
	 * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the reverse map at the key,
	 * and keep the key itself intact (along with the original (now mutated and clear) `Set<V>` which the key refers to)
	*/
	declare rdelete: (key: V, keep_key?: boolean) => boolean

	/** at a specific `key` in the forward map, remove/delete the list of `items`,
	 * and then also remove `key` from the list of items in the reverse map to maintain invertibility.
	*/
	declare remove: (key: K, ...items: V[]) => void

	/** at a specific `key` in the reverse map, remove/delete the list of `items`,
	 * and then also remove `key` from the list of items in the forward map to maintain invertibility.
	*/
	declare rremove: (key: V, ...items: K[]) => void

	declare forEach: (callbackfn: (value: Set<V>, key: K, map: Map<K, Set<V>>) => void, thisArg?: any) => void
	declare rforEach: (callbackfn: (value: Set<K>, key: V, map: Map<V, Set<K>>) => void, thisArg?: any) => void
	declare get: (key: K) => Set<V> | undefined
	declare rget: (key: V) => Set<K> | undefined
	declare has: (key: K) => boolean
	declare rhas: (key: V) => boolean
	declare set: (key: K, value: Iterable<V>) => this
	declare rset: (key: V, value: Iterable<K>) => this
	declare entries: () => IterableIterator<[K, Set<V>]>
	declare rentries: () => IterableIterator<[V, Set<K>]>
	declare keys: () => IterableIterator<K>
	declare rkeys: () => IterableIterator<V>
	declare values: () => IterableIterator<Set<V>>
	declare rvalues: () => IterableIterator<Set<K>>
	declare [Symbol.iterator]: () => IterableIterator<[K, Set<V>]>
	declare [Symbol.toStringTag]: string

	/** create an empty invertible map. <br>
	 * optionally provide an initial `forward_map` to populate the forward mapping, and then automatically deriving the reverse mapping from it. <br>
	 * or provide an initial `reverse_map` to populate the reverse mapping, and then automatically deriving the froward mapping from it. <br>
	 * if both `forward_map` and `reverse_map` are provided, then it will be up to YOU to make sure that they are actual inverses of each other. <br>
	 * @param forward_map initiallize by populating with an optional initial forward map (the reverse map will be automatically computed if `reverse_map === undefined`)
	 * @param reverse_map initiallize by populating with an optional initial reverse map (the forward map will be automatically computed if `forward_map === undefined`)
	 */
	constructor(
		forward_map?: Map<K, Set<V>> | undefined,
		reverse_map?: Map<V, Set<K>> | undefined,
	) {
		const
			// forward mapping
			fmap: Map<K, Set<V>> = forward_map ?? (reverse_map ? invertMap<V, K>(reverse_map) : new Map()),
			// reverse (backward/rear) mapping
			rmap: Map<V, Set<K>> = reverse_map ?? (forward_map ? invertMap<K, V>(forward_map) : new Map()),
			// binding accessor methods for quicker execution
			fmap_set = bind_map_set(fmap),
			rmap_set = bind_map_set(rmap),
			fmap_delete = bind_map_delete(fmap),
			rmap_delete = bind_map_delete(rmap),
			size: this["size"] = fmap.size,
			rsize: this["rsize"] = rmap.size,
			forEach: this["forEach"] = bind_map_forEach(fmap),
			rforEach: this["rforEach"] = bind_map_forEach(rmap),
			get: this["get"] = bind_map_get(fmap),
			rget: this["rget"] = bind_map_get(rmap),
			has: this["has"] = bind_map_has(fmap),
			rhas: this["rhas"] = bind_map_has(rmap),
			entries: this["entries"] = bind_map_entries(fmap),
			rentries: this["rentries"] = bind_map_entries(rmap),
			keys: this["keys"] = bind_map_keys(fmap),
			rkeys: this["rkeys"] = bind_map_keys(rmap),
			values: this["values"] = bind_map_values(fmap),
			rvalues: this["rvalues"] = bind_map_values(rmap)

		const add: this["add"] = (key: K, ...items: V[]) => {
			const
				forward_items = get(key) ?? (fmap_set(key, new Set()) && get(key)!),
				forward_items_has = bind_set_has(forward_items),
				forward_items_add = bind_set_add(forward_items)
			for (const item of items) {
				if (!forward_items_has(item)) {
					forward_items_add(item)
					if (!rget(item)?.add(key)) {
						rmap_set(item, new Set([key]))
					}
				}
			}
		}

		const radd: this["radd"] = (key: V, ...items: K[]) => {
			const
				reverse_items = rget(key) ?? (rmap_set(key, new Set()) && rget(key)!),
				reverse_items_has = bind_set_has(reverse_items),
				reverse_items_add = bind_set_add(reverse_items)
			for (const item of items) {
				if (!reverse_items_has(item)) {
					reverse_items_add(item)
					if (!get(item)?.add(key)) {
						fmap_set(item, new Set([key]))
					}
				}
			}
		}

		const clear: this["clear"] = () => {
			fmap.clear()
			rmap.clear()
		}

		const fdelete: this["delete"] = (key: K, keep_key: boolean = false): boolean => {
			const forward_items = get(key)
			if (forward_items) {
				// first remove all mentions of `key` from the reverse mapping
				for (const item of forward_items) {
					rget(item)!.delete(key)
				}
				if (keep_key) { forward_items.clear() }
				else { keep_key = fmap_delete(key) }
			}
			return keep_key
		}

		const rdelete: this["rdelete"] = (key: V, keep_key: boolean = false): boolean => {
			const reverse_items = rget(key)
			// first remove all mentions of `key` from the forward mapping
			if (reverse_items) {
				// first remove all mentions of `key` from the reverse mapping
				for (const item of reverse_items) {
					get(item)!.delete(key)
				}
				if (keep_key) { reverse_items.clear() }
				else { keep_key = rmap_delete(key) }
			}
			return keep_key
		}

		const remove: this["remove"] = (key: K, ...items: V[]) => {
			const forward_items = get(key)
			if (forward_items) {
				const forward_items_delete = bind_set_delete(forward_items)
				for (const item of items) {
					if (forward_items_delete(item)) {
						rget(item)!.delete(key)
					}
				}
			}
		}

		const rremove: this["rremove"] = (key: V, ...items: K[]) => {
			const reverse_items = rget(key)
			if (reverse_items) {
				const reverse_items_delete = bind_set_delete(reverse_items)
				for (const item of items) {
					if (reverse_items_delete(item)) {
						get(item)!.delete(key)
					}
				}
			}
		}

		const set: this["set"] = (key: K, value: Iterable<V>): this => {
			// first we must delete the `key` if it already exists
			fdelete(key, true)
			add(key, ...value)
			return this
		}

		const rset: this["rset"] = (key: V, value: Iterable<K>): this => {
			// first we must delete the `key` if it already exists
			rdelete(key, true)
			radd(key, ...value)
			return this
		}

		object_assign(this, {
			fmap, rmap, size, rsize, forEach, rforEach, get, rget, has, rhas, entries, rentries, keys, rkeys, values, rvalues,
			add, radd, clear, delete: fdelete, rdelete, remove, rremove, set, rset,
			[symbol_iterator]: entries,
			[symbol_toStringTag]: "InvertibleMap",
		})
	}
}

/*
export class InvertibleMapCloneable<K extends PropertyKey, V extends PropertyKey> extends InvertibleMap<K, V> {
	declare toObject: () => Partial<Record<K, Array<V>>>
	declare rtoObject: () => Partial<Record<V, Array<K>>>

	constructor(
		forward_map?: Map<K, Set<V>> | undefined,
		reverse_map?: Map<V, Set<K>> | undefined,
	) {
		super(forward_map, reverse_map)
		const map_to_object_factory = <MK extends PropertyKey, MV>(map: Map<MK, Iterable<MV>>): (() => Partial<Record<MK, Array<MV>>>) => (() => {
			const obj: Partial<Record<MK, Array<MV>>> = {}
			map.forEach((value, key) => {
				obj[key] = array_from(value)
			})
			return obj
		})
		this.toObject = map_to_object_factory(this.fmap)
		this.rtoObject = map_to_object_factory(this.rmap)
	}
}
*/

/** a directed acyclic graph edges mapping optimized for looking up number of connections going **into** and **out of** a node */
/*
export class DAGSystem<ID, FROM extends ID = ID, TO extends ID = ID> extends InvertibleMap<FROM, TO> {
	constructor(
		forward_map?: Map<FROM, Set<TO>> | undefined,
		reverse_map?: Map<TO, Set<FROM>> | undefined,
	) {
		super(forward_map, reverse_map)
		const {
			fmap, rmap, add, radd, delete: fdelete, rdelete, remove, rremove, set, rset, forEach, rforEach,
		} = this
		const
			count = new Map<FROM, number>(),
			count_get = bind_map_get(count),
			count_set = bind_map_set(count),
			rcount = new Map<TO, number>(),
			rcount_get = bind_map_get(rcount),
			rcount_set = bind_map_set(rcount)

		const
			count_update = (to_ids: Set<TO>, from_id: FROM) => { count_set(from_id, to_ids.size) },
			rcount_update = (from_ids: Set<FROM>, to_id: TO) => { rcount_set(to_id, from_ids.size) },
			count_update_all = () => forEach(count_update),
			rcount_update_all = () => rforEach(rcount_update)
	}

}
*/

export type GraphEdges<ID, FROM extends ID = ID, TO extends ID = ID> = Map<FROM, Set<TO>>

export class TopologicalScheduler<ID, FROM extends ID = ID, TO extends ID = ID> {
	/** the edges depict the directed edge from an id (`key: FROM`) to a set of ids (`value: Set<TO>`) */
	declare readonly edges: GraphEdges<ID, FROM, TO>

	/** after a source id is fired, this stack will get filled up with dependent node ids in topological order. <br>
	 * the top item in the stack will correspond to the first node id that must be processed (least dependency),
	 * while the bottom one will be the last to be resolved (most dependencies). <br>
	 * use the {@link pop} method to pop out the top from this stack, or use the {@link seek} method just to view the top without popping.
	*/
	declare readonly stack: ID[]

	/** declare ids that need to be fired simultaneously.
	 * once the ids are fired, the function will topologically traverse the {@link edges} (via DFS),
	 * and eventually push the order of resoluion into the {@link stack}. <br>
	 * make sure that the source ids are NOT dependent on one another, because that will break the topological ordering of the output stack.
	*/
	declare fire: (...source_ids: FROM[]) => void

	/** while processing topologically ordered {@link stack}, you may block certain ids so that they and
	 * their (pure) dependents down the line are removed from the {@link stack}. <br>
	 * if no id is provided (no arguments), then we will assume that you wish to block the most recently popped id.
	*/
	declare block: (...block_ids: FROM[] | never[]) => void

	/** clear the topologically ordered {@link stack}, perhaps to restart the traversal. */
	declare clear: () => void

	/** pop the top element from the topologically ordered {@link stack}. */
	declare pop: () => ID | undefined

	/** view the top element from the topologically ordered {@link stack} without popping it. */
	declare seek: () => ID | undefined

	/** iterate over the topologically ordered {@link stack} of ids */
	declare [Symbol.iterator]: () => IterableIterator<ID>

	constructor(edges: GraphEdges<ID, FROM, TO>) {
		let prev_id: undefined | ID = undefined
		const
			edges_get = bind_map_get(edges),
			stack: ID[] = [],
			stack_pop = bind_array_pop(stack),
			stack_push = bind_array_push(stack),
			stack_clear = bind_array_clear(stack),
			seek = bind_stack_seek(stack),
			visits = new Map<ID, number>(),
			visits_get = bind_map_get(visits),
			visits_set = bind_map_set(visits)

		const recursive_dfs_visiter = (id: FROM) => {
			for (const to_id of edges_get(id) ?? []) {
				const visits = visits_get(to_id)
				// if the child node has been visited at least once before (`0 || undefined`), do not dfs revisit it again. just increment its counter
				if (visits) { visits_set(to_id, visits + 1) }
				else { recursive_dfs_visiter(to_id as unknown as FROM) }
			}
			visits_set(id, 1)
		}

		const recursive_dfs_unvisiter = (id: FROM) => {
			visits_set(id, 0)
			for (const to_id of edges_get(id) ?? []) {
				const new_visits = (visits_get(to_id) ?? 0) - 1
				if (new_visits > -1) {
					visits_set(to_id, new_visits)
					// if the child node has become unvisitable (`new_visits === 0`), then the grand-children should decrement by a visit too via recursion
					if (new_visits < 1) { recursive_dfs_unvisiter(to_id as unknown as FROM) }
				}
			}
		}

		const compute_stacks_based_on_visits = () => {
			stack_clear()
			for (const [id, number_of_visits] of visits) {
				if (number_of_visits > 0) { stack_push(id) }
			}
		}

		const pop = () => {
			prev_id = stack_pop()
			if (prev_id !== undefined) { visits_set(prev_id, 0) }
			return prev_id
		}

		const fire = (...source_ids: FROM[]) => {
			visits.clear()
			source_ids.forEach(recursive_dfs_visiter)
			compute_stacks_based_on_visits()
		}

		const block = (...block_ids: FROM[] | never[]) => {
			if (array_isEmpty(block_ids) && prev_id !== undefined) {
				block_ids.push(prev_id as never)
			}
			block_ids.forEach(recursive_dfs_unvisiter)
			compute_stacks_based_on_visits()
		}

		const clear = () => {
			visits.clear()
			stack_clear()
		}

		const iterate = function* () {
			prev_id = pop()
			while (prev_id !== undefined) {
				yield prev_id
				prev_id = pop()
			}
		}

		object_assign(this, {
			edges, stack, fire, block, clear, pop, seek,
			[symbol_iterator]: iterate,
		})
	}
}

export type InvertibleGraphEdges<ID extends PropertyKey, FROM extends ID = ID, TO extends ID = ID> = InvertibleMap<FROM, TO>

// TODO ISSUE: dependencies/dependants added during a firing cycle AND their some of their dependencies have already been resolved, will lead to forever unresolved newly added depenant
// see `/test/collections.topological_scheduler.test.ts`
export class TopologicalAsyncScheduler<ID extends PropertyKey, FROM extends ID = ID, TO extends ID = ID> {
	declare pending: Set<TO>
	declare clear: () => void
	declare fire: (...source_ids: FROM[]) => void
	declare resolve: (...ids: ID[]) => TO[]

	constructor(invertible_edges: InvertibleGraphEdges<ID, FROM, TO>) {
		const
			{ rforEach, get, rget } = invertible_edges,
			// set of node ids that are currently pending to be resolved
			pending = new Set<TO>(),
			pending_add = bind_set_add(pending),
			pending_delete = bind_set_delete(pending)
		// TODO CHORE: instead of using regular Objects for `ins_count: Partial<Record<TO, number>>` and `rejected_ins_count: Partial<Record<TO, number>>`,
		// use const Maps: `ins_count: Map<TO, number>` and `rejected_ins_count: Map<TO, number>`, and clear them on every run
		let
			// count (value) of number of edges going INTO an id (key)
			ins_count: Partial<Record<TO, number>> = {},
			// count (value) of number of rejected edges going INTO an id (key).
			// if the count tops up to the total number of edges going into the `id` (`rejected_ins_count[id] === get(id).size`),
			// then we will also have to reject `id`, and propagate its rejection's effect onto its dependants
			rejected_ins_count: Partial<Record<TO, number>> = {}

		const clear = () => {
			pending.clear()
			ins_count = {}
			rejected_ins_count = {}
			rforEach((from_ids, to_id) => {
				ins_count[to_id] = from_ids.size
			})
		}

		const fire = (...source_ids: FROM[]) => {
			console.log(source_ids)
			clear();
			(source_ids as unknown[] as TO[]).forEach(pending_add)
		}

		const resolve = (...ids: ID[]): TO[] => {
			const next_ids: TO[] = []
			for (const id of ids as TO[]) {
				if (pending_delete(id)) {
					get(id as unknown as FROM)?.forEach((to_id) => {
						// `ins_count[to_id]` may be undefined due to a dependency that was adder later (after a firing cycle had begun).
						// in that case, we look it up from `rget(to_id).size`, which should contain the updated info.
						// but if that too turns out to be undefined, then we fall back to `1 - 1`
						const ins_count_of_id = (
							ins_count[to_id] ??
							rget(to_id)?.size ??
							1
						) - 1
						if (ins_count_of_id <= 0) {
							// `to_id` now has no unresolved dependencies left. therefore we can push it `next_ids`, and eventually to `pending`
							next_ids.push(to_id)
						}
						ins_count[to_id] = ins_count_of_id
					})
				}
			}
			next_ids.forEach(pending_add)
			console.log(next_ids)
			return next_ids
		}

		const reject = (...ids: ID[]): TO[] => {
			const next_rejected_ids: TO[] = []
			for (const id of ids as TO[]) {
				pending_delete(id)
				get(id as unknown as FROM)?.forEach((to_id) => {
					if (
						(rejected_ins_count[to_id] = (rejected_ins_count[to_id] ?? 0) + 1) >=
						(rget(to_id)?.size ?? 0)
					) {
						// `to_id` now has had all of its dependencies rejected. therefore we must now push it `next_rejected_ids`, and eventually to reject it on the next recursion
						next_rejected_ids.push(to_id)
					}
				})
			}
			return (ids as TO[]).concat(
				array_isEmpty(next_rejected_ids) ?
					next_rejected_ids :
					reject(...next_rejected_ids)
			)
		}

		object_assign(this, { pending, clear, fire, resolve, reject })
	}
}

/** definition of an object that provides map-like methods */
export interface SimpleMap<K, V> {
	get(key: K): V | undefined
	set(key: K, value: V): this
	has(key: K): boolean
	delete(key: K): boolean
}

// TODO: there is an issue with `dnt` deno to node transformer, where it thinks that `WeakKey` is not an existing defined type, even though it is.
// thus I have to inline its definition below
type WeakKey = symbol | object | Function

/** a map like object, similar to a {@link WeakMap}, that weakly stores keys of Objects and Functions,
 * but can also (strongly) store primitive objects as keys, similar to {@link Map}. hence the name, `HybridWeakMap` <br>
*/
export class HybridWeakMap<K, V> implements SimpleMap<K, V> {
	wmap: WeakMap<K & WeakKey, V> = new WeakMap()
	smap: Map<K & PropertyKey, V> = new Map()

	private pick(key: K & WeakKey): this["wmap"]
	private pick(key: K & PropertyKey): this["smap"]
	private pick(key: K): this["wmap"] | this["smap"]
	private pick(key: K): this["wmap"] | this["smap"] {
		return isComplex(key) ? this.wmap : this.smap
	}

	get(key: K): V | undefined {
		return this.pick(key).get(key as any)
	}

	set(key: K, value: V): this {
		this.pick(key).set(key as any, value)
		return this
	}

	has(key: K): boolean {
		return this.pick(key).has(key as any)
	}

	delete(key: K): boolean {
		return this.pick(key).delete(key as any)
	}
}

/** a tree object (constructed by class returned by {@link treeClass_Factory}) with no initialized value will have this symbol set as its default value */
export const TREE_VALUE_UNSET = /*@__PURE__*/ Symbol("represents an unset value for a tree")

// TODO: annotate/document this class, and talk about its similarities with the "Walk" method commonly used in filesystem traversal along with its "create intermediate" option
export const treeClass_Factory = /*@__PURE__*/ (base_map_class: new <KT, VT>(...args: any[]) => SimpleMap<KT, VT>) => {
	return class Tree<K, V> extends base_map_class<K, Tree<K, any>> {
		constructor(
			public value: V | typeof TREE_VALUE_UNSET = TREE_VALUE_UNSET
		) { super() }

		getDeep(reverse_keys: K[], create_intermediate?: true): Tree<K, any>
		getDeep(reverse_keys: K[], create_intermediate?: boolean): Tree<K, any> | undefined
		getDeep(reverse_keys: K[], create_intermediate = true): Tree<K, any> | undefined {
			if (array_isEmpty(reverse_keys)) { return this }
			const key = reverse_keys.pop()!
			let child = this.get(key)
			if (!child && create_intermediate) { this.set(key, (child = new Tree())) }
			return child?.getDeep(reverse_keys, create_intermediate)
		}

		setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): Tree<K, any>
		setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: boolean): Tree<K, any> | undefined
		setDeep<T>(reverse_keys: K[], value: T, create_intermediate: boolean = true): Tree<K, any> | undefined {
			const deep_child = this.getDeep(reverse_keys, create_intermediate)
			if (deep_child) { deep_child.value = value }
			return deep_child
		}

		/** check if a deep child exists with the provided array of reversed keys. <br>
		 * this is implemented to be slightly quicker than {@link getDeep}
		*/
		hasDeep(reverse_keys: K[]): boolean {
			if (array_isEmpty(reverse_keys)) { return true }
			const
				key = reverse_keys.pop()!,
				child = this.get(key)
			return child?.hasDeep(reverse_keys) ?? false
		}

		delDeep(reverse_keys: K[]): boolean {
			if (array_isEmpty(reverse_keys)) { return false }
			const
				[child_key, ...reverse_keys_to_parent] = reverse_keys,
				deep_parent = this.getDeep(reverse_keys_to_parent, false)
			return deep_parent?.delete(child_key) ?? false
		}
	}
}

export const WeakTree = /*@__PURE__*/ treeClass_Factory(WeakMap)
export const StrongTree = /*@__PURE__*/ treeClass_Factory(Map)
export const HybridTree = /*@__PURE__*/ treeClass_Factory(HybridWeakMap)


export class StackSet<T> extends Array<T> {
	$set = new Set<T>()
	$add = bind_set_add(this.$set)
	$del = bind_set_delete(this.$set)

	/** determines if an item exists in the stack. <br>
	 * this operation is as fast as {@link Set.has}, because that's what's being used internally.
	 * so expect no overhead.
	*/
	includes = bind_set_has(this.$set)

	/** peek at the top item of the stack without popping */
	top = bind_stack_seek(this)

	/** syncronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
	 * the "f" in "fsync" stands for "forward"
	*/
	fsync(): number {
		super.splice(0)
		return super.push(...this.$set)
	}

	/** syncronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
	 * this process is more expensive than {@link fsync}, as it has to rebuild the entirity of the underlying set object. <br>
	 * the "r" in "rsync" stands for "reverse"
	*/
	rsync(): number {
		const { $set, $add } = this
		$set.clear()
		super.forEach($add)
		return this.length
	}

	/** reset a `StackSet` with the provided initializing array of unique items */
	reset(initial_items: Array<T> = []): void {
		const { $set, $add } = this
		$set.clear()
		initial_items.forEach($add)
		this.fsync()
	}

	constructor(initial_items?: Array<T>) {
		super()
		this.reset(initial_items)
	}

	/** pop the item at the top of the stack. */
	pop(): T | undefined {
		const value = super.pop()
		this.$del(value as T)
		return value
	}

	/** push __new__ items to stack. doesn't alter the position of already existing items. <br>
	 * @returns the new length of the stack.
	*/
	push(...items: T[]): number {
		const
			includes = this.includes,
			$add = this.$add,
			new_items: T[] = items.filter(includes)
		new_items.forEach($add)
		return super.push(...new_items)
	}

	/** push items to front of stack, even if they already exist in the middle. <br>
	 * @returns the new length of the stack.
	*/
	pushFront(...items: T[]): number {
		items.forEach(this.$del)
		items.forEach(this.$add)
		return this.fsync()
	}

	/** remove the item at the bottom of the stack. */
	shift(): T | undefined {
		const value = super.shift()
		this.$del(value as T)
		return value
	}

	/** insert __new__ items to the rear of the stack. doesn't alter the position of already existing items. <br>
	 * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
	 * @returns the new length of the stack.
	*/
	unshift(...items: T[]): number {
		const
			includes = this.includes,
			new_items: T[] = items.filter(includes)
		super.unshift(...new_items)
		return this.rsync()
	}

	/** inserts items to the rear of the stack, even if they already exist in the middle. <br>
	 * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
	 * @returns the new length of the stack.
	*/
	unshiftRear(...items: T[]): number {
		this.delMany(...items)
		super.unshift(...items)
		return this.rsync()
	}

	/** delete an item from the stack */
	del(item: T): boolean {
		const item_exists = this.$del(item)
		if (item_exists) {
			super.splice(super.indexOf(item), 1)
			return true
		}
		return false
	}

	/** delete multiple items from the stack */
	delMany(...items: T[]): void {
		items.forEach(this.$del)
		this.fsync()
	}
}

/** a stack object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export class LimitedStack<T> extends Array<T> {
	/** minimum capacity of the stack. <br>
	 * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
	 * bottom of the stack) are discarded so that the size goes down to the minimum specified here
	*/
	min: number

	/** maximum capacity of the stack. <br>
	 * when the stack size hits this maximum capacity, the oldest items (at the
	 * bottom of the stack) are discarded so that the size goes down to {@link min}
	*/
	max: number

	/** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
	resize_cb?: (discarded_items: T[]) => void

	constructor(
		min_capacity: number,
		max_capacity: number,
		resize_callback?: (discarded_items: T[]) => void
	) {
		super()
		this.min = min_capacity
		this.max = max_capacity
		this.resize_cb = resize_callback
	}

	/** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
	resize(arg: any): typeof arg {
		const
			len = this.length,
			discard_quantity = (len - this.max) > 0 ? (len - this.min) : 0
		if (discard_quantity > 0) {
			const discarded_items = super.splice(0, discard_quantity)
			this.resize_cb?.(discarded_items)
		}
		return arg
	}

	push(...items: T[]): number {
		return this.resize(super.push(...items))
	}
}

/** a stack set object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export class LimitedStackSet<T> extends StackSet<T> {
	/** minimum capacity of the stack. <br>
	 * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
	 * bottom of the stack) are discarded so that the size goes down to the minimum specified here
	*/
	min: number

	/** maximum capacity of the stack. <br>
	 * when the stack size hits this maximum capacity, the oldest items (at the
	 * bottom of the stack) are discarded so that the size goes down to {@link min}
	*/
	max: number

	/** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
	resize_cb?: (discarded_items: T[]) => void

	constructor(
		min_capacity: number,
		max_capacity: number,
		resize_callback?: (discarded_items: T[]) => void
	) {
		super()
		this.min = min_capacity
		this.max = max_capacity
		this.resize_cb = resize_callback
	}

	/** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
	resize(arg: any): typeof arg {
		const
			len = this.length,
			discard_quantity = (len - this.max) > 0 ? (len - this.min) : 0
		if (discard_quantity > 0) {
			const discarded_items = super.splice(0, discard_quantity)
			discarded_items.forEach(this.$del)
			this.resize_cb?.(discarded_items)
		}
		return arg
	}

	push(...items: T[]): number {
		return this.resize(super.push(...items))
	}

	pushFront(...items: T[]): number {
		return this.resize(super.pushFront(...items))
	}
}
