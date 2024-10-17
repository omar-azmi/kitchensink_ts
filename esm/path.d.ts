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
 * assertEquals(getUriScheme("jsr:/@user/path/to/file"), "jsr")
 * assertEquals(getUriScheme("npm:lib/path/to/file"), "npm")
 * assertEquals(getUriScheme("npm:/lib/path/to/file"), "npm")
 * assertEquals(getUriScheme("npm:/@scope/lib/path/to/file"), "npm")
 * assertEquals(getUriScheme("data:text/plain;charset=utf-8;base64,aGVsbG8="), "data")
 * assertEquals(getUriScheme("http://google.com/style.css"), "http")
 * assertEquals(getUriScheme("https://google.com/style.css"), "https")
 * ```
*/
export declare const getUriScheme: (path: string) => UriScheme;
/** a description of a parsed jsr/npm package, that somewhat resembles the properties of regular URL. */
interface PackagePseudoUrl {
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
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * assertEquals(parsePackageUrl("jsr:@scope/package@version/pathname/file.ts"), {
 * 	href: "jsr:/@scope/package@version/pathname/file.ts",
 * 	protocol: "jsr:",
 * 	scope: "scope",
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/pathname/file.ts",
 * 	host: "@scope/package@version",
 * })
 * assertEquals(parsePackageUrl("jsr:package@version/pathname/"), {
 * 	href: "jsr:/package@version/pathname/",
 * 	protocol: "jsr:",
 * 	scope: undefined,
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/pathname/",
 * 	host: "package@version",
 * })
 * assertEquals(parsePackageUrl("npm:///@scope/package@version"), {
 * 	href: "npm:/@scope/package@version/",
 * 	protocol: "npm:",
 * 	scope: "scope",
 * 	pkg: "package",
 * 	version: "version",
 * 	pathname: "/",
 * 	host: "@scope/package@version",
 * })
 * assertEquals(parsePackageUrl("npm:package"), {
 * 	href: "npm:/package/",
 * 	protocol: "npm:",
 * 	scope: undefined,
 * 	pkg: "package",
 * 	version: undefined,
 * 	pathname: "/",
 * 	host: "package",
 * })
 *
 * assertThrows(() => parsePackageUrl("npm:@scope/")) // missing a package name
 * assertThrows(() => parsePackageUrl("npm:@scope//package")) // more than one slash after scope
 * assertThrows(() => parsePackageUrl("pnpm:@scope/package@version")) // only "npm:" and "jsr:" protocols are recognized
 * ```
