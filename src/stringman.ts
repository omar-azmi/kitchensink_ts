/** utility functions for manipulating, generating, or parsing `string`.
 * 
 * @module
*/

import { bind_string_charCodeAt } from "./binder.ts"
import { array_from, number_parseInt, string_toLowerCase, string_toUpperCase, math_min } from "./builtin_aliases_deps.ts"
import { type ContinuousIntervals, sliceContinuous } from "./typedbuffer.ts"
import type { NumericArray, TypedArray } from "./typedefs.ts"


/** customize the hex-string representation made by {@link hexStringOfArray} using these options <br>
 * the default configuration is:
 * ```ts
 * const default_HexStringRepr = { sep: ", ", prefix: "0x", postfix: "", trailingSep: false, bra: "[", ket: "]", toUpperCase: true, radix: 16, }
 * ```
*/
export interface HexStringRepr {
	/** separator character string between bytes. <br> **defaults to** `", "` */
	sep: string
	/** what string to prefix every hex-string byte with? <br> **defaults to** `"0x"` */
	prefix: string
	/** what string to add to the end of every hex-string byte? <br> **defaults to** `""` (an empty string) */
	postfix: string
	/** do you want to include a trailing {@link sep} after the final byte? <br>
	 * example output when true: `"[0x01, 0x02, 0x03,]"`, <br>
	 * example output when false: `"[0x01, 0x02, 0x03]"`. <br>
	 * **defaults to** `false`
	*/
	trailingSep: boolean
	/** the left bracket string. <br> **defaults to** `"["` */
	bra: string
	/** the right bracket string. <br> **defaults to** `"]"` */
	ket: string
	/** do we want upper case letters for the hex-string? <br> **defaults to** `true` */
	toUpperCase: boolean
	/** provide an alternate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
	 * use `16` for a hex-string, or `2` for binary-string, accepted values must be between `2` and `36` <br>
	 * **defaults to** `16`
	*/
	radix: number
}

const default_HexStringRepr: HexStringRepr = {
	sep: ", ",
	prefix: "0x",
	postfix: "",
	trailingSep: false,
	bra: "[",
	ket: "]",
	toUpperCase: true,
	radix: 16,
}

/** convert an array of integer numbers to hex-string, for the sake of easing representation, or for visual purposes. <br>
 * it's also moderately customizable via `options` using the {@link HexStringRepr} interface. <br>
 * make sure that every element of your array is non-negative and less than `options.radix ** 2`
 * (default `options.radix == 16`, so your numbers must be smaller than `256` on the default config)
*/
export const hexStringOfArray = (arr: NumericArray, options: Partial<HexStringRepr>) => {
	const
		{ sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix, } = { ...default_HexStringRepr, ...options },
		num_arr: number[] = (arr as TypedArray).buffer ? array_from(arr as TypedArray) : arr as number[],
		str = num_arr.map(v => {
			let s = (v | 0).toString(radix)
			s = s.length === 2 ? s : "0" + s
			return toUpperCase ? string_toUpperCase(s) : s
		}).reduce((str, s) => str + prefix + s + postfix + sep, "")
	return bra + str.slice(0, trailingSep ? undefined : - sep.length) + ket
}

/** convert hex-string back to an array of integers, provided that you know the exact {@link HexStringRepr} config of your particular hex-string. */
export const hexStringToArray = (hex_str: string, options: Partial<HexStringRepr>): Array<number> => {
	const { sep, prefix, postfix, bra, ket, radix, } = { ...default_HexStringRepr, ...options },
		[sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep, prefix, postfix, bra, ket].map(s => s.length),
		hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? - ket_len : undefined), // there are no brackets remaining
		elem_len = prefix_len + 2 + postfix_len + sep_len,
		int_arr: number[] = []
	for (let i = prefix_len; i < hex_str2.length; i += elem_len) {
		int_arr.push(number_parseInt(
			hex_str2[i] + hex_str2[i + 1], // these are the two characters representing the current number in hex-string format
			radix
		))
	}
	return int_arr
}

/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export const toUpperOrLowerCase = (str: string, option: 1 | 0 | -1) => option === 1 ? string_toUpperCase(str) : option === -1 ? string_toLowerCase(str) : str

