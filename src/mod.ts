/** auto export for all modules, except `devdebug` <br>
 * `devdebug` pollutes the `globalThis` object whenever imported. thus, anyone desiring this module should import it using `import {...} from "kitchensink_ts/devdebug"` <br>
 * also, `builtin_aliases` is not exported either to avoid namespace pollution in IDEs <br>
*/

export * from "./array2d.ts"
export * from "./browser.ts"
// export * from "./builtin_aliases.ts"
export * from "./collections.ts"
export * from "./crypto.ts"
// export * from "./devdebug.ts"
export * from "./dotkeypath.ts"
export * from "./eightpack.ts"
export * from "./eightpack_varint.ts"
export * from "./formattable.ts"
export * from "./image.ts"
export * from "./lambdacalc.ts"
export * from "./mapper.ts"
export * from "./numericarray.ts"
export * from "./numericmethods.ts"
export * from "./stringman.ts"
export * from "./struct.ts"
export * from "./typedbuffer.ts"
export * from "./typedefs.ts"
