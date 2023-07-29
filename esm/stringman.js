/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/
import "./_dnt.polyfills.js";
import { sliceContinuous } from "./typedbuffer.js";
const default_HexStringRepr = {
    sep: ", ",
    prefix: "0x",
    postfix: "",
    trailingSep: false,
    bra: "[",
    ket: "]",
    toUpperCase: true,
    radix: 16,
};
/** convert an array of integer numbers to hex-string, for the sake of easing representation, or for visual purposes. <br>
 * it's also moderately customizable via `options` using the {@link HexStringRepr} interface. <br>
 * make sure that every element of your array is non-negative and less than `options.radix ** 2`
 * (default `options.radix == 16`, so your numbers must be smaller than `256` on the default config)
*/
export const hexStringOfArray = (arr, options) => {
    const { sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix, } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? Array.from(arr) : arr, str = num_arr.map(v => {
        let s = (v | 0).toString(radix);
        s = s.length === 2 ? s : "0" + s;
        if (toUpperCase)
            return s.toUpperCase();
        return s;
    }).reduce((str, s) => str + prefix + s + postfix + sep, "");
    return bra + str.slice(0, trailingSep ? undefined : -sep.length) + ket;
};
/** convert hex-string back to an array of integers, provided that you know the exact {@link HexStringRepr} config of your particular hex-string. */
export const hexStringToArray = (hex_str, options) => {
    const { sep, prefix, postfix, bra, ket, radix, } = { ...default_HexStringRepr, ...options }, [sep_len, prefix_len, postfix_len, bra_len, ket_len] = [sep, prefix, postfix, bra, ket].map(s => s.length), hex_str2 = hex_str.slice(bra_len, ket_len > 0 ? -ket_len : undefined), // there are no brackets remaining
    elem_len = prefix_len + 2 + postfix_len + sep_len, int_arr = [];
    for (let i = prefix_len; i < hex_str2.length; i += elem_len)
        int_arr.push(parseInt(hex_str2[i] + hex_str2[i + 1], // these are the two characters representing the current number in hex-string format
        radix));
    return int_arr;
};
/** turn a string to uppercase */
export const up = (str) => str.toUpperCase();
/** turn a string to lowercase */
export const low = (str) => str.toLowerCase();
/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export const getUpOrLow = (str, option) => option === 1 ? up(str) : option === -1 ? low(str) : str;
/** find the index of next uppercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findUp = (str, start = 0, end = undefined) => {
    end = (end < str.length ? end : str.length) - 1;
    for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++))
        if (c > 64 && c < 91)
            return i - 1;
    return undefined;
};
/** find the index of next lowercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findLow = (str, start = 0, end = undefined) => {
    end = (end < str.length ? end : str.length) - 1;
    for (let i = start, c = str.charCodeAt(i++); i < end; c = str.charCodeAt(i++))
        if (c > 96 && c < 123)
            return i - 1;
    return undefined;
};
/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optinally ending at exclusive-index `end`
*/
export const findUpOrLow = (str, option, start = 0, end = undefined) => option === 1 ? findUp(str, start, end) : option === -1 ? findLow(str, start, end) : undefined;
export const wordsToToken = (words, casetype) => {
    const [flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype, last_i = words.length - 1, token = words.map((w, i) => {
        const w_0 = getUpOrLow(w[0], i > 0 ? wflu : flu), w_rest = getUpOrLow(w.slice(1), rwlu), sep = i < last_i ? d : "";
        return w_0 + w_rest + sep;
    }).reduce((str, word) => str + word, pre) + suf;
    return token;
};
export const tokenToWords = (token, casetype) => {
    const [flu, wflu, rwlu, d = "", pre = "", suf = ""] = casetype;
    token = token.slice(pre.length, -suf.length || undefined);
    let words;
    if (d === "") {
        // we must now rely on change-in-character-capitlaization to identify indexes of where to split
        const idxs = [0];
        let i = 0;
        while (i !== undefined) {
            i = findUpOrLow(token, wflu, i + 1);
            idxs.push(i);
        }
        words = sliceContinuous(token, idxs);
    }
    else
        words = token.split(d);
    return words.map(word => low(word));
};
export const convertCase = (token, from_casetype, to_casetype) => wordsToToken(tokenToWords(token, from_casetype), to_casetype);
/** generate a specific case converter. convinient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export const makeCaseConverter = (from_casetype, to_casetype) => (token) => convertCase(token, from_casetype, to_casetype);
export const snakeCase = [-1, -1, -1, "_"];
export const kebabCase = [-1, -1, -1, "-"];
export const camelCase = [-1, 1, -1, ""];
export const pascalCase = [1, 1, -1, ""];
export const screamingSnakeCase = [1, 1, 1, "_"];
export const screamingKebabCase = [1, 1, 1, "-"];
export const kebabToCamel = makeCaseConverter(kebabCase, camelCase);
export const camelToKebab = makeCaseConverter(camelCase, kebabCase);
export const snakeToCamel = makeCaseConverter(snakeCase, camelCase);
export const camelToSnake = makeCaseConverter(camelCase, snakeCase);
export const kebabToSnake = makeCaseConverter(kebabCase, snakeCase);
export const snakeToKebab = makeCaseConverter(snakeCase, kebabCase);
