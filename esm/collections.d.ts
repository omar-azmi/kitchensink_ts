/** contains a set of common collections
 * @module
*/
import "./_dnt.polyfills.js";
import { PrefixProps } from "./typedefs.js";
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
    entries: () => IterableIterator<[K, Set<V>]>;
    rentries: () => IterableIterator<[V, Set<K>]>;
    keys: () => IterableIterator<K>;
    rkeys: () => IterableIterator<V>;
    values: () => IterableIterator<Set<V>>;
    rvalues: () => IterableIterator<Set<K>>;
    [Symbol.iterator]: () => IterableIterator<[K, Set<V>]>;
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
    wmap: WeakMap<any, V>;
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
    /** syncronize the ordering of the stack with the underlying {@link $set} object's insertion order (i.e. iteration ordering). <br>
     * the "f" in "fsync" stands for "forward"
    */
    fsync(): number;
    /** syncronize the insertion ordering of the underlying {@link $set} with `this` stack array's ordering. <br>
     * this process is more expensive than {@link fsync}, as it has to rebuild the entirity of the underlying set object. <br>
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
