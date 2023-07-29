/** utility functions for querying/traversing a nested object through the use of either:
 * - a dot-separated string query (`dot-path`)
 * - or an array of keys (`key-path`)
 * 
 * this submodule is made to be somewhat strictly typed, so you can expect to get type hints when accessing
 * narrowly typed data via `key-path` or `dot-path` get/set functions.
 * think of it as analogous to `xpath` for xml, and `document.querySelector` for html. <br>
 * ### submodule statistics
 * ```text
 * - minified size without exports: 266 bytes
 * - minified size with exports   : 398 bytes
 * - typescript error workarounds : 4
 * - last updated                 : 2022.11.23
 * ```
 * TODO consider allowing `getKeyPath` and `setKeyPath` to accept `create_missing: boolean = false` option to create missing intermidiate keys/entires
 * @module
*/

/** get an array of all possible `key-path`s. <br>
 * @example
 * ```ts
 * let data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * let path_to_noice: KeyPath<typeof data> = ["kill", "your", "self", 2, 1, "noice"]
 * ```
*/
import "./_dnt.polyfills.js";

export type KeyPathsOf<T> = KeyPathTree<T>[keyof T] & KeyPath

type KeyPathTree<T> = {
	[P in keyof T]-?: T[P] extends object
	? [P] | [P, ...KeyPathsOf<T[P]>]
	: [P]
}

/** this is just an alias for `string`, but it's here just to create a distinction between regular strings and `dot-path`s */
export type DotPath = `${string}.${string}` | string

/** a `key-path` is an array of one or more string keys (number keys work too). <br>
 * @example
 * ```ts
 * const data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * const possible_keypath: KeyPath = ["kill", "your", "self", 2, "1"]
 * ```
*/
export type KeyPath = [string | number, ...(string | number)[]]

/** get the `leaf-key` of a `dot-path` (ie: end point). <br>
 * @example
 * ```ts
 * let leaf_key: DotPathLeaf<"kill.your.self"> = "self" // correct assignment
 * let incorrect_leaf_key: DotPathLeaf<"kill.your.self"> = "your" // typescript error
 * ```
*/
export type DotPathLeaf<DP extends DotPath> = DP extends `${string}.${infer K}` ? DotPathLeaf<K> : DP

/** get the `parent-key` `dot-path` of a `dot-path`. <br>
 * but if there's no parent key, then the key itself is returned <br>
 * @example
 * ```ts
 * let dotpath0: DotPathParent<"kill.your.self.once"> = "kill.your.self"
 * let dotpath1: DotPathParent<typeof dotpath0> = "kill.your"
 * let dotpath2: DotPathParent<typeof dotpath1> = "kill"
 * let dotpath3: DotPathParent<typeof dotpath2> = "kill"
 * ```
*/
export type DotPathParent<DP extends DotPath> = DP extends `${infer P}.${DotPathLeaf<DP>}` ? P : DP

/** convert `dot-path` to an array of `key-path` in the format compliant with the type {@link KeyPathsOf}. <br>
 * @example
 * ```ts
 * const data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * const dotpath_to_noice = "kill.your.self.2.1.noice"
 * const keypath_to_noice:
 * 	DotPathToKeyPath<typeof dotpath_to_noice> & KeyPath<typeof data>
 * 	= ["kill", "your", "self", "2", "1", "noice"]
 * ```
*/
export type DotPathToKeyPath<DP extends DotPath> = DP extends `${infer P}.${DotPathLeaf<DP>}` ? [...DotPathToKeyPath<P>, DotPathLeaf<DP>] : [DP]

/** get the type of nested data through the use of a dot-path <br>
 * @example
 * ```ts
 * const data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * const dotpath_to_noice_parent = "kill.your.self.2.1"
 * const noice_parent: DotPathValue<typeof data, typeof dotpath_to_noice_parent> = { noice: "YAHAHA", 0: "you found me!" }
 * ```
*/
export type DotPathValue<T extends { [key: string]: any }, DP extends DotPath> = DP extends `${infer P}.${infer C}` ? DotPathValue<T[P], C> : T[DP]

