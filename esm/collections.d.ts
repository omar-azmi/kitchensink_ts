/** contains a set of common collections.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import type { PrefixProps } from "./typedefs.js";
/** a very simple python-like `List`s class, that allows for in-between insertions, deletions, and replacements, to keep the list compact. */
export declare class List<T> extends Array<T> {
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
     * negative indices are also supported for indicating the position of the newly added item _after_ the array's length has incremented.
     *
     * @example
     * ```ts
     * const arr = new List(0, 1, 2, 3, 4)
     * arr.insert(-1, 5) // === [0, 1, 2, 3, 4, 5] // similar to pushing
     * arr.insert(-2, 4.5) // === [0, 1, 2, 3, 4, 4.5, 5]
     * arr.insert(1, 0.5) // === [0, 0.5, 1, 2, 3, 4, 4.5, 5]
     * ```
    */
    insert(index: number, item: T): void;
    /** deletes an item at the specified index, shifting all items ahead of it one position to the back. <br>
     * negative indices are also supported for indicating the deletion index from the end of the array.
     *
     * @example
     * ```ts
     * const arr = new List(0, 0.5, 1, 2, 3, 4, 4.5, 5)
     * arr.delete(-1) // === [0, 0.5, 1, 2, 3, 4, 4.5] // similar to popping
     * arr.delete(-2) // === [0, 0.5, 1, 2, 3, 4.5]
     * arr.delete(1) // === [0, 1, 2, 3, 4.5]
     * ```
    */
    delete(index: number): T | undefined;
    /** swap the position of two items by their index. <br>
     * if any of the two indices is out of bound, then appropriate number of _empty_ elements will be created to fill the gap;
     * similar to how index-based assignment works (i.e. `my_list[off_bound_index] = "something"` will increase `my_list`'s length).
    */
    swap(index1: number, index2: number): void;
    /** the `map` array method needs to have its signature corrected, because apparently, javascript internally creates a new instance of `this`, instead of a new instance of an `Array`.
     * the signature of the map method in typescript is misleading, because:
     * - it suggests:      `map<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[]`
     * - but in actuality: `map<U>(callbackfn: (value: T, index: number, array: typeof this<T>) => U, thisArg?: any): typeof this<U>`
     *
     * meaning that in our case, `array` is of type `List<T>` (or a subclass thereof), and the return value is also `List<U>` (or a subclass) instead of `Array<U>`. <br>
     * in addition, it also means that a _new_ instance of this collection (`List`) is created, in order to fill it with the return output. <br>
     * this is perhaps the desired behavior for many uses, but for my specific use of "reference counting" and "list-like collection of signals",
     * this feature does not bode well, as I need to be able to account for each and every single instance.
     * surprise instances of this class are not welcomed, since it would introduce dead dependencies in my "directed acyclic graphs" for signals.
    */
    map<U>(callbackfn: (value: T, index: number, array: typeof this) => U, thisArg?: any): List<U>;
    /** see the comment on {@link map} to understand why the signature of this function needs to be corrected from the standard typescript definition. */
    flatMap<U, This = undefined>(callback: (this: This, value: T, index: number, array: typeof this) => U | readonly U[], thisArg?: This | undefined): List<U>;
    /** see the comment on {@link map} to understand the necessity for this method, instead of the builtin array `map` method. */
    mapToArray<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    /** see the comment on {@link map} to understand the necessity for this method, instead of the builtin array `flatMap` method. */
    flatMapToArray<U>(callbackfn: (value: T, index: number, array: T[]) => U, thisArg?: any): U[];
    /** get an item at the specified `index`. <br>
     * this is equivalent to using index-based getter: `my_list[index]`.
    */
    get(index: number): T | undefined;
    /** sets the value at the specified index. <br>
     * prefer using this method instead of index-based assignment, because subclasses may additionally cary out more operations with this method.
     * and for attaining compatibility between `List` and its subclasses, it would be in your best interest to use the `set` method.
     * - **not recommended**: `my_list[index] = "hello"`
     * - **preferred**: `my_list.set(index, "hello")`
    */
    set(index: number, value: T): T;
    static from<T, U = T>(arrayLike: ArrayLike<T>, mapfn?: (v: T, k: number) => U, thisArg?: any): List<U>;
    static of<T>(...items: T[]): List<T>;
}
/** a specialized list that keeps track of the number of duplicates of each item in the list, similar to a reference counter.
 *
 * this class automatically updates the reference counter on any mutations to the list at `O(log(n))`, where `n` is the number of unique items. <br>
 * note that you __must__ use the {@link set} method for index-based assignment, otherwise the class will not be able track the changes made.
 * - **don't do**: `my_list[index] = "hello"`
 * - **do**: `my_list.set(index, "hello")`
 *
 * @example
 * ```ts
 * class TrackedList<T> extends RcList<T> {
 * 	public onAdded(item: T): void {
 * 		console.log(`new item introduced: ${item}`)
 * 	}
 *
 * 	public onDeleted(item: T): void {
 * 		console.log(`item completely removed: ${item}`)
 * 	}
 * }
 *
 * const list = new TrackedList<number>()
 * list.push(1, 2, 2, 3)
 * // logs: "new item introduced: 1", "new item introduced: 2", "new item introduced: 3"
 *
 * list.pop() // removes 3
 * // logs: "item completely removed: 3"
 *
 * list.splice(0, 1) // removes 1
 * // logs: "item completely removed: 1"
 *
 * list.unshift(4, 4, 5)
 * // logs: "new item introduced: 4", "new item introduced: 5"
 *
 * list.shift() // removes 4
 * // logs: "item completely removed: 4"
 *
 * list.set(0, 6) // replaces 2 with 6
 * // logs: "item completely removed: 2", "new item introduced: 6"
 *
 * list.set(99, 9999) // `list[99] = 9999`, in addition to extending the length of the list to `100`
 * // logs: "new item introduced: 99"
 * // the reference counter of `undefined` is now `95`, because the length of the list was extended by `96` elements,
 * // and the final element (index `99`) was assigned the value of `9999`.
 * // note that `onAdded` is not called for `undefined` elements that are introduced as a consequence of the list extending after assignment.
 * // but `onAdded` will be called when the user _actually_ inserts an `undefined` element via direct mutation methods.
 * ```
*/
export declare class RcList<T> extends List<T> {
    /** the reference counting `Map`, that bookkeeps the multiplicity of each item in the list. */
    protected readonly rc: Map<T, number>;
    /** get the reference count (multiplicity) of a specific item in the list. */
    readonly getRc: (key: T) => number | undefined;
    /** set the reference count of a specific item in the list. */
    protected readonly setRc: (key: T, value: number) => Map<T, number>;
    /** delete the reference counting of a specific item in the list. a `true` is returned if the item did exist in {@link rc}, prior to deletion. */
    protected readonly delRc: (key: T) => boolean;
    constructor(...args: ConstructorParameters<typeof List<T>>);
    /** this overridable method gets called when a new unique item is determined to be added to the list. <br>
     * this method is called _before_ the item is actually added to the array, but it is executed right _after_ its reference counter has incremented to `1`. <br>
     * avoid accessing or mutating the array itself in this method's body (consider it an undefined behavior).
     *
     * @param item the item that is being added.
    */
    protected onAdded(item: T): void;
    /** this overridable method gets called when a unique item (reference count of 1) is determined to be removed from the list. <br>
     * this method is called _before_ the item is actually removed from the array, but it is executed right _after_ its reference counter has been deleted. <br>
     * avoid accessing or mutating the array itself in this method's body (consider it an undefined behavior).
     *
     * @param item the item that is being removed.
    */
    protected onDeleted(item: T): void;
    /** increments the reference count of each item in the provided array of items.
     *
     * @param items the items whose counts are to be incremented.
    */
    protected incRcs(...items: T[]): void;
    /** decrements the reference count of each item in the provided array of items.
     *
     * @param items the items whose counts are to be decremented.
    */
    protected decRcs(...items: T[]): void;
    push(...items: T[]): number;
    pop(): T | undefined;
    shift(): T | undefined;
    unshift(...items: T[]): number;
    splice(start: number, deleteCount?: number, ...items: T[]): T[];
    swap(index1: number, index2: number): void;
    /** sets the value at the specified index, updating the counter accordingly. <br>
     * always use this method instead of index-based assignment, because the latter is not interceptable (except when using proxies):
     * - **don't do**: `my_list[index] = "hello"`
     * - **do**: `my_list.set(index, "hello")`
    */
    set(index: number, value: T): T;
    static from: <T, U = T>(arrayLike: ArrayLike<T>, mapfn?: (v: T, k: number) => U, thisArg?: any) => RcList<U>;
    static of: <T>(...items: T[]) => RcList<T>;
}
/** a double-ended circular queue, similar to python's `collection.deque` */
export declare class Deque<T> {
    length: number;
    private items;
    private front;
    private back;
    count: number;
    /** a double-ended circular queue, similar to python's `collection.deque` <br>
     * @param length maximum length of the queue. <br>
     * pushing more items than the length will remove the items from the opposite side, so as to maintain the size
    */
    constructor(length: number);
    /** iterate over the items in this deque, starting from the rear-most item, and ending at the front-most item */
    [Symbol.iterator]: () => Iterator<T>;
    /** inserts one or more items to the back of the deque. <br>
     * if the deque is full, it will remove the front item before adding a new item
    */
    pushBack(...items: T[]): void;
    /** inserts one or more items to the front of the deque. <br>
     * if the deque is full, it will remove the rear item before adding a new item
    */
    pushFront(...items: T[]): void;
    /** get the item at the back of the deque without removing/popping it */
    getBack(): T | undefined;
    /** get the item at the front of the deque without removing/popping it */
    getFront(): T | undefined;
    /** removes/pops the item at the back of the deque and returns it */
    popBack(): T | undefined;
    /** removes/pops the item at the front of the deque and returns it */
    popFront(): T | undefined;
    /** rotates the deque `steps` number of positions to the right. <br>
     * if `steps` is negative, then it will rotate in the left direction. <br>
     * when the deque is not empty, rotating with `step = 1` is equivalent to `this.pushBack(this.popFront())`
    */
    rotate(steps: number): void;
    /** reverses the order of the items in the deque. */
    reverse(): void;
    /** provide an index with relative to `this.back + 1`, and get the appropriate resolved index `i` that can be used to retrieve `this.items[i]`. <br>
     * example: `this.items[this.resolveIndex(0)] === "rear most element of the deque"`
     * example: `this.items[this.resolveIndex(5)] === "fifth element ahead of the rear of the deque"`
    */
    private resolveIndex;
    /** returns the item at the specified index.
     * @param index The index of the item to retrieve, relative to the rear-most element
     * @returns The item at the specified index, or `undefined` if the index is out of range
    */
    at(index: number): T | undefined;
    /** replaces the item at the specified index with a new item. */
    replace(index: number, item: T): void;
    /** inserts an item at the specified index, shifting all items ahead of it one position to the front. <br>
     * if the deque is full, it removes the front item before adding the new item.
    */
    insert(index: number, item: T): void;
}
/** invert a map */
export declare const invertMap: <F, R>(forward_map: Map<F, Set<R>>) => Map<R, Set<F>>;
export type InvertibleMapBase<K, V> = Map<K, Set<V>> & Omit<PrefixProps<Map<V, Set<K>>, "r">, "rclear" | "rset"> & {
    rset: (key: V, value: Iterable<K>) => InvertibleMapBase<K, V>;
};
/** an invertible map maintains a bidirectional one-to-many mapping between `keys` (of kind `K`) and collection of values (of kind `Set<V>`). <br>
 * the reverse mapping is also a one-to-many between `keys` (of kind `V`) and collection of values (of kind `Set<K>`). <br>
 * the dual map model of this class allows for quick lookups and mutations both directions. <br>
 * this data structure highly resembles a directed graph's edges. <br>
 *
 * @typeParam K the type of keys in the forward map
 * @typeParam V the type of values in the reverse map
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
export declare class InvertibleMap<K, V> implements InvertibleMapBase<K, V> {
    /** forward mapping. not intended for direct access, since manually mutating it will ruin the invertibility with the reverse map if you're not careful. */
    fmap: Map<K, Set<V>>;
    /** reverse mapping. not intended for direct access, since manually mutating it will ruin the invertibility with the forward map if you're not careful. */
    rmap: Map<V, Set<K>>;
    /** size of the forward map */
    size: number;
    /** size of the reverse map */
    rsize: number;
    /** at a specific `key` in the forward map, add the list of `items`,
     * and then also assign `key` to the list of items in the reverse map to maintain invertibility.
    */
    add: (key: K, ...items: V[]) => void;
    /** at a specific `key` in the reverse map, add the list of `items`,
     * and then also assign `key` to the list of items in the forward map to maintain invertibility.
    */
    radd: (key: V, ...items: K[]) => void;
    /** clear out both forward and reverse maps completely of all their entries */
    clear: () => void;
    /** delete a `key` in the forward map, and also remove its mentions from the reverse map's entries. <br>
     * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the forward map at the key,
     * and keep the key itself intact (along with the original (now mutated and clear) `Set<V>` which the key refers to)
    */
    delete: (key: K, keep_key?: boolean) => boolean;
    /** delete a `key` in the reverse map, and also remove its mentions from the forward map's entries. <br>
     * if `keep_key` is optionally set to `true`, we will only clear out the set of items held by the reverse map at the key,
     * and keep the key itself intact (along with the original (now mutated and clear) `Set<V>` which the key refers to)
    */
    rdelete: (key: V, keep_key?: boolean) => boolean;
    /** at a specific `key` in the forward map, remove/delete the list of `items`,
     * and then also remove `key` from the list of items in the reverse map to maintain invertibility.
    */
    remove: (key: K, ...items: V[]) => void;
    /** at a specific `key` in the reverse map, remove/delete the list of `items`,
     * and then also remove `key` from the list of items in the forward map to maintain invertibility.
    */
    rremove: (key: V, ...items: K[]) => void;
    forEach: (callbackfn: (value: Set<V>, key: K, map: Map<K, Set<V>>) => void, thisArg?: any) => void;
    rforEach: (callbackfn: (value: Set<K>, key: V, map: Map<V, Set<K>>) => void, thisArg?: any) => void;
    get: (key: K) => Set<V> | undefined;
    rget: (key: V) => Set<K> | undefined;
    has: (key: K) => boolean;
    rhas: (key: V) => boolean;
    set: (key: K, value: Iterable<V>) => this;
    rset: (key: V, value: Iterable<K>) => this;
    entries: Map<K, Set<V>>["entries"];
    rentries: Map<V, Set<K>>["entries"];
    keys: Map<K, V>["keys"];
    rkeys: Map<V, K>["keys"];
    values: Map<K, Set<V>>["values"];
    rvalues: Map<V, Set<K>>["values"];
    [Symbol.iterator]: Map<K, Set<V>>["entries"];
    [Symbol.toStringTag]: string;
    /** create an empty invertible map. <br>
     * optionally provide an initial `forward_map` to populate the forward mapping, and then automatically deriving the reverse mapping from it. <br>
     * or provide an initial `reverse_map` to populate the reverse mapping, and then automatically deriving the froward mapping from it. <br>
     * if both `forward_map` and `reverse_map` are provided, then it will be up to YOU to make sure that they are actual inverses of each other. <br>
     * @param forward_map initiallize by populating with an optional initial forward map (the reverse map will be automatically computed if `reverse_map === undefined`)
     * @param reverse_map initiallize by populating with an optional initial reverse map (the forward map will be automatically computed if `forward_map === undefined`)
     */
    constructor(forward_map?: Map<K, Set<V>> | undefined, reverse_map?: Map<V, Set<K>> | undefined);
}
/** a directed acyclic graph edges mapping optimized for looking up number of connections going **into** and **out of** a node */
export type GraphEdges<ID, FROM extends ID = ID, TO extends ID = ID> = Map<FROM, Set<TO>>;
export declare class TopologicalScheduler<ID, FROM extends ID = ID, TO extends ID = ID> {
    /** the edges depict the directed edge from an id (`key: FROM`) to a set of ids (`value: Set<TO>`) */
    readonly edges: GraphEdges<ID, FROM, TO>;
    /** after a source id is fired, this stack will get filled up with dependent node ids in topological order. <br>
     * the top item in the stack will correspond to the first node id that must be processed (least dependency),
     * while the bottom one will be the last to be resolved (most dependencies). <br>
     * use the {@link pop} method to pop out the top from this stack, or use the {@link seek} method just to view the top without popping.
    */
    readonly stack: ID[];
    /** declare ids that need to be fired simultaneously.
     * once the ids are fired, the function will topologically traverse the {@link edges} (via DFS),
     * and eventually push the order of resoluion into the {@link stack}. <br>
     * make sure that the source ids are NOT dependent on one another, because that will break the topological ordering of the output stack.
    */
    fire: (...source_ids: FROM[]) => void;
    /** while processing topologically ordered {@link stack}, you may block certain ids so that they and
     * their (pure) dependents down the line are removed from the {@link stack}. <br>
     * if no id is provided (no arguments), then we will assume that you wish to block the most recently popped id.
    */
    block: (...block_ids: FROM[] | never[]) => void;
    /** clear the topologically ordered {@link stack}, perhaps to restart the traversal. */
    clear: () => void;
    /** pop the top element from the topologically ordered {@link stack}. */
    pop: () => ID | undefined;
    /** view the top element from the topologically ordered {@link stack} without popping it. */
    seek: () => ID | undefined;
    /** iterate over the topologically ordered {@link stack} of ids */
    [Symbol.iterator]: () => IterableIterator<ID>;
    constructor(edges: GraphEdges<ID, FROM, TO>);
}
export type InvertibleGraphEdges<ID extends PropertyKey, FROM extends ID = ID, TO extends ID = ID> = InvertibleMap<FROM, TO>;
export declare class TopologicalAsyncScheduler<ID extends PropertyKey, FROM extends ID = ID, TO extends ID = ID> {
    pending: Set<TO>;
    clear: () => void;
    fire: (...source_ids: FROM[]) => void;
    resolve: (...ids: ID[]) => TO[];
    constructor(invertible_edges: InvertibleGraphEdges<ID, FROM, TO>);
}
/** definition of an object that provides map-like methods */
export interface SimpleMap<K, V> {
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
}
/** a map like object, similar to a {@link WeakMap}, that weakly stores keys of Objects and Functions,
 * but can also (strongly) store primitive objects as keys, similar to {@link Map}. hence the name, `HybridWeakMap` <br>
*/
export declare class HybridWeakMap<K, V> implements SimpleMap<K, V> {
    wmap: WeakMap<K & WeakKey, V>;
    smap: Map<K & PropertyKey, V>;
    private pick;
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    has(key: K): boolean;
    delete(key: K): boolean;
}
/** a tree object (constructed by class returned by {@link treeClass_Factory}) with no initialized value will have this symbol set as its default value */
export declare const TREE_VALUE_UNSET: unique symbol;
export declare const treeClass_Factory: (base_map_class: new <KT, VT>(...args: any[]) => SimpleMap<KT, VT>) => {
    new <K, V>(value?: typeof TREE_VALUE_UNSET | V): {
        value: typeof TREE_VALUE_UNSET | V;
        getDeep(reverse_keys: K[], create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        getDeep(reverse_keys: K[], create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        /** check if a deep child exists with the provided array of reversed keys. <br>
         * this is implemented to be slightly quicker than {@link getDeep}
        */
        hasDeep(reverse_keys: K[]): boolean;
        delDeep(reverse_keys: K[]): boolean;
        get(key: K): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        set(key: K, value: {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        }): this;
        has(key: K): boolean;
        delete(key: K): boolean;
    };
};
export declare const WeakTree: {
    new <K, V>(value?: typeof TREE_VALUE_UNSET | V): {
        value: typeof TREE_VALUE_UNSET | V;
        getDeep(reverse_keys: K[], create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        getDeep(reverse_keys: K[], create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        /** check if a deep child exists with the provided array of reversed keys. <br>
         * this is implemented to be slightly quicker than {@link getDeep}
        */
        hasDeep(reverse_keys: K[]): boolean;
        delDeep(reverse_keys: K[]): boolean;
        get(key: K): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        set(key: K, value: {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        }): this;
        has(key: K): boolean;
        delete(key: K): boolean;
    };
};
export declare const StrongTree: {
    new <K, V>(value?: typeof TREE_VALUE_UNSET | V): {
        value: typeof TREE_VALUE_UNSET | V;
        getDeep(reverse_keys: K[], create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        getDeep(reverse_keys: K[], create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        /** check if a deep child exists with the provided array of reversed keys. <br>
         * this is implemented to be slightly quicker than {@link getDeep}
        */
        hasDeep(reverse_keys: K[]): boolean;
        delDeep(reverse_keys: K[]): boolean;
        get(key: K): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        set(key: K, value: {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        }): this;
        has(key: K): boolean;
        delete(key: K): boolean;
    };
};
export declare const HybridTree: {
    new <K, V>(value?: typeof TREE_VALUE_UNSET | V): {
        value: typeof TREE_VALUE_UNSET | V;
        getDeep(reverse_keys: K[], create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        getDeep(reverse_keys: K[], create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        };
        setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        /** check if a deep child exists with the provided array of reversed keys. <br>
         * this is implemented to be slightly quicker than {@link getDeep}
        */
        hasDeep(reverse_keys: K[]): boolean;
        delDeep(reverse_keys: K[]): boolean;
        get(key: K): {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        } | undefined;
        set(key: K, value: {
            value: any;
            getDeep(reverse_keys: K[], create_intermediate?: true): any;
            getDeep(reverse_keys: K[], create_intermediate?: boolean): any | undefined;
            setDeep<T>(reverse_keys: K[], value: T, create_intermediate?: true): any;
            setDeep<T_1>(reverse_keys: K[], value: T_1, create_intermediate?: boolean): any | undefined;
            /** check if a deep child exists with the provided array of reversed keys. <br>
             * this is implemented to be slightly quicker than {@link getDeep}
            */
            hasDeep(reverse_keys: K[]): boolean;
            delDeep(reverse_keys: K[]): boolean;
            get(key: K): any | undefined;
            set(key: K, value: any): this;
            has(key: K): boolean;
            delete(key: K): boolean;
        }): this;
        has(key: K): boolean;
        delete(key: K): boolean;
    };
};
export declare class StackSet<T> extends Array<T> {
    $set: Set<T>;
    $add: (value: T) => Set<T>;
    $del: (value: T) => boolean;
    /** determines if an item exists in the stack. <br>
     * this operation is as fast as {@link Set.has}, because that's what's being used internally.
     * so expect no overhead.
    */
    includes: (value: T) => boolean;
    /** peek at the top item of the stack without popping */
    top: (...args: this["at"] extends import("./binder.js").BindableFunction<this, [number], infer P extends any[], ReturnType<this["at"]>> ? P : never) => ReturnType<this["at"]>;
    /** synchronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
     * the "f" in "fsync" stands for "forward"
    */
    fsync(): number;
    /** synchronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
     * this process is more expensive than {@link fsync}, as it has to rebuild the entirety of the underlying set object. <br>
     * the "r" in "rsync" stands for "reverse"
    */
    rsync(): number;
    /** reset a `StackSet` with the provided initializing array of unique items */
    reset(initial_items?: Array<T>): void;
    constructor(initial_items?: Array<T>);
    /** pop the item at the top of the stack. */
    pop(): T | undefined;
    /** push __new__ items to stack. doesn't alter the position of already existing items. <br>
     * @returns the new length of the stack.
    */
    push(...items: T[]): number;
    /** push items to front of stack, even if they already exist in the middle. <br>
     * @returns the new length of the stack.
    */
    pushFront(...items: T[]): number;
    /** remove the item at the bottom of the stack. */
    shift(): T | undefined;
    /** insert __new__ items to the rear of the stack. doesn't alter the position of already existing items. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshift(...items: T[]): number;
    /** inserts items to the rear of the stack, even if they already exist in the middle. <br>
     * note that this operation is expensive, because it clears and then rebuild the underlying {@link $set}
     * @returns the new length of the stack.
    */
    unshiftRear(...items: T[]): number;
    /** delete an item from the stack */
    del(item: T): boolean;
    /** delete multiple items from the stack */
    delMany(...items: T[]): void;
}
/** a stack object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export declare class LimitedStack<T> extends Array<T> {
    /** minimum capacity of the stack. <br>
     * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to the minimum specified here
    */
    min: number;
    /** maximum capacity of the stack. <br>
     * when the stack size hits this maximum capacity, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to {@link min}
    */
    max: number;
    /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
    resize_cb?: (discarded_items: T[]) => void;
    constructor(min_capacity: number, max_capacity: number, resize_callback?: (discarded_items: T[]) => void);
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg: any): typeof arg;
    push(...items: T[]): number;
}
/** a stack set object with limited capacity. <br>
 * when the capacity hits the maximum length, then it is reduced down to the minimum capacity.
*/
export declare class LimitedStackSet<T> extends StackSet<T> {
    /** minimum capacity of the stack. <br>
     * when the stack size hits the maximum capacity {@link max}, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to the minimum specified here
    */
    min: number;
    /** maximum capacity of the stack. <br>
     * when the stack size hits this maximum capacity, the oldest items (at the
     * bottom of the stack) are discarded so that the size goes down to {@link min}
    */
    max: number;
    /** provide an optional callback function which is called everytime items are discarded by the stack resizing function {@link resize} */
    resize_cb?: (discarded_items: T[]) => void;
    constructor(min_capacity: number, max_capacity: number, resize_callback?: (discarded_items: T[]) => void);
    /** enforce resizing of stack if necessary. oldest item (at the bottom of the stack) are discarded if the max capacity has been exceeded. <br> */
    resize(arg: any): typeof arg;
    push(...items: T[]): number;
    pushFront(...items: T[]): number;
}
export interface ChainedPromiseQueueConfig<T> {
    /** provide a callback whenever the queue of promises goes empty (each promise element is fulfilled) */
    onEmpty?: () => void;
    /** specify if {@link onEmpty} should be immediately called when the queue is first created. defaults to `false` */
    isEmpty?: boolean;
}
/** a collection of promises that can be further chained with a sequence of "then" functions.
 * once a certain promise in the collection is completed (i.e. goes through all of the chained then functions),
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
export declare class ChainedPromiseQueue<T> extends Array<Promise<T>> {
    /** the chain of the "then" functions to run each newly pushed promise through. <br>
     * you may dynamically modify this sequence so that all newly pushed promises will have to go through a different set of "then" functions. <br>
     * do note that old (already existing) promises will not be affected by the modified chain of "then" functions.
     * they'll stick to their original sequence of thens because that gets decided during the moment when a promise is pushed into this collection.
    */
    chain: [
        then0?: [
            onfulfilled: (value: T) => any | void | PromiseLike<any | void>,
            onrejected?: (reason: any) => void | PromiseLike<any | void>
        ],
        ...Array<[
            onfulfilled: (value: any) => any | void | PromiseLike<any | void>,
            onrejected?: (reason: any) => void | PromiseLike<any | void>
        ]>
    ];
    /** an array of promises consisting of all the final "then" calls, after which (when fulfilled) the promise would be shortly deleted since it will no longer be pending.
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
    pending: Promise<any>[];
    onEmpty?: ChainedPromiseQueueConfig<T>["onEmpty"];
    constructor(then_functions_sequence: ChainedPromiseQueue<T>["chain"], { onEmpty, isEmpty }?: ChainedPromiseQueueConfig<T>);
    push(...new_promises: Promise<T>[]): number;
    /** delete a certain promise that has been chained with the "then" functions.
     * @param completed_pending_promise the promise to be deleted from {@link pending} and {@link this} collection of promises
     * @returns `true` if the pending promise was found and deleted, else `false` will be returned
    */
    private del;
    /** @illegal this method should not be called, as it will break the internal indexing */
    shift: never;
    /** @illegal this method should not be called, as it will break the internal indexing */
    unshift: never;
    /** @illegal this method should not be called, as it will break the internal indexing */
    pop: never;
}
//# sourceMappingURL=collections.d.ts.map