/** find the index of next uppercase character, starting from index `start` and optionally ending at exclusive-index `end` */
export const findNextUpperCase = (str: string, start = 0, end: number | undefined = undefined): number | undefined => {
	end = (end! < str.length ? end! : str.length) - 1
	const str_charCodeAt = bind_string_charCodeAt(str)
	let c: number
	while (c = str_charCodeAt(start++)) {
		if (c > 64 && c < 91) {
			return start - 1
		}
	}
	return undefined
}

/** find the index of next lowercase character, starting from index `start` and optionally ending at exclusive-index `end` */
export const findNextLowerCase = (str: string, start = 0, end: number | undefined = undefined): number | undefined => {
	end = (end! < str.length ? end! : str.length) - 1
	const str_charCodeAt = bind_string_charCodeAt(str)
	let c: number
	while (c = str_charCodeAt(start++)) {
		if (c > 96 && c < 123) {
			return start - 1
		}
	}
	return undefined
}

/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optionally ending at exclusive-index `end` 
*/
export const findNextUpperOrLowerCase = (str: string, option: 1 | -1, start = 0, end: number | undefined = undefined): number | undefined => {
	if (option === 1) { return findNextUpperCase(str, start, end) }
	else if (option === -1) { return findNextLowerCase(str, start, end) }
	else { return undefined }
}

/** the `NamingCaseTuple` consists of the following settable options, as an array:
 * - `0` or `first_letter_upper`: is the first letter an upper case letter?
 *   - `1` = yes, `-1` = no, `0` = impartial (in other words, it will depend-on/inherit `word_first_letter_upper`)
 * - `1` or `word_first_letter_upper`: is the first letter of each word an upper case letter?
 *   - `1` = yes, `-1` = no, `0` = preserve original
 * - `2` or `rest_word_letters_upper`: are the remaining letters in each word in upper case?
 *   - `1` = yes, `-1` = no, `0` = preserve original
 * - `3` or `delimiter`?: the separator between words
 *   - `""` (default) indicates that there's no delimiter character. so we must rely on letter case change to detect word splitting. this is what is used for camelCase and PascalCase
 *   - `"_"` delimiter is used by snake_case 
 *   - `"-"` delimiter is used by kebab-case
 *   - `string` define a custom delimiter string
 * - `4` or `prefix`?: is there a prefix string?
 * - `5` or `suffix`?: is there a suffix string?
*/
export type NamingCaseTuple = [
	first_letter_upper: 1 | 0 | -1,
	word_first_letter_upper: 1 | 0 | -1,
	rest_word_letters_upper: 1 | 0 | -1,
	delimiter?: "" | "_" | "-" | string,
	prefix?: string,
	suffix?: string,
]

export const wordsToToken = (casetype: NamingCaseTuple, words: string[]): string => {
	const
		[first_letter_upper, word_first_letter_upper, rest_word_letters_upper, delimiter = "", prefix = "", suffix = ""] = casetype,
		last_i = words.length - 1,
		token = words.map((w, i) => {
			const
				w_0 = toUpperOrLowerCase(w[0], i > 0 ? word_first_letter_upper : first_letter_upper),
				w_rest = toUpperOrLowerCase(w.slice(1), rest_word_letters_upper),
				sep = i < last_i ? delimiter : ""
			return w_0 + w_rest + sep
		}).reduce((str, word) => str + word, prefix) + suffix
	return token
}

export const tokenToWords = (casetype: NamingCaseTuple, token: string): string[] => {
	const [, word_first_letter_upper, , delimiter = "", prefix = "", suffix = ""] = casetype
	token = token.slice(prefix.length, - suffix.length || undefined)
	let words: string[]
	if (delimiter === "") {
		// we must now rely on change-in-character-capitlaization to identify indexes of where to split
		const idxs: ContinuousIntervals = [0]
		let i: number | undefined = 0
		while (i !== undefined) {
			i = findNextUpperOrLowerCase(token, word_first_letter_upper as (1 | -1), i + 1)
			idxs.push(i)
		}
		words = sliceContinuous(token, idxs)
	} else words = token.split(delimiter)
	return words.map(word => string_toLowerCase(word))
}

export const convertCase = (
	from_casetype: NamingCaseTuple,
	to_casetype: NamingCaseTuple,
	token: string,
) => wordsToToken(to_casetype, tokenToWords(from_casetype, token))

