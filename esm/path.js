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
import { object_entries } from "./builtin_aliases_deps.js";
import { DEBUG } from "./deps.js";
const uri_protocol_and_scheme_mapping = object_entries({
    "npm:": "npm",
    "jsr:": "jsr",
    "data:": "data",
    "http://": "http",
    "https://": "https",
    "file://": "file",
    "./": "relative",
    "../": "relative",
});
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
export const resolveAsUrl = (path, base) => {
    let base_url = base;
    if (typeof base === "string") {
        const base_scheme = getUriScheme(base);
        switch (base_scheme) {
            case "relative":
            case "data": {
                throw new Error(DEBUG.ERROR ? ("the following base scheme (url-protocol) is not supported: " + base_scheme) : "");
            }
            default: {
                base_url = resolveAsUrl(base);
                break;
            }
        }
    }
    const path_scheme = getUriScheme(path);
    if (path_scheme === "local") {
        return new URL("file://" + path);
    }
    else if (path_scheme === "relative") {
        const base_protocol = base_url ? base_url.protocol : undefined, base_is_jsr_or_npm = base_protocol === "jsr:" || base_protocol === "npm:";
        // if the base protocol's scheme is either "jsr" or "npm", then we're going to encounter an issue with the `URL` constructor, since it
        // does not permit a uri scheme that is not followed immediately by one or more forward-slashes.
        // in other words, `new URL("./file.txt", "npm:path/to/")` will error, but `new URL("./file.txt", "npm:/path/to/")` will not.
        // which is why we temporarily mutate the `base_url` to include one forward-slashes ("/") after the colon (":"), before removing it later on.
        // moreover, we also add a trailing slash if there isn't one, so that name of the library is not purged when joining the relative `path` with the `base_url`
        if (base_is_jsr_or_npm) {
            const suffix = base_url.pathname.endsWith("/") ? "" : "/";
            base_url = new URL(base_protocol + "/" + base_url.pathname + suffix);
        }
        const path_url = new URL(path, base_url);
        return base_is_jsr_or_npm
            ? new URL(base_protocol + path_url.pathname.substring(1)) // here, we remove the leading forward-slash in the pathname that was previously added.
            : path_url;
    }
    return new URL(path);
};
/** surround a string with double quotation. */
export const quote = (str) => ("\"" + str + "\"");
const windows_directory_slash_regex = /\\+/g, leading_slashes_regex = /^\/+/, trailing_slashes_regex = /\/+$/, leading_slashes_and_dot_slashes_regex = /^(\.?\/)+/;
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
    return str.startsWith("/") ? str : "/" + str;
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
    return str.endsWith("/") ? str : str + "/";
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
        .reduce((output, subpath) => (output + "/" + subpath), ""));
};
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
export const reducePath = (path) => {
    const segments = path.split("/"), output_segments = [".."];
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
    return output_segments.join("/");
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
export const pathToUnixPath = (path) => path.replaceAll(windows_directory_slash_regex, "/");
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
