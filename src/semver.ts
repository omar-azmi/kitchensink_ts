/** contains a small implementation of semantic-versioning (semver) operations.
 * 
 * ### what is semantic versioning?
 * 
 * below is diagram a breaking down the fields of a semantic version string::
 * 
 * ```txt
 * ┌─────────────────────► major
 * │ ┌───────────────────► minor
 * │ │ ┌─────────────────► patch
 * │ │ │  ┌──────────────► prerelease
 * │ │ │  │      ┌───────► build
 * │ │ │ ┌┴┐ ┌───┴───┐
 * 1.2.3-pre+build-xyz }─► semver
 * ```
 * 
 * @module
*/

import { array_isEmpty, number_isFinite, number_parseInt } from "./alias.ts"
import { isString } from "./struct.ts"

// clean, cmp, coerce, compare, compareBuild, compareCore, compareIdentifiers, compareLoose, diff, eq, gt, gte, inc, incThrow, lt, lte, major, minor, neq, parse, patch, prerelease, rcompare, rsort, sort, valid

/** a semver string is any well typed version string, that does not contain wildcards nor lacks the core version information.
 * 
 * examples:
 * - correct: `"1.2.3"`, `"1.2.3-rc1"`, `"1.2.3-0+build-sha256"`
 * - incorrect: `"1"`, `"1.x"`, `""`, `"x"`
*/
export type SemverString = string

/** a comparator string for semver, such as `">= 5.2.x"`. see {@link SemverComparatorOperator } for all available comparators. */
export type SemverComparatorString = string
export type SemverRangeString = string

/** an interface that describes the constiting parts of a semver.
 * 
 * break down of the fields in an ascii diagram:
 * 
 * ```txt
 * ┌─────────────────────► major
 * │ ┌───────────────────► minor
 * │ │ ┌─────────────────► patch
 * │ │ │  ┌──────────────► prerelease
 * │ │ │  │      ┌───────► build
 * │ │ │ ┌┴┐ ┌───┴───┐
 * 1.2.3-pre+build-xyz }─► semver
 * ```
*/
export interface Semver {
	/** major version number. */
	major: number

	/** minor version number. */
	minor: number

	/** patch version number. */
	patch: number

	/** optional prerelease version string.
	 * 
	 * an empty string implies that no pre-release version annotation exists.
	*/
	prerelease?: string

	/** optional version build information.
	 * 
	 * an empty string implies that no build-information annotation exists.
	*/
	build?: string
}

const
	digits_regex_str = "x|0|[1-9]\\d*",
	semver_core_regex_str = `(?<major>${digits_regex_str})\\.(?<minor>${digits_regex_str})\\.(?<patch>${digits_regex_str})`,
	semver_prerelease_str = `(?<prerelease>[^\\+\\s]*)`,
	semver_build_str = `(?<build>[^\\s]*)`,
	semver_regex = new RegExp(`${semver_core_regex_str}(?:\\-${semver_prerelease_str})?(?:\\+${semver_build_str})?`),
	semver_unclean_prefix = /^\=*v*\s*/i,
	semver_wildcard_regex = /^[xX\\*]$/,
	semver_prerelease_or_build_sep = /\-|\+/,
	digits_regex = new RegExp(`\^${digits_regex_str}\$`),
	semver_core_number_upper_limit = 9999

const number_compare = (n1: number, n2: number): (-1 | 0 | 1) => {
	return n1 > n2 ? 1
		: n1 === n2 ? 0
			: -1
}

const clean_parse = (version: SemverString): (Semver | undefined) => {
	const match = semver_regex.exec(version)
	if (!match) { return undefined }
	const
		{ major = "0", minor = "0", patch = "0", prerelease = "", build = "" } = match.groups as ({ [k in keyof Semver]: string }),
		major_num = number_parseInt(major),
		minor_num = number_parseInt(minor),
		patch_num = number_parseInt(patch)
	return (number_isFinite(major_num) && number_isFinite(minor_num) && number_isFinite(patch_num)) ? {
		major: major_num,
		minor: minor_num,
		patch: patch_num,
		prerelease,
		build,
	} : undefined
}

export const clean = (version: SemverString): string => (version.trim().replace(semver_unclean_prefix, ""))

export const parse = (version: SemverString): (Semver | undefined) => {
	return clean_parse(clean(version))
}

