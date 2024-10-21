/** utility tools for manipulating paths and obtaining `URL`s.
 *
 * TODO: write document level examples.
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
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = getUriScheme
 *
 * eq(fn("C:/Users/me/path/to/file.txt"), "local")
 * eq(fn("~/path/to/file.txt"), "local")
 * eq(fn("/usr/me/path/to/file.txt"), "local")
 * eq(fn("./path/to/file.txt"), "relative")
 * eq(fn("../path/to/file.txt"), "relative")
 * eq(fn("file:///c://users/me/path/to/file.txt"), "file")
 * eq(fn("file:///usr/me/path/to/file.txt"), "file")
 * eq(fn("jsr:@user/path/to/file"), "jsr")
 * eq(fn("jsr:/@user/path/to/file"), "jsr")
 * eq(fn("npm:lib/path/to/file"), "npm")
 * eq(fn("npm:/lib/path/to/file"), "npm")
 * eq(fn("npm:/@scope/lib/path/to/file"), "npm")
 * eq(fn("data:text/plain;charset=utf-8;base64,aGVsbG8="), "data")
 * eq(fn("http://google.com/style.css"), "http")
 * eq(fn("https://google.com/style.css"), "https")
 * ```
*/
export declare const getUriScheme: (path: string) => UriScheme;
/** a description of a parsed jsr/npm package, that somewhat resembles the properties of regular URL. */
export interface PackagePseudoUrl {
    /** the full package string, compatible to use with the `URL` constructor.
     *
     * examples:
     * - `jsr:/@scope/package@version/pathname`
     * - `jsr:/@scope/package`
     * - `npm:/package@version/pathname`
     * - `npm:/@scope/package@version`
    */
    href: string | `${"npm" | "jsr"}:/${PackagePseudoUrl["host"]}${PackagePseudoUrl["pathname"]}`;
    protocol: "npm:" | "jsr:";
    /** optional scope name. */
    scope?: string;
    /** name of the package. the reason why we call it "pkg" instead of "package" is because "package" is a reserved word in javascript. */
    pkg: string;
    /** optional version string of the package. */
    version?: string;
    /** the pathname of the subpath that is being accessed within the package.
     * this will always begin with a leading slash ("/"), even if there is no subpath being accessed.
    */
    pathname: string;
    /** the host contains the full information about the package's string.
     * that is, it has the optional scope information, the package name information, and the optional version information.
    */
    host: string | `${PackagePseudoUrl["pkg"]}` | `${PackagePseudoUrl["pkg"]}@${PackagePseudoUrl["version"]}` | `@${PackagePseudoUrl["scope"]}/${PackagePseudoUrl["pkg"]}` | `@${PackagePseudoUrl["scope"]}/${PackagePseudoUrl["pkg"]}@${PackagePseudoUrl["version"]}`;
}
/** this function parses npm and jsr package strings, and returns a pseudo URL-like object.
 *
 * the regex we use for parsing the input `href` string is quoted below:
 * > /^(?<protocol>npm:|jsr:)(\/*(@(?<scope>[^\/\s]+)\/)?(?<pkg>[^@\/\s]+)(@(?<version>[^\/\s]+))?)?(?<pathname>\/.*)?$/
 *
 * see the regex in action with the test cases on regex101 link: [regex101.com/r/mX3v1z/1](https://regex101.com/r/mX3v1z/1)
 *
 * @throws `Error` an error will be thrown if either the package name (`pkg`), or the `protocol` cannot be deduced by the regex.
 *
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, err = assertThrows, fn = parsePackageUrl
 *
 * eq(fn("jsr:@scope/package@version/pathname/file.ts"), {
 * 	href: "jsr:/@scope/package@version/pathname/file.ts",
 * 	protocol: "jsr:",
 * 	scope: "scope",
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/pathname/file.ts",
 * 	host: "@scope/package@version",
 * })
 * eq(fn("jsr:package@version/pathname/"), {
 * 	href: "jsr:/package@version/pathname/",
 * 	protocol: "jsr:",
 * 	scope: undefined,
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/pathname/",
 * 	host: "package@version",
 * })
 * eq(fn("npm:///@scope/package@version"), {
 * 	href: "npm:/@scope/package@version/",
 * 	protocol: "npm:",
 * 	scope: "scope",
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/",
 * 	host: "@scope/package@version",
 * })
 * eq(fn("npm:package"), {
 * 	href: "npm:/package/",
 * 	protocol: "npm:",
 * 	scope: undefined,
 * 	pkg: "package",
 * 	version: undefined,
 * 	pathname: "/",
 * 	host: "package",
 * })
 *
 * err(() => fn("npm:@scope/")) // missing a package name
 * err(() => fn("npm:@scope//package")) // more than one slash after scope
 * err(() => fn("pnpm:@scope/package@version")) // only "npm:" and "jsr:" protocols are recognized
 * ```
*/
export declare const parsePackageUrl: (url_href: string | URL) => PackagePseudoUrl;
/** convert a url string to an actual `URL` object.
 * your input `path` url can use any scheme supported by the {@link getUriScheme} function.
 * and you may also use paths with windows dir-separators ("\\"), as this function implicitly converts them a posix separator ("/").
 *
 * @throws `Error` an error will be thrown if `base` uri is either a relative path, or uses a data uri scheme,
 *   or if the provided `path` is relative, but no absolute `base` path is provided.
 *
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, err = assertThrows, fn = resolveAsUrl
 *
 * eq(fn("~/a/b/c.txt"),                           new URL("file://~/a/b/c.txt"))
 * eq(fn("C:/a/b/c/d/e.txt"),                      new URL("file:///C:/a/b/c/d/e.txt"))
 * eq(fn("C:\\a\\b\\c\\d\\e.txt"),                 new URL("file:///C:/a/b/c/d/e.txt"))
 * eq(fn("./d/e.txt", "C:/a\\b\\c/"),              new URL("file:///C:/a/b/c/d/e.txt"))
 * eq(fn("../c/d/e.txt", "C:/a/b/c/"),             new URL("file:///C:/a/b/c/d/e.txt"))
 *
 * eq(fn("./b/c.txt", "http://cdn.esm.sh/a/"),     new URL("http://cdn.esm.sh/a/b/c.txt"))
 * eq(fn("../b/c.txt", "https://cdn.esm.sh/a/"),   new URL("https://cdn.esm.sh/b/c.txt"))
 *
 * eq(fn("npm:react/file.txt"),                    new URL("npm:/react/file.txt"))
 * eq(fn("npm:@facebook/react"),                   new URL("npm:/@facebook/react/"))
 * eq(fn("./to/file.txt", "npm:react"),            new URL("npm:/react/to/file.txt"))
 * eq(fn("./to/file.txt", "npm:react/"),           new URL("npm:/react/to/file.txt"))
 *
 * eq(fn("jsr:@scope/my-lib/b.txt"),               new URL("jsr:/@scope/my-lib/b.txt"))
 * eq(fn("./a/b.txt", "jsr:///@scope/my-lib"),     new URL("jsr:/@scope/my-lib/a/b.txt"))
 * eq(fn("./a/b.txt", "jsr:///@scope/my-lib/c"),   new URL("jsr:/@scope/my-lib/a/b.txt"))
 * eq(fn("./a/b.txt", "jsr:///@scope/my-lib//c"),  new URL("jsr:/@scope/my-lib/a/b.txt"))
 * eq(fn("../a/b.txt", "jsr:/@scope/my-lib///c/"), new URL("jsr:/@scope/my-lib/a/b.txt"))
 * eq(fn("./a/b.txt", "jsr:///@scope/my-lib/c/"),  new URL("jsr:/@scope/my-lib/c/a/b.txt"))
 *
 * err(() => fn("./a/b.txt", "data:text/plain;charset=utf-8;base64,aGVsbG8="))
 * err(() => fn("./a/b.txt", "./path/")) // a base path must not be relative
 * err(() => fn("./a/b.txt")) // a relative path cannot be resolved on its own without a base path
 * ```
*/
export declare const resolveAsUrl: (path: string, base?: string | URL | undefined) => URL;
/** trim the leading forward-slashes at the beginning of a string.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimStartSlashes
 *
 * eq(fn("///a/b.txt//"),      "a/b.txt//")
 * eq(fn("/.//a/b.txt//"),     ".//a/b.txt//")
 * eq(fn(".///../a/b.txt//"),  ".///../a/b.txt//")
 * eq(fn("file:///a/b.txt//"), "file:///a/b.txt//")
 * ```
*/
export declare const trimStartSlashes: (str: string) => string;
/** trim the trailing forward-slashes at the end of a string, except for those that are preceded by a dotslash ("/./") or a dotdotslash ("/../")
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimEndSlashes
 *
 * eq(fn("///a/b.zip///"),          "///a/b.zip")
 * eq(fn("///a/b.zip/.///"),        "///a/b.zip/./")
 * eq(fn("///a/b.zip/..///"),       "///a/b.zip/../")
 * eq(fn("///a/b.zip/...///"),      "///a/b.zip/...")
 * eq(fn("///a/b.zip/wut.///"),     "///a/b.zip/wut.")
 * eq(fn("///a/b.zip/wut..///"),    "///a/b.zip/wut..")
 * eq(fn("///a/b.zip/wut...///"),   "///a/b.zip/wut...")
 * eq(fn(".///../a/b.zip/"),        ".///../a/b.zip")
 * eq(fn("file:///a/b.zip//c.txt"), "file:///a/b.zip//c.txt")
 * ```
*/
export declare const trimEndSlashes: (str: string) => string;
/** trim leading and trailing forward-slashes, at the beginning and end of a string.
 * this is a combination of {@link trimStartSlashes} and {@link trimEndSlashes}, so see their doc comments for more precise test cases.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimSlashes
 *
 * eq(fn("///a/b.zip//"),           "a/b.zip")
 * eq(fn("///a/b.zip/..///"),       "a/b.zip/../")
 * eq(fn("///a/b.zip/...///"),      "a/b.zip/...")
 * eq(fn("///a/b.zip/.//..///"),    "a/b.zip/.//../")
 * eq(fn("///a/b.zip/.//.///"),     "a/b.zip/.//./")
 * eq(fn(".///../a/b.zip//"),       ".///../a/b.zip")
 * eq(fn("file:///a/b.zip//c.txt"), "file:///a/b.zip//c.txt")
 * ```
*/
export declare const trimSlashes: (str: string) => string;
/** ensure that there is at least one leading slash at the beginning.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = ensureStartSlash
 *
 * eq(fn("a/b.zip"),                "/a/b.zip")
 * eq(fn(".///../a/b.zip/"),        "/.///../a/b.zip/")
 * eq(fn("///../a/b.zip/"),         "///../a/b.zip/")
 * eq(fn("file:///a/b.zip//c.txt"), "/file:///a/b.zip//c.txt")
 * ```
*/
export declare const ensureStartSlash: (str: string) => string;
/** ensure that there is at least one leading dot-slash at the beginning.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = ensureStartDotSlash
 *
 * eq(fn("a/b.zip"),                "./a/b.zip")
 * eq(fn(".///../a/b.zip/"),        ".///../a/b.zip/")
 * eq(fn("///../a/b.zip/"),         ".///../a/b.zip/")
 * eq(fn("file:///a/b.zip//c.txt"), "./file:///a/b.zip//c.txt")
 * ```
*/
export declare const ensureStartDotSlash: (str: string) => string;
/** ensure that there is at least one trailing slash at the end.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = ensureEndSlash
 *
 * eq(fn("///a/b.zip//"),           "///a/b.zip//")
 * eq(fn(".///../a/b.zip/"),        ".///../a/b.zip/")
 * eq(fn(".///../a/b.zip/."),       ".///../a/b.zip/./")
 * eq(fn(".///../a/b.zip/./"),      ".///../a/b.zip/./")
 * eq(fn(".///../a/b.zip/.."),      ".///../a/b.zip/../")
 * eq(fn(".///../a/b.zip/../"),     ".///../a/b.zip/../")
 * eq(fn("file:///a/b.zip//c.txt"), "file:///a/b.zip//c.txt/")
 * ```
*/
export declare const ensureEndSlash: (str: string) => string;
/** trim leading forward-slashes ("/") and dot-slashes ("./"), at the beginning a string.
 * but exclude non-trivial dotdotslash ("/../") from being wrongfully trimmed.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimStartDotSlashes
 *
 * eq(fn("///a/b.zip/c.txt"),              "a/b.zip/c.txt")
 * eq(fn("///a/b.zip//"),                  "a/b.zip//")
 * eq(fn("//..//a/b.zip//"),               "..//a/b.zip//")
 * eq(fn("/./..//a/b.zip//"),              "..//a/b.zip//")
 * eq(fn("/./.././a/b.zip//"),             ".././a/b.zip//")
 * eq(fn("///././///.////a/b.zip//"),      "a/b.zip//")
 * eq(fn(".///././///.////a/b.zip//"),     "a/b.zip//")
 * eq(fn("./././//././///.////a/b.zip//"), "a/b.zip//")
 * eq(fn("file:///a/b.zip//c.txt"),        "file:///a/b.zip//c.txt")
 * ```
*/
export declare const trimStartDotSlashes: (str: string) => string;
/** trim all trivial trailing forward-slashes ("/") and dot-slashes ("./"), at the end a string.
 * but exclude non-trivial dotdotslash ("/../") from being wrongfully trimmed.
 *
 * TODO: this operation is somewhat expensive, because: <br>
 * the implementation uses regex, however it was not possible for me to design a regex that handles the input string as is,
 * so I resort to reversing the input string, and using a slightly easier-to-design regex that discovers trivial (dot)slashes in reverse order,
 * and then after the string replacement, I reverse it again and return it as the output.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimEndDotSlashes
 *
 * eq(fn("a/b.zip/c.txt"),                "a/b.zip/c.txt")
 * eq(fn("//a/b.zip//"),                  "//a/b.zip")
 * eq(fn("/"),                            "")
 * eq(fn("./"),                           "")
 * eq(fn("//././//./"),                   "")
 * eq(fn(".//././//./"),                  "")
 * eq(fn(".//./..///./"),                 ".//./../")
 * eq(fn("/a/b.zip/./"),                  "/a/b.zip")
 * eq(fn("/a/b.zip/../"),                 "/a/b.zip/../")
 * eq(fn("/a/b.zip/..//"),                "/a/b.zip/../")
 * eq(fn("/a/b.zip/.././"),               "/a/b.zip/../")
 * eq(fn("a/b.zip///././///.////"),       "a/b.zip")
 * eq(fn("/a/b.zip///././///.////"),      "/a/b.zip")
 * eq(fn("/a/b.zip/.././/.././///.////"), "/a/b.zip/.././/../")
 * eq(fn("/a/b.zip/././././///.////"),    "/a/b.zip")
 * eq(fn("/a/b.zip./././././///.////"),   "/a/b.zip.")
 * eq(fn("/a/b.zip../././././///.////"),  "/a/b.zip..")
 * eq(fn("/a/b.zip.../././././///.////"), "/a/b.zip...")
 * eq(fn("file:///a/b.zip//c.txt"),       "file:///a/b.zip//c.txt")
 * ```
*/
export declare const trimEndDotSlashes: (str: string) => string;
/** trim leading and trailing forward-slashes ("/") and dot-slashes ("./"), at the beginning and end of a string, but keep trailing non-trivial ones intact.
 * this is a combination of {@link trimStartDotSlashes} and {@link trimEndDotSlashes}, so see their doc comments for more precise test cases.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = trimDotSlashes
 *
 * eq(fn("///a/b.zip//"),                  "a/b.zip")
 * eq(fn(".///../a/b.zip//"),              "../a/b.zip")
 * eq(fn("//./././///././//../a/b.zip//"), "../a/b.zip")
 * eq(fn("file:///a/b.zip//c.txt"),        "file:///a/b.zip//c.txt")
 * ```
*/
export declare const trimDotSlashes: (str: string) => string;
/** TODO: purge this function in the future, if you absolutely do not use it anywhere.
 * @deprecated
 *
 * > [!note]
 * > you'd probably want to use {@link joinPaths} instead of this function, for any realistic set of path segments.
 * > not only is this more expensive to compute, it does not distinguish between a directory and a file path (intentionally).
 *
 * join path segments with forward-slashes in between, and remove redundant slashes ("/") and dotslashes ("./") around each segment (if any).
 * however, the first segment's leading and trailing slashes are left untouched,
 * because that would potentially strip away location information (such as relative path ("./"), or absolute path ("/"), or some uri ("file:///")).
 *
 * if you want to ensure that your first segment is shortened, use either the {@link normalizePath} or {@link normalizePosixPath} function on it before passing it here.
 *
 * > [!warning]
 * > it is recommended that you use segments with posix path dir-separators ("/").
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = joinSlash
 *
 * eq(fn(".///../a", "b", "c.txt"),               ".///../a/b/c.txt")
 * eq(fn("file:///a/", "b.zip//", "./c.txt"),     "file:///a/b.zip/c.txt")
 * eq(fn("file:///", "a/", "b.zip//", "./c.txt"), "file:///a/b.zip/c.txt")
 * eq(fn("///a//", "b.//", "zip..//"),            "///a//b./zip..")
 * eq(fn("a/", "b.zip", "./c.txt", ""),           "a/b.zip/c.txt/")
 * eq(fn("a/", "b.zip", "./c.txt", "."),          "a/b.zip/c.txt/")
 * eq(fn("a/", "b.zip", "./c.txt", "./"),         "a/b.zip/c.txt/")
 * eq(fn("a/", "b.zip", "./c.txt", ".."),         "a/b.zip/c.txt/..")
 * eq(fn("a/", "b.zip", "./c.txt", "..."),        "a/b.zip/c.txt/...")
 * eq(fn("", "", ""),                             "")
 * eq(fn("/", "", ""),                            "/")
 * eq(fn("/", "/", ""),                           "/")
 * eq(fn("/", "", "/"),                           "/")
 * eq(fn("/", "/", "/"),                          "/")
 * eq(fn("./", "", ""),                           "./")
 * eq(fn("./", "./", ""),                         "./")
 * eq(fn("./", "", "./"),                         "./")
 * eq(fn("./", "./", "./"),                       "./")
 * eq(fn(
 * 	"//./././///././//../a/b.zip/.////",
 * 	"///.////././.././c.txt/./../",
 * 	"../../d.xyz//.//",
 * ), "//./././///././//../a/b.zip/.////.././c.txt/./../../../d.xyz")
 * ```
*/
export declare const joinSlash: (first_segment?: string, ...segments: string[]) => string;
/** config options for {@link normalizePosixPath} and {@link normalizePath} */
export interface NormalizePathConfig {
    /** specify whether or not to preserve the relative leading dotslash ("./") directory specifier?
     *
     * here is what you would get for each of the following input values, based on how you configure this setting:
     * - `input = "././//../a/./././b.txt"`
     *   - `true`: `".//a/./././b.txt"`
     *   - `false`: `"/a/./././b.txt"`
     * - `input = "./././././"`
     *   - `true`: `"./"`
     *   - `false`: `""`
     * - `input = "a/b.txt/././../././"`
     *   - `true`: `"a"`
     *   - `false`: `"a"`
     * - `input = "/./././/a/b.txt"`
     *   - `true`: `"//a/b.txt"`
     *   - `false`: `"//a/b.txt"`
     *
     * @defaultValue `true`
    */
    keepRelative?: boolean;
}
/** normalize a path by reducing and removing redundant dot-slash ("./" and "../") path navigators from a path.
 *
 * if you provide the optional `config` with the `keepRelative` set to `false`, then in the output, there will no be leading dot-slashes ("./").
 * read more about the option here: {@link NormalizePathConfig.keepRelative}.
 * but note that irrespective of what you set this option to be, leading leading dotdot-slashes ("../") and leading slashes ("/") will not be trimmed.
 *
 * even though `config` should be of {@link NormalizePathConfig} type, it also accepts `number` so that the function's signature becomes compatible with the `Array.prototype.map` method,
 * however, unless you pass the correct config object type, only the default action will be taken.
 *
 * > [!warning]
 * > you MUST provide a posix path (i.e. use "/" for dir-separator).
 * > there will not be any implicit conversion of windows "\\" dir-separator.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = normalizePosixPath
 * // aliasing the config for disabling the preservation of leading "./"
 * const remove_rel: NormalizePathConfig = { keepRelative: false }
 *
 * eq(fn("../a/./b/../././/c.txt"),                 "../a//c.txt")
 * eq(fn("./././a/b/.././././//c.txt"),             "./a///c.txt")
 * eq(fn("./././a/b/.././././//c.txt", remove_rel), "a///c.txt")
 * eq(fn("/a/b/.././././//c.txt"),                  "/a///c.txt")
 * eq(fn("///a/b/.././././//c.txt"),                "///a///c.txt")
 * eq(fn("///a/b/.././.././//c.txt"),               "/////c.txt")
 * eq(fn("file:///./././a/b/.././././c.txt"),       "file:///a/c.txt")
 * eq(fn(""),                                       "")
 * eq(fn("./"),                                     "./")
 * eq(fn("../"),                                    "../")
 * eq(fn("./././././"),                             "./")
 * eq(fn(".././././"),                              "../")
 * eq(fn("./././.././././"),                        "../")
 * eq(fn("./././.././.././"),                       "../../")
 * eq(fn("./", remove_rel),                         "")
 * eq(fn("./././././", remove_rel),                 "")
 * eq(fn("./././.././././", remove_rel),            "../")
 * eq(fn("./././.././.././", remove_rel),           "../../")
 * ```
*/
export declare const normalizePosixPath: (path: string, config?: NormalizePathConfig | number) => string;
/** normalize a path by reducing and removing redundant dot-slash ("./", "../", ".\\", and "..\\") path navigators from a path.
 * the returned output is always a posix-style path.
 *
 * to read about the optional `config` parameter, refer to the docs of {@link normalizePosixPath}, which is the underlying function that takes care most of the normalization.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = normalizePath
 *
 * eq(fn("../a/./b/../././/c.txt"),                "../a//c.txt")
 * eq(fn("./.\\.\\a\\b\\.././.\\.///c.txt"),       "./a///c.txt")
 * eq(fn("/home\\.config/a\\..\\...\\b\\./c.txt"), "/home/.config/.../b/c.txt")
 * eq(fn("file:///./././a\\b/..\\././.\\c.txt"),   "file:///a/c.txt")
 * ```
*/
export declare const normalizePath: (path: string, config?: NormalizePathConfig | number) => string;
/** convert windows directory slash "\\" to posix directory slash "/".
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = pathToPosixPath
 *
 * eq(fn("C:\\Users/my name\\file.txt"), "C:/Users/my name/file.txt")
 * eq(fn("~/path/to/file.txt"),          "~/path/to/file.txt")
 * ```
*/
export declare const pathToPosixPath: (path: string) => string;
/** convert an array of paths to cli compatible list of paths, suitable for setting as an environment variable.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = pathsToCliArg
 *
 * // conversion example with windows separator (";")
 * eq(fn(";", [
 * 	"./a/b/c.txt",
 * 	"C:\\Android Studio\\sdk\\",
 * 	"build\\libs\\"
 * ]), `"./a/b/c.txt;C:/Android Studio/sdk/;build/libs/"`)
 *
 * // conversion example with unix separator (":")
 * eq(fn(":", [
 * 	"./a/b/c.txt",
 * 	"~/Android Studio/sdk/",
 * 	"build/libs/"
 * ]), `"./a/b/c.txt:~/Android Studio/sdk/:build/libs/"`)
 * ```
*/
export declare const pathsToCliArg: (separator: ";" | ":", paths: string[]) => string;
/** find the prefix path directory common to all provided `paths`.
 * > [!warning]
 * > your paths MUST be normalized beforehand, and use posix dir-separators ("/").
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = commonNormalizedPosixPath
 *
 * eq(fn([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ]), "C:/Hello/")
 * eq(fn([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ]), "C:/Hello/World/This/")
 * eq(fn([
 * 	"./../Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"./../Hello/World Users/This/Is/An/example/bla.cs",
 * 	"./../Hello/World-Users/This/Is/Not/An/Example/",
 * ]), "./../Hello/")
 * eq(fn([
 * 	"./Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"./Hello/World/",
 * 	"./Hello/World", // the "World" here segment is not treated as a directory
 * ]), "./Hello/")
 * eq(fn([
 * 	"C:/Hello/World/",
 * 	"/C:/Hello/World/",
 * 	"C:/Hello/World/",
 * ]), "") // no common prefix was identified
 * ```
*/
export declare const commonNormalizedPosixPath: (paths: string[]) => string;
/** find the prefix path directory common to all provided `paths`.
 * your input `paths` do not need to be normalized nor necessarily use posix-style separator "/".
 * under the hood, this function normalizes and converts all paths to posix-style, then applies the {@link commonNormalizedPosixPath} onto them.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = commonPath
 *
 * eq(fn([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ]), "C:/Hello/")
 * eq(fn([
 * 	"./Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	".\\Hello/World/This/Is/an/example/bla.cs",
 * 	"./Hello/World/This/Is/Not/An/Example/",
 * ]), "./Hello/World/This/Is/")
 * eq(fn([
 * 	"./../home/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"././../home\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"./../home/./.\\.\\././Hello/World-Users/./././././This/Is/Not/An/Example/",
 * ]), "../home/Hello/")
 * eq(fn([
 * 	"\\C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"/C:\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"/C:/Hello/World", // the "World" here segment is not treated as a directory
 * ]), "/C:/Hello/")
 * ```
*/
export declare const commonPath: (paths: string[]) => string;
/** replace the common path among all provided `paths` by transforming it with a custom `map_fn` function.
 * all `paths` are initially normalized and converted into posix-style (so that no "\\" windows separator is prevelent).
 *
 * the `map_fn` function's first argument (`path_info`), is a 2-tuple of the form `[common_dir: string, subpath: string]`,
 * where `common_dir` represents the directory common to all of the input `paths`, and the `subpath` represents the remaining relative path that comes after common_dir.
 * - the `common_dir` always ends with a trailing slash ("/"), unless there is absolutely no common directory among the `paths` at all.
 * - the `subpath` never begins with any slash (nor any dot-slashes), unless of course, you had initially provided a path containing two or more consecutive slashes.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = commonPathTransform
 *
 * const subpath_map_fn = ([common_dir, subpath]: [string, string]) => (subpath)
 *
 * eq(fn([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ], subpath_map_fn), [
 * 	"World/This/Is/An/Example/Bla.cs",
 * 	"World/This/Is/Not/An/Example/",
 * 	"Earth/Bla/Bla/Bla",
 * ])
 * eq(fn([
 * 	"./../././home/Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	"./././../home/Hello/World/This/Is/an/example/bla.cs",
 * 	"./../home/Hello/World/This/Is/Not/An/Example/",
 * ], subpath_map_fn), [
 * 	"An/Example/Bla.cs",
 * 	"an/example/bla.cs",
 * 	"Not/An/Example/",
 * ])
 * eq(fn([
 * 	"/C:/Hello///World/Users/This/Is/An/Example/Bla.cs",
 * 	"/C:\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"/C:/./.\\.\\././Hello/World-Users/./././././This/Is/Not/An/Example/",
 * ], subpath_map_fn), [
 * 	"//World/Users/This/Is/An/Example/Bla.cs",
 * 	"World Users/This/Is/An/example/bla.cs",
 * 	"World-Users/This/Is/Not/An/Example/",
 * ])
 * ```
*/
export declare const commonPathTransform: <T = string, PathInfo extends [common_dir: string, subpath: string] = [common_dir: string, subpath: string]>(paths: string[], map_fn: (path_info: PathInfo, index: number, path_infos: PathInfo[]) => T) => T[];
/** purge the common path among all provided `paths`, and replace (join) it with a `new_common_dir` path.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = commonPathReplace
 *
 * eq(fn([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ], "D:/"), [
 * 	"D:/World/This/Is/An/Example/Bla.cs",
 * 	"D:/World/This/Is/Not/An/Example/",
 * 	"D:/Earth/Bla/Bla/Bla",
 * ])
 * eq(fn([
 * 	"C:/Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/Is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ], "D:/temp"), [ // an implicit  forward slash is added.
 * 	"D:/temp/An/Example/Bla.cs",
 * 	"D:/temp/an/example/bla.cs",
 * 	"D:/temp/Not/An/Example/",
 * ])
 * eq(fn([
 * 	// there is no common ancestor among each of the paths (even "C:/" and "./C:/" are not considered to be equivalent to one another)
 * 	"http:/Hello/World.cs",
 * 	"./C:/Hello/World.cs",
 * 	"C:/Hello/World/file.cs",
 * ], "D:/temp/"), [
 * 	"D:/temp/http:/Hello/World.cs",
 * 	"D:/temp/C:/Hello/World.cs",
 * 	"D:/temp/C:/Hello/World/file.cs",
 * ])
 * eq(fn([
 * 	"/C:/Hello///World/Users/This/Is/An/Example/Bla.cs",
 * 	"/C:\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"/C:/./.\\.\\././Hello/World-Users/./././././This/Is/Not/An/Example/",
 * ], "file:///./.\\HELLO.\\./../"), [ // the `new_common_dir` is not normalized by this function
 * 	"file:///./.\\HELLO.\\./..///World/Users/This/Is/An/Example/Bla.cs",
 * 	"file:///./.\\HELLO.\\./../World Users/This/Is/An/example/bla.cs",
 * 	"file:///./.\\HELLO.\\./../World-Users/This/Is/Not/An/Example/",
 * ])
 * ```
*/
export declare const commonPathReplace: (paths: string[], new_common_dir: string) => string[];
/** the file path info data parsed by {@link parseFilepath}.
 *
 * example: if we have a file path `"D:/Hello\\World\\temp/.././dist for web/file.tar.gz"`, then the following will be its parsed components:
 * - `path = "D:/Hello/World/dist for web/file.tar.gz"` - the normalized full path.
 * - `dirpath = "D:/Hello/World/dist for web/"` - the normalized full path of the directory in which the file resides in. always has a trailing slash ("/").
 * - `dirname = "dist for web"` - the name of the directory in which the file exists, without any leading or trailing slashes ("/").
 * - `filename = "file.tar.gz"` - the name of the file, without any leading slashes ("/"), and cannot possibly have a trailing slash without being parsed as a directory instead of a file.
 * - `basename = "file.tar"` - the `filename`, but with the final extension portion removed.
 * - `extname = ".gz"` - the final extension portion of the `filename`.
*/
export interface FilepathInfo {
    path: string;
    dirpath: string;
    dirname: string;
    filename: string;
    basename: string;
    extname: string;
}
/** parses the provided file path and breaks it down into useful bit described by the interface {@link FilepathInfo}.
 * note that a file path must never end in a trailing slash ("/"), and conversely,
 * a folder path must always in a trailing slash ("/"), otherwise it will be parsed as a file.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = parseFilepathInfo
 *
 * eq(fn("/home\\user/docs"), {
 * 	path: "/home/user/docs",
 * 	dirpath: "/home/user/",
 * 	dirname: "user",
 * 	filename: "docs",
 * 	basename: "docs",
 * 	extname: "",
 * })
 * eq(fn("home\\user/docs/"), {
 * 	path: "home/user/docs/",
 * 	dirpath: "home/user/docs/",
 * 	dirname: "docs",
 * 	filename: "",
 * 	basename: "",
 * 	extname: "",
 * })
 * eq(fn("/home/xyz/.././././user/.bashrc."), {
 * 	path: "/home/user/.bashrc.",
 * 	dirpath: "/home/user/",
 * 	dirname: "user",
 * 	filename: ".bashrc.",
 * 	basename: ".bashrc.",
 * 	extname: "",
 * })
 * eq(fn("C:\\home\\user/.file.tar.gz"), {
 * 	path: "C:/home/user/.file.tar.gz",
 * 	dirpath: "C:/home/user/",
 * 	dirname: "user",
 * 	filename: ".file.tar.gz",
 * 	basename: ".file.tar",
 * 	extname: ".gz",
 * })
 * eq(fn("/home/user///file.txt"), {
 * 	path: "/home/user///file.txt",
 * 	dirpath: "/home/user///",
 * 	dirname: "", // this is because the there is no name attached between the last two slashes of the `dirpath = "/home/user///"`
 * 	filename: "file.txt",
 * 	basename: "file",
 * 	extname: ".txt",
 * })
 * ```
*/
export declare const parseFilepathInfo: (file_path: string) => FilepathInfo;
/** find the path `to_path`, relative to `from_path`.
 *
 * TODO: the claim below is wrong, because `joinSlash` cannot do "./" traversal correctly. for instance `joinSlash("a/b/c.txt", "./") === "a/b/c.txt/"`, but you'd expect it to be `"a/b/"` if we had correctly resolved the path.
 *       which is why the output from this function will not work with `joinSlash`, but it will work with {@link resolveAsUrl} or `URL.parse` (when you provide `from_path` as the base path, and `from_path` is NOT a relative path, otherwise the `URL` constructor will fail).
 *
 * ~~if we call the result `rel_path`, then {@link joinSlash | joining} the `from_path` with `rel_path` and normalizing it should give you back `to_path`.~~
 *
 * note that both `from_path` and `to_path` must have a common root folder in their path strings.
 * for instance, if both paths begin with a relative segment `"./"`, then it will be assumed that both paths are referring to the same common root ancestral directory.
 * however, if for instance, `from_path` begins with a `"C:/"` segment, while `to_path` begins with either `"./"` or `"D:/"` or `http://` segment, then this function will fail,
 * as it will not be possible for it to navigate/transcend from one point of reference to a completely different point of reference.
 *
 * so, to be safe, wherever you are certain that both paths are of a certain common type:
 * before passing them here, you should either apply the {@link ensureStartDotSlash} function for relative paths, or apply the {@link ensureStartSlash} for absolute local paths,
 * or write a custom "ensure" function for your situation. (for example, you could write an "ensureHttp" function that ensures that your path begins with `"http"`).
 *
 * @throws `Error` an error will be thrown if there isn't any common ancestral directory between the two provided paths.
 *
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, err = assertThrows, fn = relativePath
 *
 * eq(fn(
 * 	"././hello/world/a/b/c/d/g/../e.txt",
 * 	"././hello/world/a/b/x/y/w/../z/",
 * ), "../../x/y/z/")
 * eq(fn(
 * 	"././hello/world/a/b/c/d/g/../e.txt",
 * 	"././hello/world/a/b/x/y/w/../z/e.md",
 * ), "../../x/y/z/e.md")
 * eq(fn(
 * 	".\\./hello\\world\\a/b\\c/d/g/../",
 * 	"././hello/world/a/b/x/y/w/../z/e.md",
 * ), "../../x/y/z/e.md")
 * eq(fn(
 * 	"././hello/world/a/b/c/d/",
 * 	"././hello/world/a/b/x/y/w/../z/e.md",
 * ), "../../x/y/z/e.md")
 * eq(fn(
 * 	"././hello/world/a/b/c/d/g/../",
 * 	"././hello/world/a/b/x/y/w/../z/e.md",
 * ), "../../x/y/z/e.md")
 * eq(fn(
 * 	"././hello/world/a/b/c/d/",
 * 	"././hello/world/a/b/x/y/w/../z/",
 * ), "../../x/y/z/")
 * eq(fn(
 * 	"./././e.txt",
 * 	"./e.md",
 * ), "./e.md")
 * eq(fn(
 * 	"/e.txt",
 * 	"/e.md",
 * ), "./e.md")
 * eq(fn(
 * 	"C:/e.txt",
 * 	"C:/e.md",
 * ), "./e.md")
 * eq(fn(
 * 	"././hello/world/a/b/c/d/g/../e.txt",
 * 	"././hello/world/a/k/../b/q/../c/d/e.md",
 * ), "./e.md")
 * eq(fn(
 * 	"./",
 * 	"./",
 * ), "./")
 * eq(fn(
 * 	"/",
 * 	"/",
 * ), "./")
 *
 * // there is no common ancestral root between the two paths (since one is absolute, while the other is relative)
 * err(() => fn(
 * 	"/e.txt",
 * 	"./e.md",
 * ))
 * // there is no common ancestral root between the two paths
 * err(() => fn(
 * 	"C:/e.txt",
 * 	"D:/e.md",
 * ))
 * // there is no common ancestral root between the two paths
 * err(() => fn(
 * 	"http://e.txt",
 * 	"./e.md",
 * ))
 * // there is no common ancestral root between the two paths
 * err(() => fn(
 * 	"file:///C:/e.txt",
 * 	"C:/e.md",
 * ))
 * ```
*/
export declare const relativePath: (from_path: string, to_path: string) => string;
/** joins multiple posix path segments into a single normalized path,
 * correctly handling files and directories differently when the `"./"` and `"../"` navigation commands are encountered.
 *
 * > [!note]
 * > the `joinPosixPaths` function differs from `joinSlash` in that it treats segments without a trailing slash as files by default.
 * > furthermore, `joinPosixPaths` is much more quicker to compute, as opposed to `joinSlash`, which uses some complex regex on each segment.
 * > the only reason you might realistically want to use `joinSlash` is when you desire an non-normalized output.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = joinPosixPaths
 *
 * eq(fn("a", "b", "c.zip"),                      "a/b/c.zip")
 * eq(fn("a", "b", "c/"),                         "a/b/c/")
 * eq(fn("a/", "b/", "c/"),                       "a/b/c/")
 * eq(fn("a", "b", "c.zip", "./"),                "a/b/")
 * eq(fn("a", "b", "c/", "./"),                   "a/b/c/")
 * eq(fn("a", "b", "c", "../"),                   "a/")
 * eq(fn("a", "b", "c/d.txt", "./e.txt"),         "a/b/c/e.txt")
 * eq(fn("a", "b", "c/d.txt", "../e.txt"),        "a/b/e.txt")
 * eq(fn("a/b", "c/d.txt", "..", "e.txt"),        "a/b/e.txt") // notice that you can use "." instead of "./"
 * eq(fn("a/", "b/", "c/", "../", "./","d.txt"),  "a/b/d.txt")
 * eq(fn("a/b", "c/", "..", ".","d.txt"),         "a/b/d.txt") // notice that you can use ".." instead of "../"
 * eq(fn("a/b", "c/", ".d.txt"),                  "a/b/c/.d.txt")
 * eq(fn("a/b", "c/", "..d.txt"),                 "a/b/c/..d.txt")
 * eq(fn("a/b", "c/", ".d"),                      "a/b/c/.d")
 * eq(fn("a/b", "c/", ".d."),                     "a/b/c/.d.")
 * eq(fn("a/b", "c/", "..d"),                     "a/b/c/..d")
 * eq(fn("a/b", "c/", "..d."),                    "a/b/c/..d.")
 * eq(fn("a/b", "c/", "..d.."),                   "a/b/c/..d..")
 * eq(fn("a/b", "c/", "..d.", "e.txt"),           "a/b/c/..d./e.txt")
 * eq(fn("a/b", "c/", "..d..", "e.txt"),          "a/b/c/..d../e.txt")
 * eq(fn("./a", "./b", "./c"),                    "./c")
 * eq(fn("./a", "/b", "/c"),                      "./a//b//c")
 * eq(fn("./a/", "/b/", "/c"),                    "./a//b//c")
 * eq(fn("/a", "b.zip", "./c.zip"),               "/a/c.zip")
 * eq(fn("/a", "b.zip", "./c.zip/", "../d.txt"),  "/a/d.txt")
 * eq(fn("/a", "b.zip/", "./c.txt"),              "/a/b.zip/c.txt")
 * eq(fn("/a", "b.zip/", "./c.txt/", "../d.txt"), "/a/b.zip/d.txt")
 * eq(fn("file:", "//", "a/b/c", "./d"),          "file:///a/b/d")
 * eq(fn("file:///", "a/b/c", "./d"),             "file:///a/b/d")
 * ```
*/
export declare const joinPosixPaths: (...segments: string[]) => string;
/** joins multiple path segments into a single normalized posix path,
 * correctly handling files and directories differently when the `"./"` and `"../"` navigation commands are encountered.
 *
 * for lots of other (posix-only) test cases, see the doc comments of {@link joinPosixPaths}.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = joinPaths
 *
 * eq(fn("C:\\", "a", "b", "c.zip"),              "C:/a/b/c.zip")
 * eq(fn("a", "b", "c.zip"),                      "a/b/c.zip")
 * eq(fn("/a\\b\\", "c/"),                        "/a/b/c/")
 * eq(fn("a", "b", "c.zip", "./"),                "a/b/")
 * eq(fn("a", "b", "c.zip", "../"),               "a/")
 * eq(fn("a", "b", "c.zip", "./d.txt"),           "a/b/d.txt")
 * eq(fn("a", "b", "c.zip", "../d.txt"),          "a/d.txt")
 * eq(fn("a/b/c/", "..", "./", "d.txt"),          "a/b/d.txt")
 * eq(fn("a/b/c/", "../", ".", "d.txt"),          "a/b/d.txt")
 * eq(fn("a/b/c", "../", "./", "d.txt"),          "a/d.txt")
 * eq(fn("file:", "\\\\", "a/b/c", "./d"),        "file:///a/b/d")
 * eq(fn("file://\\", "a/b/c", "./d/"),           "file:///a/b/d/")
 * ```
*/
export declare const joinPaths: (...segments: string[]) => string;
//# sourceMappingURL=pathman.d.ts.map