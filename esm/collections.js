/** contains a set of common collections
 * @module
*/
import "./_dnt.polyfills.js";
import { bind_array_clear, bind_array_pop, bind_array_push, bind_map_delete, bind_map_entries, bind_map_forEach, bind_map_get, bind_map_has, bind_map_keys, bind_map_set, bind_map_values, bind_set_add, bind_set_delete, bind_set_has, bind_stack_seek, } from "./binder.js";
import { array_isEmpty, object_assign, symbol_iterator, symbol_toStringTag } from "./builtin_aliases_deps.js";
import { modulo } from "./numericmethods.js";
import { isComplex, monkeyPatchPrototypeOfClass } from "./struct.js";
/** a double-ended circular queue, similar to python's `collection.deque` */
export class Deque {
    length;
    items;
    front = 0;
    back;
    count = 0;
    /** a double-ended circular queue, similar to python's `collection.deque` <br>
     * @param length maximum length of the queue. <br>
     * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
    */
    constructor(length) {
        this.length = length;
        this.items = Array(length);
        this.back = length - 1;
    }
    static {
        // we are forced to assign `[Symbol.iterator]` method to the prototype in a static block (on the first class invokation),
        // because `esbuild` does not consider Symbol propety method assignment to be side-effect free.
        // which in turn results in this class being included in any bundle that imports anything from `collections.ts`
        /*@__PURE__*/
        monkeyPatchPrototypeOfClass(this, symbol_iterator, function () {
            const count = this.count;
            let i = 0;
            return {
                next: () => i < count ?
                    { value: this.at(i++), done: false } :
                    { value: undefined, done: true }
            };
        });
    }
    /** inserts one or more items to the back of the deque. <br>
     * if the deque is full, it will remove the front item before adding a new item
    */
    pushBack(...items) {
        for (const item of items) {
            if (this.count === this.length)
                this.popFront();
            this.items[this.back] = item;
            this.back = modulo(this.back - 1, this.length);
            this.count++;
        }
    }
    /** inserts one or more items to the front of the deque. <br>
     * if the deque is full, it will remove the rear item before adding a new item
    */
    pushFront(...items) {
        for (const item of items) {
            if (this.count === this.length)
                this.popBack();
            this.items[this.front] = item;
            this.front = modulo(this.front + 1, this.length);
            this.count++;
        }
    }
    /** get the item at the back of the deque without removing/popping it */
    getBack() {
        if (this.count === 0)
            return undefined;
        return this.items[modulo(this.back + 1, this.length)];
    }
    /** get the item at the front of the deque without removing/popping it */
    getFront() {
        if (this.count === 0)
            return undefined;
        return this.items[modulo(this.front - 1, this.length)];
    }
    /** removes/pops the item at the back of the deque and returns it */
    popBack() {
        if (this.count === 0)
            return undefined;
        this.back = modulo(this.back + 1, this.length);
        const item = this.items[this.back];
        this.items[this.back] = undefined;
        this.count--;
        return item;
    }
    /** removes/pops the item at the front of the deque and returns it */
    popFront() {
        if (this.count === 0)
            return undefined;
        this.front = modulo(this.front - 1, this.length);
        const item = this.items[this.front];
        this.items[this.front] = undefined;
        this.count--;
        return item;
    }
    /** rotates the deque `steps` number of positions to the right. <br>
     * if `steps` is negative, then it will rotate in the left direction. <br>
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps) {
        const { front, back, length, count, items } = this;
        if (count === 0)
            return;
        steps = modulo(steps, count);
        if (count < length) {
            // move `steps` number of items from the front to the rear
            for (let i = 0; i < steps; i++) {
                const b = modulo(back - i, length), f = modulo(front - i - 1, length);
                items[b] = items[f];
                items[f] = undefined;
            }
        }
        this.front = modulo(front - steps, length);
        this.back = modulo(back - steps, length);
    }
    /** reverses the order of the items in the deque. */
    reverse() {
        const center = (this.count / 2) | 0, { length, front, back, items } = this;
        for (let i = 1; i <= center; i++) {
            const b = modulo(back + i, length), f = modulo(front - i, length), temp = items[b];
            items[b] = items[f];
            items[f] = temp;
        }
    }
    /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
     * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
     * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
    */
    resolveIndex(index) { return modulo(this.back + index + 1, this.length); }
    /** returns the item at the specified index.
     * @param index The index of the item to retrieve, relative to the rear-most element
     * @returns The item at the specified index, or `undefined` if the index is out of range
    */
    at(index) { return this.items[this.resolveIndex(index)]; }
    /** replaces the item at the specified index with a new item. */
    replace(index, item) {
        // note that replacing does not increment the indexes of `front` and `back`.
        this.items[modulo(this.back + index + 1, this.count)] = item;
    }
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
     * if the deque is full, it removes the front item before adding the new item.
    */
    insert(index, item) {
        if (this.count === this.length)
            this.popFront();
        const i = this.resolveIndex(index);
        // `this.items[this.front]` is guaranteed to be empty. so now we push everything ahead of the insertion index `i` one step into the front to make room for the insertion
        for (let j = this.front; j > i; j--)
            this.items[j] = this.items[j - 1];
        this.items[i] = item;
        this.count++;
    }
}
/** invert a map */
export const invertMap = (forward_map) => {
    const reverse_map_keys = [];
    forward_map.forEach((rset) => { reverse_map_keys.push(...rset); });
    const reverse_map = new Map([...(new Set(reverse_map_keys))].map((rkey) => [rkey, new Set()])), get_reverse_map = bind_map_get(reverse_map);
    for (const [fkey, rset] of forward_map) {
        rset.forEach((rkey) => get_reverse_map(rkey).add(fkey));
    }
    return reverse_map;
};
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
export class InvertibleMap {
    /** create an empty invertible map. <br>
     * optionally provide an initial `forward_map` to populate the forward mapping, and then automatically deriving the reverse mapping from it. <br>
     * or provide an initial `reverse_map` to populate the reverse mapping, and then automatically deriving the froward mapping from it. <br>
     * if both `forward_map` and `reverse_map` are provided, then it will be up to YOU to make sure that they are actual inverses of each other. <br>
     * @param forward_map initiallize by populating with an optional initial forward map (the reverse map will be automatically computed if `reverse_map === undefined`)
     * @param reverse_map initiallize by populating with an optional initial reverse map (the forward map will be automatically computed if `forward_map === undefined`)
     */
    constructor(forward_map, reverse_map) {
        const 
        // forward mapping
        fmap = forward_map ?? (reverse_map ? invertMap(reverse_map) : new Map()), 
        // reverse (backward/rear) mapping
        rmap = reverse_map ?? (forward_map ? invertMap(forward_map) : new Map()), 
        // binding accessor methods for quicker execution
        fmap_set = bind_map_set(fmap), rmap_set = bind_map_set(rmap), fmap_delete = bind_map_delete(fmap), rmap_delete = bind_map_delete(rmap), size = fmap.size, rsize = rmap.size, forEach = bind_map_forEach(fmap), rforEach = bind_map_forEach(rmap), get = bind_map_get(fmap), rget = bind_map_get(rmap), has = bind_map_has(fmap), rhas = bind_map_has(rmap), entries = bind_map_entries(fmap), rentries = bind_map_entries(rmap), keys = bind_map_keys(fmap), rkeys = bind_map_keys(rmap), values = bind_map_values(fmap), rvalues = bind_map_values(rmap);
        const add = (key, ...items) => {
            const forward_items = get(key) ?? (fmap_set(key, new Set()) && get(key)), forward_items_has = bind_set_has(forward_items), forward_items_add = bind_set_add(forward_items);
            for (const item of items) {
                if (!forward_items_has(item)) {
                    forward_items_add(item);
                    if (!rget(item)?.add(key)) {
                        rmap_set(item, new Set([key]));
                    }
                }
            }
        };
        const radd = (key, ...items) => {
            const reverse_items = rget(key) ?? (rmap_set(key, new Set()) && rget(key)), reverse_items_has = bind_set_has(reverse_items), reverse_items_add = bind_set_add(reverse_items);
            for (const item of items) {
                if (!reverse_items_has(item)) {
                    reverse_items_add(item);
                    if (!get(item)?.add(key)) {
                        fmap_set(item, new Set([key]));
                    }
                }
            }
        };
        const clear = () => {
            fmap.clear();
            rmap.clear();
        };
        const fdelete = (key, keep_key = false) => {
            const forward_items = get(key);
            if (forward_items) {
                // first remove all mentions of `key` from the reverse mapping
                for (const item of forward_items) {
                    rget(item).delete(key);
                }
                if (keep_key) {
                    forward_items.clear();
                }
                else {
                    keep_key = fmap_delete(key);
                }
            }
            return keep_key;
        };
        const rdelete = (key, keep_key = false) => {
            const reverse_items = rget(key);
            // first remove all mentions of `key` from the forward mapping
            if (reverse_items) {
                // first remove all mentions of `key` from the reverse mapping
                for (const item of reverse_items) {
                    get(item).delete(key);
                }
                if (keep_key) {
                    reverse_items.clear();
                }
                else {
                    keep_key = rmap_delete(key);
                }
            }
            return keep_key;
        };
        const remove = (key, ...items) => {
            const forward_items = get(key);
            if (forward_items) {
                const forward_items_delete = bind_set_delete(forward_items);
                for (const item of items) {
                    if (forward_items_delete(item)) {
                        rget(item).delete(key);
                    }
                }
            }
        };
        const rremove = (key, ...items) => {
            const reverse_items = rget(key);
            if (reverse_items) {
                const reverse_items_delete = bind_set_delete(reverse_items);
                for (const item of items) {
                    if (reverse_items_delete(item)) {
                        get(item).delete(key);
                    }
                }
            }
        };
        const set = (key, value) => {
            // first we must delete the `key` if it already exists
            fdelete(key, true);
            add(key, ...value);
            return this;
        };
        const rset = (key, value) => {
            // first we must delete the `key` if it already exists
            rdelete(key, true);
            radd(key, ...value);
            return this;
        };
        object_assign(this, {
            fmap, rmap, size, rsize, forEach, rforEach, get, rget, has, rhas, entries, rentries, keys, rkeys, values, rvalues,
            add, radd, clear, delete: fdelete, rdelete, remove, rremove, set, rset,
            [symbol_iterator]: entries,
            [symbol_toStringTag]: "InvertibleMap",
        });
    }
}
export class TopologicalScheduler {
    constructor(edges) {
        let prev_id = undefined;
        const edges_get = bind_map_get(edges), stack = [], stack_pop = bind_array_pop(stack), stack_push = bind_array_push(stack), stack_clear = bind_array_clear(stack), seek = bind_stack_seek(stack), visits = new Map(), visits_get = bind_map_get(visits), visits_set = bind_map_set(visits);
        const recursive_dfs_visiter = (id) => {
            for (const to_id of edges_get(id) ?? []) {
                const visits = visits_get(to_id);
                // if the child node has been visited at least once before (`0 || undefined`), do not dfs revisit it again. just increment its counter
                if (visits) {
                    visits_set(to_id, visits + 1);
                }
                else {
                    recursive_dfs_visiter(to_id);
                }
            }
            visits_set(id, 1);
        };
        const recursive_dfs_unvisiter = (id) => {
            visits_set(id, 0);
            for (const to_id of edges_get(id) ?? []) {
                const new_visits = (visits_get(to_id) ?? 0) - 1;
                if (new_visits > -1) {
                    visits_set(to_id, new_visits);
                    // if the child node has become unvisitable (`new_visits === 0`), then the grand-children should decrement by a visit too via recursion
                    if (new_visits < 1) {
                        recursive_dfs_unvisiter(to_id);
                    }
                }
            }
        };
        const compute_stacks_based_on_visits = () => {
            stack_clear();
            for (const [id, number_of_visits] of visits) {
                if (number_of_visits > 0) {
                    stack_push(id);
                }
            }
        };
        const pop = () => {
            prev_id = stack_pop();
            if (prev_id !== undefined) {
                visits_set(prev_id, 0);
            }
            return prev_id;
        };
        const fire = (...source_ids) => {
            visits.clear();
            source_ids.forEach(recursive_dfs_visiter);
            compute_stacks_based_on_visits();
        };
        const block = (...block_ids) => {
            if (array_isEmpty(block_ids) && prev_id !== undefined) {
                block_ids.push(prev_id);
            }
            block_ids.forEach(recursive_dfs_unvisiter);
            compute_stacks_based_on_visits();
        };
        const clear = () => {
            visits.clear();
            stack_clear();
        };
        const iterate = function* () {
            prev_id = pop();
            while (prev_id !== undefined) {
                yield prev_id;
                prev_id = pop();
            }
        };
        object_assign(this, {
            edges, stack, fire, block, clear, pop, seek,
            [symbol_iterator]: iterate,
        });
    }
}
// TODO ISSUE: dependencies/dependants added during a firing cycle AND their some of their dependencies have already been resolved, will lead to forever unresolved newly added depenant
// see `/test/collections.topological_scheduler.test.ts`
export class TopologicalAsyncScheduler {
    constructor(invertible_edges) {
        const { rforEach, get, rget } = invertible_edges, 
        // set of node ids that are currently pending to be resolved
        pending = new Set(), pending_add = bind_set_add(pending), pending_delete = bind_set_delete(pending);
        // TODO CHORE: instead of using regular Objects for `ins_count: Partial<Record<TO, number>>` and `rejected_ins_count: Partial<Record<TO, number>>`,
        // use const Maps: `ins_count: Map<TO, number>` and `rejected_ins_count: Map<TO, number>`, and clear them on every run
        let 
        // count (value) of number of edges going INTO an id (key)
        ins_count = {}, 
        // count (value) of number of rejected edges going INTO an id (key).
        // if the count tops up to the total number of edges going into the `id` (`rejected_ins_count[id] === get(id).size`),
        // then we will also have to reject `id`, and propagate its rejection's effect onto its dependants
        rejected_ins_count = {};
        const clear = () => {
            pending.clear();
            ins_count = {};
            rejected_ins_count = {};
            rforEach((from_ids, to_id) => {
                ins_count[to_id] = from_ids.size;
            });
        };
        const fire = (...source_ids) => {
            console.log(source_ids);
            clear();
            source_ids.forEach(pending_add);
        };
        const resolve = (...ids) => {
            const next_ids = [];
            for (const id of ids) {
                if (pending_delete(id)) {
                    get(id)?.forEach((to_id) => {
                        // `ins_count[to_id]` may be undefined due to a dependency that was adder later (after a firing cycle had begun).
                        // in that case, we look it up from `rget(to_id).size`, which should contain the updated info.
                        // but if that too turns out to be undefined, then we fall back to `1 - 1`
                        const ins_count_of_id = (ins_count[to_id] ??
                            rget(to_id)?.size ??
                            1) - 1;
                        if (ins_count_of_id <= 0) {
                            // `to_id` now has no unresolved dependencies left. therefore we can push it `next_ids`, and eventually to `pending`
                            next_ids.push(to_id);
                        }
                        ins_count[to_id] = ins_count_of_id;
                    });
                }
            }
            next_ids.forEach(pending_add);
            console.log(next_ids);
            return next_ids;
        };
        const reject = (...ids) => {
            const next_rejected_ids = [];
            for (const id of ids) {
                pending_delete(id);
                get(id)?.forEach((to_id) => {
                    if ((rejected_ins_count[to_id] = (rejected_ins_count[to_id] ?? 0) + 1) >=
                        (rget(to_id)?.size ?? 0)) {
                        // `to_id` now has had all of its dependencies rejected. therefore we must now push it `next_rejected_ids`, and eventually to reject it on the next recursion
                        next_rejected_ids.push(to_id);
                    }
                });
            }
            return ids.concat(array_isEmpty(next_rejected_ids) ?
                next_rejected_ids :
                reject(...next_rejected_ids));
        };
        object_assign(this, { pending, clear, fire, resolve, reject });
    }
}
/** a map like object, similar to a {@link WeakMap}, that weakly stores keys of Objects and Functions,
 * but can also (strongly) store primitive objects as keys, similar to {@link Map}. hence the name, `HybridWeakMap` <br>
*/
export class HybridWeakMap {
    wmap = new WeakMap();
    smap = new Map();
    pick(key) {
        return isComplex(key) ? this.wmap : this.smap;
    }
    get(key) {
        return this.pick(key).get(key);
    }
    set(key, value) {
        this.pick(key).set(key, value);
        return this;
    }
    has(key) {
        return this.pick(key).has(key);
    }
    delete(key) {
        return this.pick(key).delete(key);
    }
}
/** a tree object (constructed by class returned by {@link treeClass_Factory}) with no initialized value will have this symbol set as its default value */
export const TREE_VALUE_UNSET = /*@__PURE__*/ Symbol("represents an unset value for a tree");
// TODO: annotate/document this class, and talk about its similarities with the "Walk" method commonly used in filesystem traversal along with its "create intermediate" option
export const treeClass_Factory = /*@__PURE__*/ (base_map_class) => {
    return class Tree extends base_map_class {
        value;
        constructor(value = TREE_VALUE_UNSET) {
            super();
            this.value = value;
        }
        getDeep(reverse_keys, create_intermediate = true) {
            if (array_isEmpty(reverse_keys)) {
                return this;
            }
            const key = reverse_keys.pop();
            let child = this.get(key);
            if (!child && create_intermediate) {
                this.set(key, (child = new Tree()));
            }
            return child?.getDeep(reverse_keys, create_intermediate);
        }
        setDeep(reverse_keys, value, create_intermediate = true) {
            const deep_child = this.getDeep(reverse_keys, create_intermediate);
            if (deep_child) {
                deep_child.value = value;
            }
            return deep_child;
        }
        /** check if a deep child exists with the provided array of reversed keys. <br>
         * this is implemented to be slightly quicker than {@link getDeep}
        */
        hasDeep(reverse_keys) {
            if (array_isEmpty(reverse_keys)) {
                return true;
            }
            const key = reverse_keys.pop(), child = this.get(key);
            return child?.hasDeep(reverse_keys) ?? false;
        }
        delDeep(reverse_keys) {
            if (array_isEmpty(reverse_keys)) {
                return false;
            }
            const [child_key, ...reverse_keys_to_parent] = reverse_keys, deep_parent = this.getDeep(reverse_keys_to_parent, false);
            return deep_parent?.delete(child_key) ?? false;
        }
    };
};
export const WeakTree = /*@__PURE__*/ treeClass_Factory(WeakMap);
export const StrongTree = /*@__PURE__*/ treeClass_Factory(Map);
export const HybridTree = /*@__PURE__*/ treeClass_Factory(HybridWeakMap);
export class StackSet extends Array {
    $set = new Set();
    $add = bind_set_add(this.$set);
    $del = bind_set_delete(this.$set);
    /** determines if an item exists in the stack. <br>
     * this operation is as fast as {@link Set.has}, because that's what's being used internally.
     * so expect no overhead.
    */
    includes = bind_set_has(this.$set);
    /** peek at the top item of the stack without popping */
    top = bind_stack_seek(this);
    /** syncronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
     * the "f" in "fsync" stands for "forward"
    */
    fsync() {
        super.splice(0);
        return super.push(...this.$set);
    }
    /** syncronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
     * this process is more expensive than {@link fsync}, as it has to rebuild the entirity of the underlying set object. <br>
     * the "r" in "rsync" stands for "reverse"
    */
    rsync() {
        const { $set, $add } = this;
        $set.clear();
        super.forEach($add);
        return this.length;
    }
    /** reset a `StackSet` with the provided initializing array of unique items */
    reset(initial_items = []) {
        const { $set, $add } = this;
        $set.clear();
        initial_items.forEach($add);
        this.fsync();
    }
    constructor(initial_items) {
        super();
        this.reset(initial_items);
    }
    /** pop the item at the top of the stack. */
    pop() {
        const value = super.pop();
        this.$del(value);
        return value;
    }
    /** push __new__ items to stack. doesn't alter the position of already existing items. <br>
     * @returns the new length of the stack.
    */
    push(...items) {
        const includes = this.includes, $add = this.$add, new_items = items.filter(includes);
        new_items.forEach($add);
        return super.push(...new_items);
    }
    /** push items to front of stack, even if they already exist in the middle. <br>
     * @returns the new length of the stack.
    */
    pushFront(...items) {
        items.forEach(this.$del);
        items.forEach(this.$add);
        return this.fsync();
    }
    /** remove the item at the bottom of the stack. */
    shift() {
        const value = super.shift();
        this.$del(value);
        return value;
    }
    /** insert __new__ items to the rear of the stack. doesn't alter the position of already existing items. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshift(...items) {
        const includes = this.includes, new_items = items.filter(includes);
        super.unshift(...new_items);
        return this.rsync();
    }
    /** inserts items to the rear of the stack, even if they already exist in the middle. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshiftRear(...items) {
        this.delMany(...items);
        super.unshift(...items);
        return this.rsync();
    }
    /** delete an item from the stack */
    del(item) {
        const item_exists = this.$del(item);
        if (item_exists) {
            super.splice(super.indexOf(item), 1);
            return true;
        }
        return false;
    }
    /** delete multiple items from the stack */
    delMany(...items) {
        items.forEach(this.$del);
        this.fsync();
    }
}
/** a stack object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export class LimitedStack extends Array {
    /** minimum capacity of the stack. <br>
     * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to the minimum specified here
    */
    min;
    /** maximum capacity of the stack. <br>
     * when the stack size hits this maximum capacity, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to {@link min}
    */
    max;
    /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
    resize_cb;
    constructor(min_capacity, max_capacity, resize_callback) {
        super();
        this.min = min_capacity;
        this.max = max_capacity;
        this.resize_cb = resize_callback;
    }
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg) {
        const len = this.length, discard_quantity = (len - this.max) > 0 ? (len - this.min) : 0;
        if (discard_quantity > 0) {
            const discarded_items = super.splice(0, discard_quantity);
            this.resize_cb?.(discarded_items);
        }
        return arg;
    }
    push(...items) {
        return this.resize(super.push(...items));
    }
}
/** a stack set object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export class LimitedStackSet extends StackSet {
    /** minimum capacity of the stack. <br>
     * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to the minimum specified here
    */
    min;
    /** maximum capacity of the stack. <br>
     * when the stack size hits this maximum capacity, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to {@link min}
    */
    max;
    /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
    resize_cb;
    constructor(min_capacity, max_capacity, resize_callback) {
        super();
        this.min = min_capacity;
        this.max = max_capacity;
        this.resize_cb = resize_callback;
    }
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg) {
        const len = this.length, discard_quantity = (len - this.max) > 0 ? (len - this.min) : 0;
        if (discard_quantity > 0) {
            const discarded_items = super.splice(0, discard_quantity);
            discarded_items.forEach(this.$del);
            this.resize_cb?.(discarded_items);
        }
        return arg;
    }
    push(...items) {
        return this.resize(super.push(...items));
    }
    pushFront(...items) {
        return this.resize(super.pushFront(...items));
    }
}
/** a collection of promises that can be further chained with a sequence of "then" functions.
 * once a certain promise in the collection is completed (i.e. goes throuh all of the chained then functions),
 * then it gets deleted from this collection.
 *
 * @example
 * ```ts
 * const promise_queue = new ChainedPromiseQueue([
 * 	[(value: string) => value.toUpperCase()],
 * 	[(value: string) => "Result: " + value],
 * 	[(value: string) => new Promise((resolve) => {setTimeout(() => {resolve(value)}, 1000)})],
 * 	[(value: string) => console.log(value)],
 * ])
 * // push a new promise into the collection, which will be processed through the defined sequence of chained actions.
 * promise_queue.push(
 * 	new Promise((resolve) => resolve("hello")),
 * )
 * // the promise will go through the action chain: [toUpperCase, "Result: " + value, 1000ms delay, console.log(value)]
 * // console output: "Result: HELLO" after 1000ms
 * ```
*/
export class ChainedPromiseQueue extends Array {
    /** the chain of the "then" functions to run each newly pushed promise through. <br>
     * you may dynamically modify this sequence so that all newly pushed promises will have to go through a different set of "then" functions. <br>
     * do note that old (already existing) promises will not be affected by the modified chain of "then" functions.
     * they'll stick to their original sequence of thens because that gets decided during the moment when a promise is pushed into this collection.
    */
    chain = [];
    /** an array of promises consisting of all the final "then" calls, after which (when fullfilled) the promise would be shortly deleted since it will no longer be pending.
     * the array indexes of `this.pending` line up with `this`, in the sense that `this.pending[i] = this[i].then(this.chain.at(0))...then(this.chain.at(-1))`.
     * once a promise inside of `pending` is fulfilled, it will be shortly deleted (via splicing) from `pending`,
     * and its originating `Promise` which was pushed  into `this` collection will also get removed. <br>
     * (the removal is done by the private {@link del} method)
     *
     * ```ts
     * declare const do_actions: ChainedPromiseQueue<string>
     * const chain_of_actions = do_actions.chain
     * const my_promise = new Promise<string>((resolve, reject) => {
     * 	//do async stuff
     * })
     * do_actions.push(my_promise)
     * let index = do_actions.indexOf(my_promise) // === do_actions.length - 1
     * // the following are functionally/structurally equivalent:
     * do_actions.pending[index] == do_actions[index]
     * 		.then(chain_of_actions[0])
     * 		.then(chain_of_actions[1])
     * 		// ... lots of thens
     * 		.then(chain_of_actions[chain_of_actions.length - 1])
     * ```
    */
    pending = [];
    onEmpty;
    constructor(then_functions_sequence, { onEmpty, isEmpty } = {}) {
        super();
        this.chain.push(...then_functions_sequence);
        this.onEmpty = onEmpty;
        if (isEmpty) {
            onEmpty?.();
        }
    }
    push(...new_promises) {
        const new_length = super.push(...new_promises), chain = this.chain;
        this.pending.push(...new_promises.map((promise) => {
            // attach the "then" functions to the promise sequentially
            chain.forEach(([onfulfilled, onrejected]) => {
                promise = promise.then(onfulfilled, onrejected);
            });
            // delete the promise from this array once it is completed (resolved or rejected after the "then" functions of the constructor)
            const completed_promise_deleter = () => this.del(promise);
            promise.then(completed_promise_deleter, completed_promise_deleter);
            return promise;
        }));
        return new_length;
    }
    /** delete a certain promise that has been chained with the "then" functions.
     * @param completed_pending_promise the promise to be deleted from {@link pending} and {@link this} collection of promises
     * @returns `true` if the pending promise was found and deleted, else `false` will be returned
    */
    del(completed_pending_promise) {
        const pending = this.pending, idx = pending.indexOf(completed_pending_promise);
        if (idx >= 0) {
            pending.splice(idx, 1);
            super.splice(idx, 1);
            if (array_isEmpty(this)) {
                this.onEmpty?.();
            }
            return true;
        }
        return false;
    }
}