/** get the type of nested data through the use of an array of key-path <br>
 * @example
 * ```ts
 * const data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * const keypath_to_noice_parent: ["kill", "your", "self", 2, 1] = ["kill", "your", "self", 2, 1]
 * const noice_parent: KeyPathValue<typeof data, typeof keypath_to_noice_parent> = { noice: "YAHAHA", 0: "you found me!" }
 * ```
*/
export type KeyPathValue<T extends { [key: (string | number)]: any }, KP extends KeyPath> = (
	KP extends [KP[0], ...infer R] ? (
		R extends KeyPath ?
		KeyPathValue<T[KP[0]], R> :
		T[KP[0]]
	) : unknown
)

/** get value of nested `obj` at a given `key-path` */
export const getKeyPath = <T extends object = object, KP = KeyPathsOf<T>>(obj: T, kpath: KP): KeyPathValue<T, KP & KeyPath> => {
	let value: any = obj
	for (const k of kpath as (keyof typeof value)[]) value = value[k]
	return value
}

/** set the value of nested `obj` at a given `key-path` */
export const setKeyPath = <T extends object = object, KP = KeyPathsOf<T>>(obj: T, kpath: KP, value: KeyPathValue<T, KP & KeyPath>): T => {
	const
		child_key = (kpath as & KeyPath).pop()!,
		parent = getKeyPath(obj, kpath) as { [key: (string | number)]: any }
	parent[child_key] = value
	return obj
}

/** similar to {@link bindDotPathTo}, but for `key-path`s */
export const bindKeyPathTo = (bind_to: object): [
	get: <KP extends KeyPath>(kpath: KP) => KeyPathValue<typeof bind_to, KP>,
	set: <KP extends KeyPath>(kpath: KP, value: KeyPathValue<typeof bind_to, KP>) => typeof bind_to
] => ([
	(kpath) => getKeyPath(bind_to, kpath),
	(kpath, value) => setKeyPath(bind_to, kpath, value)
])

/** get value of nested `obj` at a given `dot-path` */
export const getDotPath = <T extends object = object, DP extends DotPath = DotPath>(obj: T, dpath: DP): DotPathValue<T, DP> => getKeyPath(obj, dotPathToKeyPath(dpath)) as DotPathValue<T, DP>

/** set the value of nested `obj` at a given `dot-path` */
export const setDotPath = <T extends object = object, DP extends DotPath = DotPath>(obj: T, dpath: DP, value: DotPathValue<T, DP>): T => setKeyPath(obj, dotPathToKeyPath(dpath), value as KeyPathValue<T, DotPathToKeyPath<DP>>)

/** generate a `dot-path` getter and setter for a specific object given by `bind_to`
 * @example
 * ```ts
 * const data = { kill: { your: { self: [0, 1, { 0: 0, 1: { noice: "YAHAHA", 0: "you found me!" } }] } } }
 * const [getData, setData] = bindDotPathTo(data)
 * console.log(getData("kill.your.self.2.1")) // {0: "you found me!", noice: "YAHAHA"}
 * setData("kill.your.self.2.1.noice", ["arr", "ree", "eek"])
 * console.log(getData("kill.your.self.2.1")) // {0: "you found me!", noice: ["arr", "ree", "eek"]}
 * ```
*/
export const bindDotPathTo = (bind_to: object): [
	get: <DP extends DotPath>(dpath: DP) => DotPathValue<typeof bind_to, DP>,
	set: <DP extends DotPath>(dpath: DP, value: DotPathValue<typeof bind_to, DP>) => typeof bind_to
] => ([
	(dpath) => getDotPath(bind_to, dpath),
	(dpath, value) => setDotPath(bind_to, dpath, value)
])

export const dotPathToKeyPath = <DP extends DotPath>(dpath: DP): DotPathToKeyPath<DP> => dpath.split(".").map(k => k === "0" ? 0 : parseInt(k) || k) as DotPathToKeyPath<DP>
