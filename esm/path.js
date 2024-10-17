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
import { bind_string_startsWith } from "./binder.js";
import { array_from, object_entries } from "./builtin_aliases_deps.js";
import { DEBUG } from "./deps.js";
import { commonPrefix } from "./stringman.js";
const uri_protocol_and_scheme_mapping = object_entries({
    "npm:": "npm",
    "jsr:": "jsr",
    "data:": "data",
    "http://": "http",
    "https://": "https",
    "file://": "file",
    "./": "relative",
    "../": "relative",
}), 
// unix directory path separator
sep = "/", 
// regex for attaining windows directory path separator ("\\")
windows_directory_slash_regex = /\\+/g, 
// regex for attaining leading consecutive slashes
leading_slashes_regex = /^\/+/, 
// regex for attaining trailing consecutive slashes
trailing_slashes_regex = /\/+$/, 
// regex for attaining leading consecutive slashes and dot-slashes
leading_slashes_and_dot_slashes_regex = /^(\.?\/)+/, 
// an npm or jsr package string parsing regex. see the test cases on regex101 link: "https://regex101.com/r/mX3v1z/1"
package_regex = /^(?<protocol>npm:|jsr:)(\/*(@(?<scope>[^\/\s]+)\/)?(?<pkg>[^@\/\s]+)(@(?<version>[^\/\s]+))?)?(?<pathname>\/.*)?$/;
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
export const getUriScheme = (path) => {
    if (!path || path === "") {
        return undefined;
    }
    const path_startsWith = bind_string_startsWith(path);
    for (const [protocol, scheme] of uri_protocol_and_scheme_mapping) {
        if (path_startsWith(protocol)) {
            return scheme;
        }
    }
    return "local";
};
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
export const parsePackageUrl = (href) => {
    const { protocol, scope: scope_str, pkg, version: version_str, pathname: pathname_str } = package_regex.exec(href)?.groups ?? {};
    if ((protocol === undefined) || (pkg === undefined)) {
        throw new Error(DEBUG.ERROR ? ("invalid package url format was provided: " + href) : "");
    }
    const scope = scope_str ? scope_str : undefined, // turn empty strings into `undefined`
    version = version_str ? version_str : undefined, // turn empty strings into `undefined`
    pathname = pathname_str ? pathname_str : sep, // pathname must always begin with a leading slash, even if it was originally empty
    host = `${scope ? "@" + scope + sep : ""}${pkg}${version ? "@" + version : ""}`;
    return {
        href: `${protocol}/${host}${pathname}`,
        protocol: protocol,
        scope, pkg, version, pathname, host,
    };
};
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
export const resolveAsUrl = (path, base) => {
    path = pathToUnixPath(path);
    let base_url = base;
    if (typeof base === "string") {
        const base_scheme = getUriScheme(base);
        if (base_scheme === "data" || base_scheme === "relative") {
            throw new Error(DEBUG.ERROR ? ("the following base scheme (url-protocol) is not supported: " + base_scheme) : "");
        }
        base_url = resolveAsUrl(base);
    }
    const path_scheme = getUriScheme(path);
    if (path_scheme === "local") {
        return new URL("file://" + path);
    }
    else if (path_scheme === "jsr" || path_scheme === "npm") {
        // if the `path`'s protocol scheme is either "jsr" or "npm", then we're going to it handle slightly differently, since it is possible for it to be non-parsable by the `URL` constructor if there is not trailing slash after the "npm:" or "jsr:" protocol.
        // thus we normalize our `path` by passing it to the `parsePackageUrl` function, and acquiring the normalized `URL` compatible `href` representation of the full `path`.
        return new URL(parsePackageUrl(path).href);
    }
    else if (path_scheme === "relative") {
        const base_protocol = base_url ? base_url.protocol : undefined, base_is_jsr_or_npm = base_protocol === "jsr:" || base_protocol === "npm:";
        if (!base_is_jsr_or_npm) {
            return new URL(path, base_url);
        }
        // if the base protocol's scheme is either "jsr" or "npm", then we're going to handle slightly differently, since it is possible for it to be non-parsable by the `URL` constructor if there is not trailing slash after the "npm:" or "jsr:" protocol.
        // the path joining rules of packages is different from an http url, which supports the domain name as the host. such an equivalent construction cannot be made for jsr or npm package strings.
        const 
        // to start off, we parse the `protocol`, `host` (= scope + package_name + version), and any existing `pathname` of the `base_url` using the `parsePackageUrl` function.
        // note that `pathname` always starts with a leading "/"
        { protocol, host, pathname } = parsePackageUrl(base_url.href), 
        // next, we join the pre-existing `pathname` with the relative `paths`, by exploiting the URL constructor to do the joining part for us, by giving it a fake protocol named "x:".
        full_pathname = (new URL(path, "x:" + pathname)).pathname, 
        // we are now ready to construct our `URL` compatible href for the resolved path. for a shortcut, we'll just assign our computed `href` to `path`, so that it will get transformed into a `URL` in the return statement after this conditional block.
        href = `${protocol}/${host}${full_pathname}`;
        path = href;
    }
    return new URL(path);
};
/** surround a string with double quotation. */
export const quote = (str) => ("\"" + str + "\"");
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
export const trimStartSlashes = (str) => {
    return str.replace(leading_slashes_regex, "");
};
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
export const trimEndSlashes = (str) => {
    return str.replace(trailing_slashes_regex, "");
};
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
export const trimSlashes = (str) => {
    return trimEndSlashes(trimStartSlashes(str));
};
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
export const ensureStartSlash = (str) => {
    return str.startsWith(sep) ? str : sep + str;
};
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
export const ensureStartDotSlash = (str) => {
    return str.startsWith("./")
        ? str
        : str.startsWith(sep)
            ? "." + str
            : "./" + str;
};
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
export const ensureEndSlash = (str) => {
    return str.endsWith(sep) ? str : str + sep;
};
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
export const trimDotSlashes = (str) => {
    return trimEndSlashes(str.replace(leading_slashes_and_dot_slashes_regex, ""));
};
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
export const joinSlash = (...segments) => {
    return trimStartSlashes(segments
        .map(trimDotSlashes)
        .reduce((output, subpath) => (output + sep + subpath), ""));
};
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
export const normalizeUnixPath = (path) => {
    const segments = path.split(sep), output_segments = [".."];
    for (const segment of segments) {
        if (segment === "..") {
            if (output_segments.at(-1) !== "..") {
                output_segments.pop();
            }
            else {
                output_segments.push(segment);
            }
        }
        else if (segment !== ".") {
            output_segments.push(segment);
        }
    }
    output_segments.shift();
    return output_segments.join(sep);
};
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
export const normalizePath = (path) => {
    return normalizeUnixPath(pathToUnixPath(path));
};
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
export const pathToUnixPath = (path) => path.replaceAll(windows_directory_slash_regex, sep);
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
export const pathsToCliArg = (separator, paths) => {
    return quote(pathToUnixPath(paths.join(separator)));
};
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
export const commonNormalizedUnixPath = (paths) => {
    const common_prefix = commonPrefix(paths), common_prefix_length = common_prefix.length;
    for (const path of paths) {
        const remaining_substring = path.substring(common_prefix_length);
        if (!remaining_substring.startsWith(sep)) {
            // it looks like the `path`'s common prefix is not followed by an immediate "/" separator.
            // thus, we must now reduce our `common_prefix` to the last available "/" separator.
            // after we do that, we are guaranteed that this newly created `common_dir_prefix` is indeed common to all `paths`, since its superset, the `common_prefix`, was also common to all `paths`.
            // thus we can immediately return and ignore the remaining tests in the loop.
            const common_dir_prefix_length = common_prefix.lastIndexOf("/") + 1, common_dir_prefix = common_prefix.slice(0, common_dir_prefix_length);
            return common_dir_prefix;
        }
    }
    // if we have made it to here, it would mean that among all paths, the initial `common_prefix` was indeed also the common directory among all of them.
    return common_prefix;
};
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
export const commonPath = (paths) => {
    return commonNormalizedUnixPath(paths.map(normalizePath));
};
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
export const commonPathTransform = (paths, map_fn) => {
    const normal_paths = paths.map(normalizePath), common_dir = commonNormalizedUnixPath(normal_paths), common_dir_length = common_dir.length, path_infos = array_from(normal_paths, (normal_path) => {
        return [common_dir, normal_path.slice(common_dir_length)];
    });
    return path_infos.map(map_fn);
};
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
export const commonPathReplace = (paths, new_common_dir) => {
    new_common_dir = ensureEndSlash(new_common_dir);
    return commonPathTransform(paths, ([common_dir, subpath]) => {
        return new_common_dir + subpath;
    });
};
