/** utility functions for manupilating, generating, or parsing `string` <br>
 * @module
*/
const default_HexStringRepr = {
    sep: ", ",
    prefix: "0x",
    postfix: "",
    trailing_sep: false,
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
    const { sep, prefix, postfix, trailing_sep, bra, ket, toUpperCase, radix, } = { ...default_HexStringRepr, ...options }, num_arr = arr.buffer ? Array.from(arr) : arr, str = num_arr.map(v => {
        let s = (v | 0).toString(radix);
        s = s.length === 2 ? s : "0" + s;
        if (toUpperCase)
            return s.toUpperCase();
        return s;
    }).reduce((str, s) => str + prefix + s + postfix + sep, "");
    return bra + str.slice(0, trailing_sep ? undefined : -sep.length) + ket;
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
