/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/

import { sliceContinuous, ContinuousIntervals } from "./typedbuffer.js"
import { NumericArray, TypedArray } from "./typedefs.js"

/** customize the hex-string representation made by {@link hexStringOfArray} using these options <br>
 * the default configuration is:
 * ```ts
 * const default_HexStringRepr = { sep: ", ", prefix: "0x", postfix: "", trailing_sep: false, bra: "[", ket: "]", toUpperCase: true, radix: 16, }
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
	trailing_sep: boolean
	/** the left bracket string. <br> **defaults to** `"["` */
	bra: string
	/** the right bracket string. <br> **defaults to** `"]"` */
	ket: string
	/** do we want upper case letters for the hex-string? <br> **defaults to** `true` */
	toUpperCase: boolean
	/** provide an alernate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
	 * use `16` for a hex-string, or `2` for binary-string, accepted values must be between `2` and `36` <br>
	 * **defaults to** `16`
	*/
	radix: number
}

const default_HexStringRepr: HexStringRepr = {
	sep: ", ",
	prefix: "0x",
	postfix: "",
	trailing_sep: false,
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
		{ sep, prefix, postfix, trailing_sep, bra, ket, toUpperCase, radix, } = { ...default_HexStringRepr, ...options },
		num_arr: number[] = (arr as TypedArray).buffer ? Array.from(arr as TypedArray) : arr as number[],
		str = num_arr.map(v => {
			let s = (v | 0).toString(radix)
			s = s.length === 2 ? s : "0" + s
			if (toUpperCase) return s.toUpperCase()
			return s
		}).reduce((str, s) => str + prefix + s + postfix + sep, "")
	return bra + str.slice(0, trailing_sep ? undefined : - sep.length) + ket
}

/** convert hex-string back to an array of integers, provided that you know the exact {@link HexStringRepr} config of your particular hex-string. */
export const hexStringToArray = (hex_str: string, options: Partial<HexStringRepr>): Array<number> => {
	const { sep, prefix, postfix, bra, ket, radix, } = { ...default_HexStringRepr, ...options },
		[sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep, prefix, postfix, bra, ket].map(s => s.length),
		hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? - ket_len : undefined), // there are no brackets remaining
		elem_len = prefix_len + 2 + postfix_len + sep_len,
		int_arr: number[] = []
	for (let i = prefix_len; i < hex_str2.length; i += elem_len) int_arr.push(
		parseInt(
			hex_str2[i] + hex_str2[i + 1], // these are the two characters representing the current number in hex-string format
			radix
		)
	)
	return int_arr
}

/** turn a string to uppercase */
export const up = (str: string) => str.toUpperCase()

/** turn a string to lowercase */
export const low = (str: string) => str.toLowerCase()

/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export const getUpOrLow = (str: string, option: 1 | 0 | -1) => option === 1 ? up(str) : option === -1 ? low(str) : str

/** find the index of next uppercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findUp = (str: string, start = 0, end: number | undefined = undefined): number | undefined => {
	end = (end! < str.length ? end! : str.length) - 1
	for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++)) if (c > 64 && c < 91) return i - 1
	return undefined
}

/** find the index of next lowercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findLow = (str: string, start = 0, end: number | undefined = undefined): number | undefined => {
	end = (end! < str.length ? end! : str.length) - 1
	for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++)) if (c > 96 && c < 123) return i - 1
	return undefined
}

/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optinally ending at exclusive-index `end` 
*/
export const findUpOrLow = (str: string, option: 1 | -1, start = 0, end: number | undefined = undefined): number | undefined => option === 1 ? findUp(str, start, end) : option === -1 ? findLow(str, start, end) : undefined

export type NamingCaseTuple = [
	first_letter_upper: 1 | 0 | -1,
	word_first_letter_upper: 1 | 0 | -1,
	rest_word_letters_upper: 1 | 0 | -1,
	delimiter?:
	| ""      // `""` indicates that there's no delimiter character. so we must rely on letter case change to detect word splitting. this is what is used for camelCase and PascalCase
	| "_"     // `"_"` delimiter is used by snake_case 
	| "-"     // `"-"` delimiter is used by kebab-case
	| string, // define a custom delimiter string
	prefix?: string,
	suffix?: string,
]

export const wordsToToken = (words: string[], casetype: NamingCaseTuple): string => {
	const
		[flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype,
		last_i = words.length - 1,
		token = words.map((w, i) => {
			const
				w_0 = getUpOrLow(w[0], i > 0 ? wflu : flu),
				w_rest = getUpOrLow(w.slice(1), rwlu),
				sep = i < last_i ? d : ""
			return w_0 + w_rest + sep
		}).reduce((str, word) => str + word, pre) + suf
	return token
}

export const tokenToWords = (token: string, casetype: NamingCaseTuple): string[] => {
	const [flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype
	token = token.slice(pre.length, - suf.length || undefined)
	let words: string[]
	if (d === "") {
		// we must now rely on change-in-character-capitlaization to identify indexes of where to split
		const idxs: ContinuousIntervals = [0]
		let i: number | undefined = 0
		while (i !== undefined) {
			i = findUpOrLow(token, wflu as (1 | -1), i + 1)
			idxs.push(i)
		}
		words = sliceContinuous(token, idxs)
	} else words = token.split(d)
	return words.map(word => low(word))
}

export const convertCase = (token: string, from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => wordsToToken(tokenToWords(token, from_casetype), to_casetype)

/** generate a specific case converter. convinient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export const makeCaseConverter = (from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => (token: string) => convertCase(token, from_casetype, to_casetype)

export const snakeCase: NamingCaseTuple = [-1, -1, -1, "_"]
export const kebabCase: NamingCaseTuple = [-1, -1, -1, "-"]
export const camelCase: NamingCaseTuple = [-1, 1, -1, ""]
export const pascalCase: NamingCaseTuple = [1, 1, -1, ""]
export const screamingSnakeCase: NamingCaseTuple = [1, 1, 1, "_"]
export const screamingKebabCase: NamingCaseTuple = [1, 1, 1, "-"]
export const kebabToCamel = makeCaseConverter(kebabCase, camelCase)
export const camelToKebab = makeCaseConverter(camelCase, kebabCase)
export const snakeToCamel = makeCaseConverter(snakeCase, camelCase)
export const camelToSnake = makeCaseConverter(camelCase, snakeCase)
export const kebabToSnake = makeCaseConverter(kebabCase, snakeCase)
export const snakeToKebab = makeCaseConverter(snakeCase, kebabCase)
