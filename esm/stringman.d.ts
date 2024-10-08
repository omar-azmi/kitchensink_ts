/** utility functions for manipulating, generating, or parsing `string`.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import type { NumericArray } from "./typedefs.js";
/** customize the hex-string representation made by {@link hexStringOfArray} using these options <br>
 * the default configuration is:
 * ```ts
 * const default_HexStringRepr = { sep: ", ", prefix: "0x", postfix: "", trailingSep: false, bra: "[", ket: "]", toUpperCase: true, radix: 16, }
 * ```
*/
export interface HexStringRepr {
    /** separator character string between bytes. <br> **defaults to** `", "` */
    sep: string;
    /** what string to prefix every hex-string byte with? <br> **defaults to** `"0x"` */
    prefix: string;
    /** what string to add to the end of every hex-string byte? <br> **defaults to** `""` (an empty string) */
    postfix: string;
    /** do you want to include a trailing {@link sep} after the final byte? <br>
     * example output when true: `"[0x01, 0x02, 0x03,]"`, <br>
     * example output when false: `"[0x01, 0x02, 0x03]"`. <br>
     * **defaults to** `false`
    */
    trailingSep: boolean;
    /** the left bracket string. <br> **defaults to** `"["` */
    bra: string;
    /** the right bracket string. <br> **defaults to** `"]"` */
    ket: string;
    /** do we want upper case letters for the hex-string? <br> **defaults to** `true` */
    toUpperCase: boolean;
    /** provide an alternate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
     * use `16` for a hex-string, or `2` for binary-string, accepted values must be between `2` and `36` <br>
     * **defaults to** `16`
    */
    radix: number;
}
/** convert an array of integer numbers to hex-string, for the sake of easing representation, or for visual purposes. <br>
 * it's also moderately customizable via `options` using the {@link HexStringRepr} interface. <br>
 * make sure that every element of your array is non-negative and less than `options.radix ** 2`
 * (default `options.radix == 16`, so your numbers must be smaller than `256` on the default config)
*/
export declare const hexStringOfArray: (arr: NumericArray, options: Partial<HexStringRepr>) => string;
/** convert hex-string back to an array of integers, provided that you know the exact {@link HexStringRepr} config of your particular hex-string. */
export declare const hexStringToArray: (hex_str: string, options: Partial<HexStringRepr>) => Array<number>;
/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export declare const toUpperOrLowerCase: (str: string, option: 1 | 0 | -1) => string;
/** find the index of next uppercase character, starting from index `start` and optionally ending at exclusive-index `end` */
export declare const findNextUpperCase: (str: string, start?: number, end?: number | undefined) => number | undefined;
/** find the index of next lowercase character, starting from index `start` and optionally ending at exclusive-index `end` */
export declare const findNextLowerCase: (str: string, start?: number, end?: number | undefined) => number | undefined;
/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optionally ending at exclusive-index `end`
*/
export declare const findNextUpperOrLowerCase: (str: string, option: 1 | -1, start?: number, end?: number | undefined) => number | undefined;
/**
 * `NamingCaseTuple` consists of the following settable options, as an array:
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
    suffix?: string
];
export declare const wordsToToken: (casetype: NamingCaseTuple, words: string[]) => string;
export declare const tokenToWords: (casetype: NamingCaseTuple, token: string) => string[];
export declare const convertCase: (from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple, token: string) => string;
/** generate a specific case converter. convenient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export declare const convertCase_Factory: (from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => (token: string) => string;
export declare const snakeCase: NamingCaseTuple;
export declare const kebabCase: NamingCaseTuple;
export declare const camelCase: NamingCaseTuple;
export declare const pascalCase: NamingCaseTuple;
export declare const screamingSnakeCase: NamingCaseTuple;
export declare const screamingKebabCase: NamingCaseTuple;
export declare const kebabToCamel: (token: string) => string;
export declare const camelToKebab: (token: string) => string;
export declare const snakeToCamel: (token: string) => string;
export declare const camelToSnake: (token: string) => string;
export declare const kebabToSnake: (token: string) => string;
export declare const snakeToKebab: (token: string) => string;
//# sourceMappingURL=stringman.d.ts.map