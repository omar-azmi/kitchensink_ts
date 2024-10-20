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

import { bind_string_startsWith } from "./binder.ts"
import { array_from, object_entries } from "./builtin_aliases_deps.ts"
import { DEBUG } from "./deps.ts"
import { commonPrefix, quote } from "./stringman.ts"
import { isObject } from "./struct.ts"


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
export type UriScheme =
	| undefined
	| "local"
	| "relative"
	| "file"
	| "http"
	| "https"
	| "data"
	| "jsr"
	| "npm"

const
	uri_protocol_and_scheme_mapping: Array<[protocol: string, scheme: UriScheme]> = object_entries({
		"npm:": "npm",
		"jsr:": "jsr",
		"data:": "data",
		"http://": "http",
		"https://": "https",
		"file://": "file",
		"./": "relative",
		"../": "relative",
	}),
	// posix directory path separator
	sep = "/",
	// regex for attaining windows directory path separator ("\\")
	windows_directory_slash_regex = /\\+/g,
	// regex for attaining leading consecutive slashes
	leading_slashes_regex = /^\/+/,
	// regex for attaining trailing consecutive slashes, except for those that are preceded by a dotslash ("/./") or a dotdotslash ("/../")
	trailing_slashes_regex = /(?<!\/\.\.?)\/+$/,
	// regex for attaining leading consecutive slashes and dot-slashes
	leading_slashes_and_dot_slashes_regex = /^(\.?\/)+/,
	// regex for attaining a reversed path string's trailing consecutive slashes and dot-slashes, but not the slashes preceded by a dotdotslash ("/..").
	// this regex is a little complex, so you might want to check out the test cases (of reversed path strings) here: "https://regex101.com/r/IV0twv/1"
	reversed_trailing_slashes_and_dot_slashes_regex = /^(\/\.?(?![^\/]))*(\/(?!\.\.\/))?/,
	// regex for attaining the file name of a path, including its leading slash (if there is one)
	filename_regex = /\/?[^\/]+$/,
	// regex for attaining the base name and extension name of a file, from its filename (no directories)
	basename_and_extname_regex = /^(?<basename>.+?)(?<ext>\.[^\.]+)?$/,
	// an npm or jsr package string parsing regex. see the test cases on regex101 link: "https://regex101.com/r/mX3v1z/1"
	package_regex = /^(?<protocol>npm:|jsr:)(\/*(@(?<scope>[^\/\s]+)\/)?(?<pkg>[^@\/\s]+)(@(?<version>[^\/\s]+))?)?(?<pathname>\/.*)?$/

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
export const getUriScheme = (path: string): UriScheme => {
	if (!path || path === "") { return undefined }
	const path_startsWith = bind_string_startsWith(path)
	for (const [protocol, scheme] of uri_protocol_and_scheme_mapping) {
		if (path_startsWith(protocol)) { return scheme }
	}
	return "local"
}

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
	href: string
	| `${"npm" | "jsr"}:/${PackagePseudoUrl["host"]}${PackagePseudoUrl["pathname"]}`

	protocol: "npm:" | "jsr:"

	/** optional scope name. */
	scope?: string

	/** name of the package. the reason why we call it "pkg" instead of "package" is because "package" is a reserved word in javascript. */
	pkg: string

	/** optional version string of the package. */
	version?: string

	/** the pathname of the subpath that is being accessed within the package.
	 * this will always begin with a leading slash ("/"), even if there is no subpath being accessed.
	*/
	pathname: string

	/** the host contains the full information about the package's string.
	 * that is, it has the optional scope information, the package name information, and the optional version information.
	*/
	host: string
	| `${PackagePseudoUrl["pkg"]}`
	| `${PackagePseudoUrl["pkg"]}@${PackagePseudoUrl["version"]}`
	| `@${PackagePseudoUrl["scope"]}/${PackagePseudoUrl["pkg"]}`
	| `@${PackagePseudoUrl["scope"]}/${PackagePseudoUrl["pkg"]}@${PackagePseudoUrl["version"]}`
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
export const parsePackageUrl = (url_href: string | URL): PackagePseudoUrl => {
	url_href = typeof url_href === "string" ? url_href : url_href.href
	const { protocol, scope: scope_str, pkg, version: version_str, pathname: pathname_str } = package_regex.exec(url_href)?.groups ?? {}
	if ((protocol === undefined) || (pkg === undefined)) { throw new Error(DEBUG.ERROR ? ("invalid package url format was provided: " + url_href) : "") }
	const
		scope = scope_str ? scope_str : undefined, // turn empty strings into `undefined`
		version = version_str ? version_str : undefined, // turn empty strings into `undefined`
		pathname = pathname_str ? pathname_str : sep, // pathname must always begin with a leading slash, even if it was originally empty
		host = `${scope ? "@" + scope + sep : ""}${pkg}${version ? "@" + version : ""}`
	return {
		href: `${protocol}/${host}${pathname}`,
		protocol: protocol as PackagePseudoUrl["protocol"],
		scope, pkg, version, pathname, host,
	}
}

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
export const resolveAsUrl = (path: string, base?: string | URL | undefined): URL => {
	path = pathToPosixPath(path)
	let base_url = base as URL | undefined
	if (typeof base === "string") {
		const base_scheme = getUriScheme(base)
		if (base_scheme === "data" || base_scheme === "relative") {
			throw new Error(DEBUG.ERROR ? ("the following base scheme (url-protocol) is not supported: " + base_scheme) : "")
		}
		base_url = resolveAsUrl(base)
	}
	const path_scheme = getUriScheme(path)
	if (path_scheme === "local") { return new URL("file://" + path) }
	else if (path_scheme === "jsr" || path_scheme === "npm") {
		// if the `path`'s protocol scheme is either "jsr" or "npm", then we're going to it handle slightly differently, since it is possible for it to be non-parsable by the `URL` constructor if there is not trailing slash after the "npm:" or "jsr:" protocol.
		// thus we normalize our `path` by passing it to the `parsePackageUrl` function, and acquiring the normalized `URL` compatible `href` representation of the full `path`.
		return new URL(parsePackageUrl(path).href)
	}
	else if (path_scheme === "relative") {
		const
			base_protocol = base_url ? base_url.protocol : undefined,
			base_is_jsr_or_npm = base_protocol === "jsr:" || base_protocol === "npm:"
		if (!base_is_jsr_or_npm) { return new URL(path, base_url) }
		// if the base protocol's scheme is either "jsr" or "npm", then we're going to handle slightly differently, since it is possible for it to be non-parsable by the `URL` constructor if there is not trailing slash after the "npm:" or "jsr:" protocol.
		// the path joining rules of packages is different from an http url, which supports the domain name as the host. such an equivalent construction cannot be made for jsr or npm package strings.
		const
			// to start off, we parse the `protocol`, `host` (= scope + package_name + version), and any existing `pathname` of the `base_url` using the `parsePackageUrl` function.
			// note that `pathname` always starts with a leading "/"
			{ protocol, host, pathname } = parsePackageUrl(base_url!),
			// next, we join the pre-existing `pathname` with the relative `paths`, by exploiting the URL constructor to do the joining part for us, by giving it a fake protocol named "x:".
			full_pathname = (new URL(path, "x:" + pathname)).pathname,
			// we are now ready to construct our `URL` compatible href for the resolved path. for a shortcut, we'll just assign our computed `href` to `path`, so that it will get transformed into a `URL` in the return statement after this conditional block.
			href = `${protocol}/${host}${full_pathname}`
		path = href
	}
	return new URL(path)
}

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
export const trimStartSlashes = (str: string): string => {
	return str.replace(leading_slashes_regex, "")
}

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
export const trimEndSlashes = (str: string): string => {
	return str.replace(trailing_slashes_regex, "")
}

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
export const trimSlashes = (str: string): string => {
	return trimEndSlashes(trimStartSlashes(str))
}

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
export const ensureStartSlash = (str: string): string => {
	return str.startsWith(sep) ? str : sep + str
}

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
export const ensureStartDotSlash = (str: string): string => {
	return str.startsWith("./")
		? str
		: str.startsWith(sep)
			? "." + str
			: "./" + str
}

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
export const ensureEndSlash = (str: string): string => {
	return str.endsWith(sep) ? str : str + sep
}

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
export const trimStartDotSlashes = (str: string): string => {
	return str.replace(leading_slashes_and_dot_slashes_regex, "")
}

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
export const trimEndDotSlashes = (str: string): string => {
	const
		reversed_str = [...str].toReversed().join(""),
		trimmed_reversed_str = reversed_str.replace(reversed_trailing_slashes_and_dot_slashes_regex, "")
	// there is a special case when the entirety of the original `str` is made up of only (dot)slashes and ends with one dotslashes "./" (trailing relative path navigation),
	// in which case, we will be left with one single "." as our `trimmed_reversed_str`, instead of an empty string.
	// so we handle this special case below, otherwise we process all other `trimmed_reversed_str` by reversing it once more.
	return trimmed_reversed_str === "."
		? ""
		: [...trimmed_reversed_str].toReversed().join("")
}

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
export const trimDotSlashes = (str: string): string => {
	return trimEndDotSlashes(trimStartDotSlashes(str))
}

/** join path segments with forward-slashes in between, and remove redundant slashes ("/") and dotslashes ("./") around each segment (if any).
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
export const joinSlash = (first_segment: string = "", ...segments: string[]): string => {
	return segments
		.map(trimDotSlashes)
		.reduce(
			(output, subpath) => ((output === "" ? "" : ensureEndSlash(output)) + subpath),
			first_segment,
		)
}

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
	keepRelative?: boolean
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
export const normalizePosixPath = (path: string, config: NormalizePathConfig | number = {}): string => {
	const
		{ keepRelative = true } = isObject(config) ? config : {},
		segments = path.split(sep),
		output_segments: string[] = [".."],
		prepend_relative_dotslash_to_output_segments = keepRelative && segments[0] === "."

	for (const segment of segments) {
		if (segment === "..") {
			if (output_segments.at(-1) !== "..") { output_segments.pop() }
			else { output_segments.push(segment) }
		} else if (segment !== ".") {
			output_segments.push(segment)
		}
	}

	output_segments.shift()
	if (prepend_relative_dotslash_to_output_segments && output_segments[0] !== "..") {
		output_segments.unshift(".")
	}
	return output_segments.join(sep)
}

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
export const normalizePath = (path: string, config?: NormalizePathConfig | number): string => {
	return normalizePosixPath(pathToPosixPath(path), config)
}

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
export const pathToPosixPath = (path: string): string => path.replaceAll(windows_directory_slash_regex, sep)

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
export const pathsToCliArg = (separator: ";" | ":", paths: string[]): string => {
	return quote(pathToPosixPath(paths.join(separator)))
}

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
export const commonNormalizedPosixPath = (paths: string[]): string => {
	const
		common_prefix = commonPrefix(paths),
		common_prefix_length = common_prefix.length
	for (const path of paths) {
		const remaining_substring = path.substring(common_prefix_length)
		if (!remaining_substring.startsWith(sep)) {
			// it looks like the `path`'s common prefix is not followed by an immediate "/" separator.
			// thus, we must now reduce our `common_prefix` to the last available "/" separator.
			// after we do that, we are guaranteed that this newly created `common_dir_prefix` is indeed common to all `paths`, since its superset, the `common_prefix`, was also common to all `paths`.
			// thus we can immediately return and ignore the remaining tests in the loop.
			const
				common_dir_prefix_length = common_prefix.lastIndexOf(sep) + 1,
				common_dir_prefix = common_prefix.slice(0, common_dir_prefix_length)
			return common_dir_prefix
		}
	}
	// if we have made it to here, it would mean that among all paths, the initial `common_prefix` was indeed also the common directory among all of them.
	return common_prefix
}

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
export const commonPath = (paths: string[]): string => {
	return commonNormalizedPosixPath(paths.map(normalizePath))
}

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
export const commonPathTransform = <T = string, PathInfo extends [common_dir: string, subpath: string] = [common_dir: string, subpath: string]>(
	paths: string[],
	map_fn: ((path_info: PathInfo, index: number, path_infos: Array<PathInfo>) => T)
): T[] => {
	const
		normal_paths = paths.map(normalizePath),
		common_dir = commonNormalizedPosixPath(normal_paths),
		common_dir_length = common_dir.length,
		path_infos = array_from(normal_paths, (normal_path: string): PathInfo => {
			return [common_dir, normal_path.slice(common_dir_length)] as PathInfo
		})
	return path_infos.map(map_fn)
}

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
export const commonPathReplace = (paths: string[], new_common_dir: string): string[] => {
	new_common_dir = ensureEndSlash(new_common_dir)
	return commonPathTransform(paths, ([common_dir, subpath]): string => {
		// if there is no common dir among the `paths` (i.e. `common_dir = ""`), then it is possible for
		// some `subpath`s to contain a leading dotslash ("./"), in which case we must trim it before concatenation
		subpath = (subpath.startsWith("./") ? subpath.slice(2) : subpath)
		return new_common_dir + subpath
	})
}

/** get the file name from a given normalized posix path.
 * if the provided path ends with a trailing slash ("/"), then an empty string will be returned, emphasizing the lack of a file name.
 * 
 * @example
 * ```ts  ignore
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = parseNormalizedPosixFilename
 * 
 * eq(fn("/home/user/docs"),     "docs")
 * eq(fn("/home/user/docs.md"),  "docs.md")
 * eq(fn("/home/user/.bashrc"),  ".bashrc")
 * eq(fn("var/log.txt"),         "log.txt")
 * eq(fn("log"),                 "log")
 * eq(fn("C:/a/b/c/etc"),        "etc")
 * 
 * eq(fn("/home/user/.config/"), "")
 * eq(fn("var/log/"),            "")
 * eq(fn("C:/a/b/c/etc/"),       "")
 * eq(fn(""),                    "")
 * eq(fn("/"),                   "")
 * eq(fn("///"),                 "")
 * ```
*/
const parseNormalizedPosixFilename = (file_path: string) => {
	return trimStartSlashes(filename_regex.exec(file_path)?.[0] ?? "")
}

/** get the base name and extension name of a file, from its filename (no directories).
 * 
 * @example
 * ```ts ignore
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const eq = assertEquals, fn = parseBasenameAndExtname_FromFilename
 * 
 * eq(fn("docs"),           ["docs", ""])
 * eq(fn("docs."),          ["docs.", ""])
 * eq(fn("docs.md"),        ["docs", ".md"])
 * eq(fn(".bashrc"),        [".bashrc", ""])
 * eq(fn("my file.tar.gz"), ["my file.tar", ".gz"])
 * eq(fn(""),               ["", ""])
 * eq(fn("."),              [".", ""])
 * eq(fn(".."),             ["..", ""])
 * eq(fn("...hello"),       ["..", ".hello"])
 * ```
*/
const parseBasenameAndExtname_FromFilename = (filename: string): [basename: string, extname: string] => {
	const { basename = "", ext = "" } = basename_and_extname_regex.exec(filename)?.groups ?? {}
	return [basename, ext]
}

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
	path: string
	dirpath: string
	dirname: string
	filename: string
	basename: string
	extname: string
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
export const parseFilepathInfo = (file_path: string): FilepathInfo => {
	const
		path = normalizePath(file_path),
		filename = parseNormalizedPosixFilename(path),
		filename_length = filename.length,
		dirpath = filename_length > 0 ? path.slice(0, - filename_length) : path,
		// below, I am purposely using `slice` instead of doing `trimEndSlashes(dirpath)`, because it is possible that two or more consecutive slashes "/" were intentionally placed in the directory separator. 
		dirname = parseNormalizedPosixFilename(dirpath.slice(0, -1)),
		[basename, extname] = parseBasenameAndExtname_FromFilename(filename)
	return { path, dirpath, dirname, filename, basename, extname, }
}

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
export const relativePath = (from_path: string, to_path: string) => {
	const [
		[common_dir, from_subpath],
		[, to_subpath],
	] = commonPathTransform([from_path, to_path], (common_dir_and_subpath) => common_dir_and_subpath)
	if (common_dir === "") { throw new Error(DEBUG.ERROR ? (`there is no common directory between the two provided paths:\n\t"${from_path}" and\n\t"to_path"`) : "") }
	const upwards_traversal = Array(from_subpath.split(sep).length).fill("..")
	upwards_traversal[0] = "." // we do this because the relative path should always begin with a dotslash ("./")
	return normalizePosixPath(upwards_traversal.join(sep) + sep + to_subpath)
}
