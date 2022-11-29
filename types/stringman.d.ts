/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/
import { NumericArray } from "./typedefs.js";
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
    /** provide an alernate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
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
/** turn a string to uppercase */
export declare const up: (str: string) => string;
/** turn a string to lowercase */
export declare const low: (str: string) => string;
/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export declare const getUpOrLow: (str: string, option: 1 | 0 | -1) => string;
/** find the index of next uppercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export declare const findUp: (str: string, start?: number, end?: number | undefined) => number | undefined;
/** find the index of next lowercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export declare const findLow: (str: string, start?: number, end?: number | undefined) => number | undefined;
/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optinally ending at exclusive-index `end`
*/
export declare const findUpOrLow: (str: string, option: 1 | -1, start?: number, end?: number | undefined) => number | undefined;
export type NamingCaseTuple = [
    first_letter_upper: 1 | 0 | -1,
    word_first_letter_upper: 1 | 0 | -1,
    rest_word_letters_upper: 1 | 0 | -1,
    delimiter?: "" | "_" | "-" | string,
    prefix?: string,
    suffix?: string
];
export declare const wordsToToken: (words: string[], casetype: NamingCaseTuple) => string;
export declare const tokenToWords: (token: string, casetype: NamingCaseTuple) => string[];
export declare const convertCase: (token: string, from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => string;
/** generate a specific case converter. convinient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export declare const makeCaseConverter: (from_casetype: NamingCaseTuple, to_casetype: NamingCaseTuple) => (token: string) => string;
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
