/** auto export for all modules, except {@link "devdebug"}. <br>
 * `devdebug` pollutes the `globalThis` object whenever imported.
 * thus, anyone desiring this module should import it using `import {...} from "@oazmi/kitchensink/devdebug"`. <br>
 * also, {@link "builtin_aliases"} is not exported either to avoid namespace pollution in IDEs <br>
*/
import "./_dnt.polyfills.js";
export * from "./array2d.js";
export * from "./binder.js";
export * from "./browser.js";
export * from "./builtin_aliases_deps.js";
export * from "./collections.js";
export * from "./crypto.js";
export * from "./dotkeypath.js";
export * from "./eightpack.js";
export * from "./eightpack_varint.js";
export * from "./formattable.js";
export * from "./image.js";
export * from "./lambda.js";
export * from "./lambdacalc.js";
export * from "./mapper.js";
export * from "./numericarray.js";
export * from "./numericmethods.js";
export * from "./path.js";
export * from "./stringman.js";
export * from "./struct.js";
export * from "./typedbuffer.js";
export * from "./typedefs.js";
//# sourceMappingURL=mod.d.ts.map