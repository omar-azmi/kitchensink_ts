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
 * TODO consider allowing `getKeyPath` and `setKeyPath` to accept `create_missing: boolean = false` option to create missing intermediate keys/entires
 *
 * @module
*/
import "./_dnt.polyfills.js";
import { number_parseInt } from "./alias.js";
/** get value of nested `obj` at a given `key-path` */
export const getKeyPath = (obj, kpath) => {
    let value = obj;
    for (const k of kpath) {
        value = value[k];
    }
    return value;
};
/** set the value of nested `obj` at a given `key-path` */
export const setKeyPath = (obj, kpath, value) => {
    const child_key = kpath.pop(), parent = getKeyPath(obj, kpath);
    parent[child_key] = value;
    return obj;
};
/** similar to {@link bindDotPathTo}, but for `key-path`s */
export const bindKeyPathTo = (bind_to) => ([
    (kpath) => getKeyPath(bind_to, kpath),
    (kpath, value) => setKeyPath(bind_to, kpath, value)
]);
/** get value of nested `obj` at a given `dot-path` */
export const getDotPath = (obj, dpath) => getKeyPath(obj, dotPathToKeyPath(dpath));
/** set the value of nested `obj` at a given `dot-path` */
export const setDotPath = (obj, dpath, value) => setKeyPath(obj, dotPathToKeyPath(dpath), value);
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
export const bindDotPathTo = (bind_to) => ([
    (dpath) => getDotPath(bind_to, dpath),
    (dpath, value) => setDotPath(bind_to, dpath, value)
]);
export const dotPathToKeyPath = (dpath) => dpath.split(".").map(k => k === "0" ? 0 : number_parseInt(k) || k);
