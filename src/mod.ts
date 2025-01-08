/** auto export for all submodules, with the exception of the following:
 * - {@link "alias"}:
 *   it will pollute the global namespace, making it harder for IDEs to give useful suggestions.
 *   in addition, the bundled `kitchensink` library will be inflated with these un-treeshaken exports.
 * - {@link "binder"}:
 *   this submodule will add a lot of un-treeshaken baggage, and it will probably not be used by the end user.
 * - {@link "devdebug"}:
 *   this submodule pollutes the `globalThis` object whenever imported, so it is not exported here.
 * 
 * anyone desiring to import one of these submodules should import them directly using `import {...} from "@oazmi/kitchensink/submodule_name"`.
*/

// export * from "./alias.ts"
export * from "./array1d.ts"
export * from "./array2d.ts"
// export * from "./binder.ts"
export * from "./browser.ts"
export * from "./collections.ts"
export * from "./cryptoman.ts"
// export * from "./devdebug.ts"
export * from "./dotkeypath.ts"
export * from "./eightpack.ts"
export * from "./eightpack_varint.ts"
export * from "./formattable.ts"
export * from "./image.ts"
export * from "./lambda.ts"
export * from "./lambdacalc.ts"
export * from "./mapper.ts"
export * from "./numericarray.ts"
export * from "./numericmethods.ts"
export * from "./pathman.ts"
export * from "./stringman.ts"
export * from "./struct.ts"
export * from "./timeman.ts"
export * from "./typedbuffer.ts"
export * from "./typedefs.ts"