*/
export declare const parsePackageUrl: (href: string) => PackagePseudoUrl;
/** convert a url string to an actual `URL` object.
 * your input `path` url can use any scheme supported by the {@link getUriScheme} function.
 * and you may also use paths with windows dir-separators ("\\"), as this function implicitly converts them a unix separator ("/").
 *
 * @example
 * ```ts
 * import { assertEquals, assertThrows } from "jsr:@std/assert"
 *
 * assertEquals(resolveAsUrl("~/path/to/file.txt"), new URL("file://~/path/to/file.txt"))
 * assertEquals(resolveAsUrl("C:/Users/me/path/to/file.txt"), new URL("file:///C:/Users/me/path/to/file.txt"))
 * assertEquals(resolveAsUrl("C:\\Users\\me\\path\\to\\file.txt"), new URL("file:///C:/Users/me/path/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "C:/Users\\me\\path/"), new URL("file:///C:/Users/me/path/to/file.txt"))
 * assertEquals(resolveAsUrl("../path/to/file.txt", "C:/Users/me/path/"), new URL("file:///C:/Users/me/path/to/file.txt"))
 *
 * assertEquals(resolveAsUrl("./to/file.txt", "http://cdn.google.com/path/"), new URL("http://cdn.google.com/path/to/file.txt"))
 * assertEquals(resolveAsUrl("../to/file.txt", "https://cdn.google.com/path/"), new URL("https://cdn.google.com/to/file.txt"))
 *
 * assertEquals(resolveAsUrl("npm:react/file.txt"), new URL("npm:/react/file.txt"))
 * assertEquals(resolveAsUrl("npm:@facebook/react"), new URL("npm:/@facebook/react/"))
 * assertEquals(resolveAsUrl("./to/file.txt", "npm:react"), new URL("npm:/react/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "npm:react/"), new URL("npm:/react/to/file.txt"))
 * assertEquals(resolveAsUrl("jsr:@scope/my-lib/file.txt"), new URL("jsr:/@scope/my-lib/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "jsr:///@scope/my-lib"), new URL("jsr:/@scope/my-lib/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "jsr:///@scope/my-lib/assets"), new URL("jsr:/@scope/my-lib/to/file.txt"))
 * assertEquals(resolveAsUrl("./to/file.txt", "jsr:///@scope/my-lib//assets"), new URL("jsr:/@scope/my-lib/to/file.txt"))
 * assertEquals(resolveAsUrl("../to/file.txt", "jsr:/@scope/my-lib///assets/"), new URL("jsr:/@scope/my-lib/to/file.txt"))
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
/** ensure that there is at least one leading dot-slash at the beginning.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(ensureStartDotSlash("helloworld/nyaa.si"), "./helloworld/nyaa.si")
 * assertEquals(ensureStartDotSlash("file:///helloworld/nyaa.si//hello.txt"), "./file:///helloworld/nyaa.si//hello.txt")
 * assertEquals(ensureStartDotSlash(".///../helloworld/nyaa.si/"), ".///../helloworld/nyaa.si/")
 * assertEquals(ensureStartDotSlash("///../helloworld/nyaa.si/"), ".///../helloworld/nyaa.si/")
 * ```
*/
export declare const ensureStartDotSlash: (str: string) => string;
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
 * > [!warning]
 * > it is recommended that you use segments with unix path dir-separators ("/").
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
/** normalize a path by reducing and removing redundant dot-slash ("./" and "../") path navigators from a path.
 * in the output, there will no be leading dot-slashes ("./"), but it is possible to have leading dotdot-slashes ("../") or zero-or-more leading slashes ("/")
 * > [!warning]
 * > you MUST provide a unix path (i.e. use "/" for dir-separator).
 * > there will not be any implicit conversion of windows "\\" dir-separator.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(normalizeUnixPath("../helloworld/./temp/../././/hello.txt"), "../helloworld//hello.txt")
 * assertEquals(normalizeUnixPath("./././hello/world/.././././//file.txt"), "hello///file.txt")
 * assertEquals(normalizeUnixPath("///hello/world/.././././//file.txt"), "///hello///file.txt")
 * assertEquals(normalizeUnixPath("file:///./././hello/world/.././././file.txt"), "file:///hello/file.txt")
 * ```
*/
export declare const normalizeUnixPath: (path: string) => string;
/** normalize a path by reducing and removing redundant dot-slash ("./", "../", ".\\", and "..\\") path navigators from a path.
 * the returned output is always a unix-style path.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(normalizePath("../helloworld/./temp/../././/hello.txt"), "../helloworld//hello.txt")
 * assertEquals(normalizePath("./.\\.\\hello\\world\\.././.\\.///file.txt"), "hello///file.txt")
 * assertEquals(normalizePath("file:///./././hello\\world/..\\././.\\file.txt"), "file:///hello/file.txt")
 * ```
*/
export declare const normalizePath: (path: string) => string;
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
/** find the prefix path directory common to all provided `paths`.
 * > [!warning]
 * > your paths MUST be normalized beforehand, and use unix dir-separators ("/").
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(commonNormalizedUnixPath([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ]), "C:/Hello/")
 * assertEquals(commonNormalizedUnixPath([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ]), "C:/Hello/World/This/")
 * assertEquals(commonNormalizedUnixPath([
 * 	"C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World Users/This/Is/An/example/bla.cs",
 * 	"C:/Hello/World-Users/This/Is/Not/An/Example/",
 * ]), "C:/Hello/")
 * assertEquals(commonNormalizedUnixPath([
 * 	"C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/",
 * 	"C:/Hello/World", // the "World" here segment is not treated as a directory
 * ]), "C:/Hello/")
 * assertEquals(commonNormalizedUnixPath([
 * 	"C:/Hello/World/",
 * 	"/C:/Hello/World/",
 * 	"C:/Hello/World/",
 * ]), "") // no common prefix was identified
 * ```
*/
export declare const commonNormalizedUnixPath: (paths: string[]) => string;
/** find the prefix path directory common to all provided `paths`.
 * your input `paths` do not need to be normalized nor necessarily use unix-style separator "/".
 * under the hood, this function normalizes and converts all paths to unix-style, then applies the {@link commonNormalizedUnixPath} onto them.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(commonPath([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ]), "C:/Hello/")
 * assertEquals(commonPath([
 * 	"C:/Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	"./C:/Hello/World/This/Is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ]), "C:/Hello/World/This/Is/")
 * assertEquals(commonPath([
 * 	"/C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"/C:\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"/C:/./.\\.\\././Hello/World-Users/./././././This/Is/Not/An/Example/",
 * ]), "/C:/Hello/")
 * assertEquals(commonPath([
 * 	"\\C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"/C:\\Hello\\World Users\\This\\Is/An\\example/bla.cs",
 * 	"/C:/Hello/World", // the "World" here segment is not treated as a directory
 * ]), "/C:/Hello/")
 * ```
*/
export declare const commonPath: (paths: string[]) => string;
/** replace the common path among all provided `paths` by transforming it with a custom `map_fn` function.
 * all `paths` are initially normalized and converted into unix-style (so that no "\\" windows separator is prevelent).
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
 * const subpath_map_fn = ([common_dir, subpath]: [string, string]) => (subpath)
 *
 * assertEquals(commonPathTransform([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ], subpath_map_fn), [
 * 	"World/This/Is/An/Example/Bla.cs",
 * 	"World/This/Is/Not/An/Example/",
 * 	"Earth/Bla/Bla/Bla",
 * ])
 * assertEquals(commonPathTransform([
 * 	"C:/Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	"./C:/Hello/World/This/Is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ], subpath_map_fn), [
 * 	"An/Example/Bla.cs",
 * 	"an/example/bla.cs",
 * 	"Not/An/Example/",
 * ])
 * assertEquals(commonPathTransform([
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
 * assertEquals(commonPathReplace([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:\\Hello\\World\\This\\Is\\Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ], "D:/"), [
 * 	"D:/World/This/Is/An/Example/Bla.cs",
 * 	"D:/World/This/Is/Not/An/Example/",
 * 	"D:/Earth/Bla/Bla/Bla",
 * ])
 * assertEquals(commonPathReplace([
 * 	"C:/Hello/World/This/Used/to-be-an/example/../../../Is/An/Example/Bla.cs",
 * 	"./C:/Hello/World/This/Is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ], "D:/temp"), [ // an implicit  forward slash is added.
 * 	"D:/temp/An/Example/Bla.cs",
 * 	"D:/temp/an/example/bla.cs",
 * 	"D:/temp/Not/An/Example/",
 * ])
 * assertEquals(commonPathReplace([
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
export {};
//# sourceMappingURL=path.d.ts.map