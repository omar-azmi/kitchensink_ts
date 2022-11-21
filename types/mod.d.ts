/** auto export for all modules, except `devdebug` <br>
 * `devdebug` pollutes the `globalThis` object whenever imported. thus, anyone desiring this module should import it using `import {...} from "kitchensink_ts/devdebug"` <br>
*/
export * from "./browser.js";
export * from "./crypto.js";
export * from "./eightpack.js";
export * from "./eightpack-varint.js";
export * from "./image.js";
export * from "./lambdacalc.js";
export * from "./numericarray.js";
export * from "./stringman.js";
export * from "./struct.js";
export * from "./typedbuffer.js";
export * from "./typedefs.js";
