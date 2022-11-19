/** utility functions for cryptography
 * @module
*/
let crc32_table;
const init_crc32_table = () => {
    crc32_table = new Int32Array(256);
    const polynomial = -306674912;
    for (let i = 0; i < 256; i++) {
        // initialize the table with `polynomial` being the starting seed
        let r = i;
        for (let bit = 8; bit > 0; --bit)
            r = ((r & 1) ? ((r >>> 1) ^ polynomial) : (r >>> 1));
        crc32_table[i] = r;
    }
};
/** the CRC32 hash is quick to compute and used frequently in compression functions and their derivatives <br>
 * you do not have to provide the `bytes` array in its entirity all at once, because you can continue
 * off with the previous partial byte array's crc-hash using the second argument.
 * @example
 * ```ts
 * const
 * 	txtenc = new TextEncoder(),
 * 	crc_a = Crc32(txtenc.encode("hello ")), // == 0xED81F9F6
 * 	crc_b = Crc32(txtenc.encode("world"), crc_a), // == 0x0D4A1185
 * 	crc_c = Crc32(txtenc.encode("hello world")) // == 0x0D4A1185
 * console.assert(crc_b === crc_c)
 * ```
 * @param bytes an array of bytes to compute the hash for. can be any kind of array, so long as all byte numbers conform to being unsinged integers that do not exceed the maximum value of `255` (8-bit max value)
 * @param crc provide any previous crc hash that you'd like to continue from, or leave it `undefined` to begin from the standard value of `0xFFFFFFFF` by default
*/
export const Crc32 = (bytes, crc) => {
    crc = crc === undefined ? 0xFFFFFFFF : crc ^ -1;
    if (crc32_table === undefined)
        init_crc32_table();
    for (let i = 0; i < bytes.length; ++i)
        crc = crc32_table[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
    return (crc ^ -1) >>> 0;
};