export const compare = (v1: SemverString | Semver, v2: SemverString | Semver): (-1 | 0 | 1) => {
	v1 = isString(v1) ? parse(v1)! : v1
	v2 = isString(v2) ? parse(v2)! : v2
	const
		{ major: v1_major, minor: v1_minor, patch: v1_patch } = v1,
		{ major: v2_major, minor: v2_minor, patch: v2_patch } = v2
	if (v1_major !== v2_major) { return number_compare(v1_major, v2_major) }
	if (v1_minor !== v2_minor) { return number_compare(v1_minor, v2_minor) }
	return number_compare(v1_patch, v2_patch)
}

/** this function converts versions with various forms of wildcards ("x", "X", "*"),
 * or missing segments, into a normalized `"1.x.x"` representation.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const
 * 	fn = normalizeX,
 * 	eq = assertEquals
 * 
 * eq(fn("1.x"),                 "1.x.x")
 * eq(fn("*"),                   "x.x.x")
 * eq(fn(""),                    "x.x.x")
 * eq(fn("2.3"),                 "2.3.x")
 * eq(fn("X.2.3"),               "x.2.3")
 * eq(fn("1.*.3-rc1+build.xyz"), "1.x.3-rc1+build.xyz")
 * eq(fn("1-rc1+build.xyz"),     "1.x.x-rc1+build.xyz")
 * eq(fn("2.*.3-rc1"),           "2.x.3-rc1")
 * eq(fn("3+build.xyz"),         "3.x.x+build.xyz")
 * ```
*/
export const normalizeX = (version: string): SemverString => {
	// split version by dots. if any part is missing or is a wildcard, set it to "x".
	const
		wildcard_char = "x",
		release_and_build_info_idx = version.search(semver_prerelease_or_build_sep),
		release_and_build_info_sep = release_and_build_info_idx >= 0 ? version[release_and_build_info_idx] : "-",
		[core_version = "", release_and_build_info = ""] = version.split(release_and_build_info_sep, 2) as (string | undefined)[],
		segments = core_version.split(".").toReversed(),
		normalized_segments: string[] = []
	let segment_is_illegible = array_isEmpty(segments)
	for (let i = 0; i < 3; i++) {
		const
			segment = segments.pop() || wildcard_char,
			segment_normalized = semver_wildcard_regex.test(segment) ? wildcard_char : segment!
		segment_is_illegible ||= !digits_regex.test(segment_normalized)
		normalized_segments.push(segment_is_illegible ? wildcard_char : segment_normalized)
	}
	return normalized_segments.join(".") + (release_and_build_info ? (release_and_build_info_sep + release_and_build_info) : "")
}

/** this function converts versions with various forms of wildcards ("x", "X", "*"),
 * or missing segments, into a normalized numeric representation.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * // aliasing our functions for brevity
 * const
 * 	fn = normalize,
 * 	eq = assertEquals
 * 
 * eq(fn("1.x"),                 "1.0.0")
 * eq(fn("*"),                   "0.0.0")
 * eq(fn(""),                    "0.0.0")
 * eq(fn("2.3", true),           "2.3.9999")
 * eq(fn("X.2.3", true),         "9999.2.3")
 * eq(fn("1.*.3-rc1+build.xyz"), "1.0.3-rc1+build.xyz")
 * eq(fn("1-rc1+build.xyz"),     "1.0.0-rc1+build.xyz")
 * eq(fn("x+build.xyz", true),   "9999.9999.9999+build.xyz")
 * eq(fn("2+build.abc"),         "2.0.0+build.abc")
 * ```
*/
export const normalize = (version: string, is_upper: boolean = false): SemverString => {
	version = normalizeX(version)
	const
		wildcard_char = "x",
		wildcard_value = is_upper ? semver_core_number_upper_limit : 0,
		release_and_build_info_idx = version.search(semver_prerelease_or_build_sep),
		release_and_build_info_sep = release_and_build_info_idx >= 0 ? version[release_and_build_info_idx] : "-",
		[core_version = "", release_and_build_info = ""] = version.split(release_and_build_info_sep, 2) as (string | undefined)[],
		[major_part, minor_part, patch_part] = core_version.split(".") as string[],
		major = major_part !== wildcard_char ? number_parseInt(major_part) : wildcard_value,
		minor = minor_part !== wildcard_char ? number_parseInt(minor_part) : wildcard_value,
		patch = patch_part !== wildcard_char ? number_parseInt(patch_part) : wildcard_value
	return `${major}.${minor}.${patch}` + (release_and_build_info ? (release_and_build_info_sep + release_and_build_info) : "")
}
