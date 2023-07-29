/** utility functions for cryptography
 * @module
*/
import "./_dnt.polyfills.js";
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
export declare const Crc32: (bytes: Uint8Array | Array<number>, crc?: number) => number;
