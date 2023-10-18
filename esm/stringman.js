/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/
import "./_dnt.polyfills.js";
import { bind_string_charCodeAt } from "./binder.js";
import { array_from, string_toLowerCase, string_toUpperCase } from "./builtin_aliases_deps.js";
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
    const { sep, prefix, postfix, trailingSep, bra, ket, toUpperCase, radix, } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? array_from(arr) : arr, str = num_arr.map(v => {
        let s = (v | 0).toString(radix);
        s = s.length === 2 ? s : "0" + s;
        return toUpperCase ? string_toUpperCase(s) : s;
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
/** get upper or lower case of a string `str`, based on the numeric `option`. <br>
 * if `option === 0`, then no change is made
*/
export const toUpperOrLowerCase = (str, option) => option === 1 ? string_toUpperCase(str) : option === -1 ? string_toLowerCase(str) : str;
/** find the index of next uppercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findNextUpperCase = (str, start = 0, end = undefined) => {
    end = (end < str.length ? end : str.length) - 1;
    const str_charCodeAt = bind_string_charCodeAt(str);
    let c;
    while (c = str_charCodeAt(start++)) {
        if (c > 64 && c < 91) {
            return start - 1;
        }
    }
    return undefined;
};
/** find the index of next lowercase character, starting from index `start` and optinally ending at exclusive-index `end` */
export const findNextLowerCase = (str, start = 0, end = undefined) => {
    end = (end < str.length ? end : str.length) - 1;
    const str_charCodeAt = bind_string_charCodeAt(str);
    let c;
    while (c = str_charCodeAt(start++)) {
        if (c > 96 && c < 123) {
            return start - 1;
        }
    }
    return undefined;
};
/** find either the next upper or next lower case character index in string `str`, based on the numeric `option`. <br>
 * starting from index `start` and optinally ending at exclusive-index `end`
*/
export const findNextUpperOrLowerCase = (str, option, start = 0, end = undefined) => {
    if (option === 1) {
        return findNextUpperCase(str, start, end);
    }
    else if (option === -1) {
        return findNextLowerCase(str, start, end);
    }
    else {
        return undefined;
    }
};
export const wordsToToken = (casetype, words) => {
    const [first_letter_upper, word_first_letter_upper, rest_word_letters_upper, delimiter = "", prefix = "", suffix = ""] = casetype, last_i = words.length - 1, token = words.map((w, i) => {
        const w_0 = toUpperOrLowerCase(w[0], i > 0 ? word_first_letter_upper : first_letter_upper), w_rest = toUpperOrLowerCase(w.slice(1), rest_word_letters_upper), sep = i < last_i ? delimiter : "";
        return w_0 + w_rest + sep;
    }).reduce((str, word) => str + word, prefix) + suffix;
    return token;
};
export const tokenToWords = (casetype, token) => {
    const [, word_first_letter_upper, , delimiter = "", prefix = "", suffix = ""] = casetype;
    token = token.slice(prefix.length, -suffix.length || undefined);
    let words;
    if (delimiter === "") {
        // we must now rely on change-in-character-capitlaization to identify indexes of where to split
        const idxs = [0];
        let i = 0;
        while (i !== undefined) {
            i = findNextUpperOrLowerCase(token, word_first_letter_upper, i + 1);
            idxs.push(i);
        }
        words = sliceContinuous(token, idxs);
    }
    else
        words = token.split(delimiter);
    return words.map(word => string_toLowerCase(word));
};
export const convertCase = (from_casetype, to_casetype, token) => wordsToToken(to_casetype, tokenToWords(from_casetype, token));
/** generate a specific case converter. convinient for continued use. <br>
 * see {@link kebabToCamel} and {@link camelToKebab} as examples that are generated via this function
*/
export const convertCase_Factory = (from_casetype, to_casetype) => {
    const bound_words_to_token = wordsToToken.bind(undefined, to_casetype), bound_token_to_words = tokenToWords.bind(undefined, from_casetype);
    return (token) => bound_words_to_token(bound_token_to_words(token));
};
export const snakeCase = [-1, -1, -1, "_"];
export const kebabCase = [-1, -1, -1, "-"];
export const camelCase = [-1, 1, -1, ""];
export const pascalCase = [1, 1, -1, ""];
export const screamingSnakeCase = [1, 1, 1, "_"];
export const screamingKebabCase = [1, 1, 1, "-"];
export const kebabToCamel = /*@__PURE__*/ convertCase_Factory(kebabCase, camelCase);
export const camelToKebab = /*@__PURE__*/ convertCase_Factory(camelCase, kebabCase);
export const snakeToCamel = /*@__PURE__*/ convertCase_Factory(snakeCase, camelCase);
export const camelToSnake = /*@__PURE__*/ convertCase_Factory(camelCase, snakeCase);
export const kebabToSnake = /*@__PURE__*/ convertCase_Factory(kebabCase, snakeCase);
export const snakeToKebab = /*@__PURE__*/ convertCase_Factory(snakeCase, kebabCase);
