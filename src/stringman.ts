/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/

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
