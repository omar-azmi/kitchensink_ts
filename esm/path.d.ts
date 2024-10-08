/** utility tools for manipulating paths and obtaining `URL`s.
 *
 * url terminology:
 * - urls are a subset of uris
 * - a url protocol is defined as: `[scheme]://`
 * - a url is defined as: `[scheme]://[host]/[path]?[queryString]#[fragmentHash]`
 * - or equivalently, a url is: `[protocol][host]/[path]?[queryString]#[fragmentHash]`
 * - a uri is defined as: `[scheme]:[someIdentifier]`
 *
 * @module
*/
import "./_dnt.polyfills.js";
/** recognized uri schemes (i.e. the url protocol's scheme) that are returned by {@link getUriScheme}.
 * - `local`: "C://absolute/path/to/file.txt"
 * - `relative`: "./path/to/file.txt" or "../path/to/file.txt"
 * - `file`: "file://C://absolute/path/to/file.txt"
 * - `http`: "http://example.com/path/to/file.txt"
 * - `https`: "https://example.com/path/to/file.txt"
 * - `data`: "data:text/plain;base64,SGVsbG9Xb3JsZA==" or "data:text/plain,HelloWorld"
 * - `jsr`: "jsr:@scope/package-name"
 * - `npm`: "npm:@scope/package-name" or "npm:package-name"
*/
export type UriScheme = undefined | "local" | "relative" | "file" | "http" | "https" | "data" | "jsr" | "npm";
/** guesses the scheme of a url string. see {@link UriScheme} for more details.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(getUriScheme("C:/Users/me/path/to/file.txt"), "local")
 * assertEquals(getUriScheme("~/path/to/file.txt"), "local")
 * assertEquals(getUriScheme("/usr/me/path/to/file.txt"), "local")
 * assertEquals(getUriScheme("./path/to/file.txt"), "relative")
 * assertEquals(getUriScheme("../path/to/file.txt"), "relative")
 * assertEquals(getUriScheme("file:///c://users/me/path/to/file.txt"), "file")
 * assertEquals(getUriScheme("file:///usr/me/path/to/file.txt"), "file")
 * assertEquals(getUriScheme("jsr:@user/path/to/file"), "jsr")
 * assertEquals(getUriScheme("npm:lib/path/to/file"), "npm")
 * assertEquals(getUriScheme("data:text/plain;charset=utf-8;base64,aGVsbG8="), "data")
 * assertEquals(getUriScheme("http://google.com/style.css"), "http")
 * assertEquals(getUriScheme("https://google.com/style.css"), "https")
 * ```
*/
export declare const getUriScheme: (path: string) => UriScheme;
/** convert a url string to an actual `URL` object.
 *
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * assertEquals(resolveAsUrl("~/path/to/file.txt"), new URL("file://~/path/to/file.txt"))
 * assertEquals(resolveAsUrl("C:/Users/me/path/to/file.txt"), new URL("file:///C:/Users/me/path/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "C:/Users/me/path/"), new URL("file:///C:/Users/me/path/to/file.txt"))
 * assertEquals(resolveAsUrl("../path/to/file.txt", "C:/Users/me/path/"), new URL("file:///C:/Users/me/path/to/file.txt"))
 *
 * assertEquals(resolveAsUrl("./to/file.txt", "http://cdn.google.com/path/"), new URL("http://cdn.google.com/path/to/file.txt"))
 * assertEquals(resolveAsUrl("../to/file.txt", "https://cdn.google.com/path/"), new URL("https://cdn.google.com/to/file.txt"))
 *
 * assertEquals(resolveAsUrl("npm:react/file.txt"), new URL("npm:react/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "npm:react"), new URL("npm:react/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "npm:react/"), new URL("npm:react/to/file.txt"))
 * assertEquals(resolveAsUrl("jsr:@scope/my-lib/file.txt"), new URL("jsr:@scope/my-lib/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "jsr:@scope/my-lib"), new URL("jsr:@scope/my-lib/to/file.txt"))
 * assertEquals(resolveAsUrl("../to/file.txt", "jsr:@scope/my-lib/assets"), new URL("jsr:@scope/my-lib/to/file.txt"))
 *
 * assertThrows(() => resolveAsUrl("./to/file.txt", "data:text/plain;charset=utf-8;base64,aGVsbG8="))
 * assertThrows(() => resolveAsUrl("./to/file.txt", "./path/"))
 * assertThrows(() => resolveAsUrl("./to/file.txt"))
 * ```
*/
export declare const resolveAsUrl: (path: string, base?: string | URL | undefined) => URL;
/** surround a string with double quotation. */
export declare const quote: (str: string) => string;
/** trim the leading forward-slashes at the beginning of a string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(trimStartSlashes("///helloworld/nyaa.si//"), "helloworld/nyaa.si//")
 * assertEquals(trimStartSlashes("file:///helloworld/nyaa.si//"), "file:///helloworld/nyaa.si//")
 * assertEquals(trimStartSlashes(".///../helloworld/nyaa.si//"), ".///../helloworld/nyaa.si//")
 * ```
*/
export declare const trimStartSlashes: (str: string) => string;
/** trim the trailing forward-slashes at the end of a string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(trimEndSlashes("///helloworld/nyaa.si//"), "///helloworld/nyaa.si")
 * assertEquals(trimEndSlashes("file:///helloworld/nyaa.si//hello.txt"), "file:///helloworld/nyaa.si//hello.txt")
 * assertEquals(trimEndSlashes(".///../helloworld/nyaa.si//"), ".///../helloworld/nyaa.si")
 * ```
*/
export declare const trimEndSlashes: (str: string) => string;
/** trim leading and trailing forward-slashes, at the beginning and end of a string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(trimSlashes("///helloworld/nyaa.si//"), "helloworld/nyaa.si")
 * assertEquals(trimSlashes("file:///helloworld/nyaa.si//hello.txt"), "file:///helloworld/nyaa.si//hello.txt")
 * assertEquals(trimSlashes(".///../helloworld/nyaa.si//"), ".///../helloworld/nyaa.si")
 * ```
*/
export declare const trimSlashes: (str: string) => string;
/** ensure that there is at least one leading slash at the beginning.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(ensureStartSlash("helloworld/nyaa.si"), "/helloworld/nyaa.si")
 * assertEquals(ensureStartSlash("file:///helloworld/nyaa.si//hello.txt"), "/file:///helloworld/nyaa.si//hello.txt")
 * assertEquals(ensureStartSlash(".///../helloworld/nyaa.si/"), "/.///../helloworld/nyaa.si/")
 * assertEquals(ensureStartSlash("///../helloworld/nyaa.si/"), "///../helloworld/nyaa.si/")
 * ```
*/
export declare const ensureStartSlash: (str: string) => string;
/** ensure that there is at least one trailing slash at the end.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(ensureEndSlash("///helloworld/nyaa.si//"), "///helloworld/nyaa.si//")
 * assertEquals(ensureEndSlash("file:///helloworld/nyaa.si//hello.txt"), "file:///helloworld/nyaa.si//hello.txt/")
 * assertEquals(ensureEndSlash(".///../helloworld/nyaa.si/"), ".///../helloworld/nyaa.si/")
 * ```
*/
export declare const ensureEndSlash: (str: string) => string;
/** trim leading and trailing forward-slashes ("/") and dot-slashes ("./"), at the beginning and end of a string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(trimDotSlashes("///helloworld/nyaa.si//"), "helloworld/nyaa.si")
 * assertEquals(trimDotSlashes("file:///helloworld/nyaa.si//hello.txt"), "file:///helloworld/nyaa.si//hello.txt")
 * assertEquals(trimDotSlashes(".///../helloworld/nyaa.si//"), "../helloworld/nyaa.si")
 * assertEquals(trimDotSlashes("//./././///././//../helloworld/nyaa.si//"), "../helloworld/nyaa.si")
 * ```
*/
export declare const trimDotSlashes: (str: string) => string;
/** join path segments with forward-slashes in between.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(joinSlash("///helloworld//", "nyaa.si//"), "helloworld/nyaa.si")
 * assertEquals(joinSlash("file:///helloworld/", "nyaa.si//", "./hello.txt"), "file:///helloworld/nyaa.si/hello.txt")
 * assertEquals(joinSlash(".///../helloworld/nyaa.si", "hello.txt"), "../helloworld/nyaa.si/hello.txt")
 * assertEquals(joinSlash("//./././///././//../helloworld/nyaa.si//", "///.////././.././hello.txt"), "../helloworld/nyaa.si/.././hello.txt")
 * ```
*/
export declare const joinSlash: (...segments: string[]) => string;
/** reduce/remove redundant dot-slash ("./" and "../") path navigators from a path.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(reducePath("../helloworld/./temp/../././/hello.txt"), "../helloworld//hello.txt")
 * assertEquals(reducePath("./././hello/world/.././././//file.txt"), "hello///file.txt")
 * assertEquals(reducePath("file:///./././hello/world/.././././file.txt"), "file:///hello/file.txt")
 * ```
*/
export declare const reducePath: (path: string) => string;
/** convert windows directory slash "\" to unix directory slash "/".
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(pathToUnixPath("C:\\Users/my name\\file.txt"), "C:/Users/my name/file.txt")
 * assertEquals(pathToUnixPath("~/path/to/file.txt"), "~/path/to/file.txt")
 * ```
*/
export declare const pathToUnixPath: (path: string) => string;
/** convert an array of paths to cli compatible list of paths, suitable for setting as an environment variable.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // conversion example with windows separator (";")
 * assertEquals(pathsToCliArg(";", ["./a/b/c.txt", "C:\\Android Studio\\sdk\\", "build\\libs\\"]), `"./a/b/c.txt;C:/Android Studio/sdk/;build/libs/"`)
 *
 * // conversion example with unix separator (":")
 * assertEquals(pathsToCliArg(":", ["./a/b/c.txt", "~/Android Studio/sdk/", "build/libs/"]), `"./a/b/c.txt:~/Android Studio/sdk/:build/libs/"`)
 * ```
*/
export declare const pathsToCliArg: (separator: ";" | ":", paths: string[]) => string;
//# sourceMappingURL=path.d.ts.map