/** generate a specific case converter. convenient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export const convertCase_Factory = (from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => {
	const
		bound_words_to_token = wordsToToken.bind(undefined, to_casetype),
		bound_token_to_words = tokenToWords.bind(undefined, from_casetype)
	return (token: string) => bound_words_to_token(bound_token_to_words(token))
}

export const snakeCase: NamingCaseTuple = [-1, -1, -1, "_"]
export const kebabCase: NamingCaseTuple = [-1, -1, -1, "-"]
export const camelCase: NamingCaseTuple = [-1, 1, -1, ""]
export const pascalCase: NamingCaseTuple = [1, 1, -1, ""]
export const screamingSnakeCase: NamingCaseTuple = [1, 1, 1, "_"]
export const screamingKebabCase: NamingCaseTuple = [1, 1, 1, "-"]
export const kebabToCamel = /*@__PURE__*/ convertCase_Factory(kebabCase, camelCase)
export const camelToKebab = /*@__PURE__*/ convertCase_Factory(camelCase, kebabCase)
export const snakeToCamel = /*@__PURE__*/ convertCase_Factory(snakeCase, camelCase)
export const camelToSnake = /*@__PURE__*/ convertCase_Factory(camelCase, snakeCase)
export const kebabToSnake = /*@__PURE__*/ convertCase_Factory(kebabCase, snakeCase)
export const snakeToKebab = /*@__PURE__*/ convertCase_Factory(snakeCase, kebabCase)

/** reversing a string is not natively supported by javascript, and performing it is not so trivial when considering that
 * you can have composite UTF-16 characters (such as emojis and characters with accents).
 * 
 * see this excellent solution in stackoverflow for reversing a string: [stackoverflow.com/a/60056845](https://stackoverflow.com/a/60056845). <br>
 * we use the slightly less reliable technique provided by the answer, as it has a better browser support.
*/
export const reverseString = (input: string): string => {
	return [...input.normalize("NFC")].toReversed().join("")
}

/** find the longest common prefix among a list of `inputs`.
 * for efficiency, this function starts off by using the shortest string among `inputs`, then performs a binary search.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * assertEquals(commonPrefix([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * 	"C:/Hello/Earth/Bla/Bla/Bla",
 * ]), "C:/Hello/")
 * assertEquals(commonPrefix([
 * 	"C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World/This/is/an/example/bla.cs",
 * 	"C:/Hello/World/This/Is/Not/An/Example/",
 * ]), "C:/Hello/World/This/")
 * assertEquals(commonPrefix([
 * 	"C:/Hello/World/Users/This/Is/An/Example/Bla.cs",
 * 	"C:/Hello/World Users/This/Is/An/example/bla.cs",
 * 	"C:/Hello/World-Users/This/Is/Not/An/Example/",
 * ]), "C:/Hello/World")
 * ```
*/
export const commonPrefix = (inputs: string[]): string => {
	const len = inputs.length
	if (len < 1) return ""
	const
		inputs_lengths = inputs.map((str) => (str.length)),
		shortest_input_length = math_min(...inputs_lengths),
		shortest_input = inputs[inputs_lengths.indexOf(shortest_input_length)]
	let
		left = 0,
		right = shortest_input_length
	while (left <= right) {
		const
			center = ((left + right) / 2) | 0,
			prefix = shortest_input.substring(0, center)
		if (inputs.every((input) => (input.startsWith(prefix)))) {
			left = center + 1
		} else {
			right = center - 1
		}
	}
	return shortest_input.substring(0, ((left + right) / 2) | 0)
}

/** find the longest common suffix among a list of `inputs`.
 * for efficiency, this function simply reverses the character ordering of each input, and then uses {@link commonPrefix}.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * assertEquals(commonSuffix([
 * 	"file:///C:/Hello/World/This/Is/An/Example/Bla.cs",
 * 	"file:///C:/Hello/Users/This/Is-An/Example/Bla.cs",
 * 	"file:///C:/Hello/Users/This/Is/YetAnother-An/Example/Bla.cs",
 * 	"file:///C:/Hello/Earth/This/Is/Not/An/Example/Bla.cs",
 * ]), "An/Example/Bla.cs")
 * ```
*/
export const commonSuffix = (inputs: string[]): string => {
	return reverseString(commonPrefix(inputs.map(reverseString)))
}
