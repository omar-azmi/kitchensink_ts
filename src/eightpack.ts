/** utility functions for packing and unpacking bytes (8-bits) of primitive javascript objects. <br>
 * and hence the name of the module (*8(bit)pack*)
 * @module
*/

import { NumericArrayType, NumericType, TypedArray, } from "./typedefs"
import { concatBytes, env_le, swapEndianessFast, typed_array_constructor_of } from "./typedbuffer"

/** binary primitive types
 * - {@link NumericType} various binary representations of number
 * - {@link NumericArrayType} various binary representations of array of numbers. requires defining array length (number of items) during decoding as `args[0]`
 * - `"bytes"` a `Uint8Array`, which requires defining a bytesize length during decoding as `args[0]`
 * - `"str"` a string, which requires defining a bytesize length during decoding as `args[0]`
 * - `"cstr"` a null-terminated (`"\u0000"`) string. the null termination byte character is automatically added when encoding
 * - `"bool"` a boolean occupying a single byte
*/
export type PrimitiveType =
	| PrimitiveArrayType
	| NumericType
	| "cstr"
	| "bool"

/** primitive types that typically require length information to be decoded */
export type PrimitiveArrayType =
	| NumericArrayType
	| "bytes"
	| "str"

/** all unpack functions return their decoded outputs in a 2-tupple array; <br>
 * the first element being the decoded value `V`, and the second being the number of bytes this data occupied */
export type Decoded<V, ByteSize extends number = number> = [value: V, bytesize: ByteSize]

/** primitive javascript types */
export type JSPrimitive = string | boolean | number | bigint | number[] | Uint8Array

/** packing function signature for {@link JSPrimitive} types */
export type EncodeFunc<T extends JSPrimitive, ARGS extends any[] = []> = (value: T, ...args: ARGS) => Uint8Array

/** unpacking function signature for {@link JSPrimitive} types */
export type DecodeFunc<T extends JSPrimitive, ARGS extends any[] = []> = (buffer: Uint8Array, offset: number, ...args: ARGS) => Decoded<T>

const txt_encoder = new TextEncoder()
const txt_decoder = new TextDecoder()

/** read `type` of value from buffer `buf` starting at position `offset` */
export const readFrom = (buf: Uint8Array, offset: number, type: PrimitiveType, ...args: any[]): [value: JSPrimitive, new_offset: number] => {
	const [value, bytesize] = unpack(type, buf, offset, ...args)
	return [value, offset + bytesize]
}

/** write `type` of `value` to buffer `buf` starting at position `offset` */
export const writeTo = (buf: Uint8Array, offset: number, type: PrimitiveType, value: JSPrimitive, ...args: any[]): [buf: Uint8Array, new_offset: number] => {
	const value_buf = pack(type, value, ...args)
	buf.set(value_buf, offset)
	return [buf, offset + value_buf.length]
}

/** encode a sequential array of items.
 * @example
 * ```ts
 * encodeSeq(["u4b", 0x12AB98], ["str", "hello"], ["bool", false]) === Uint8Array.of(0x00, 0x12, 0xAB, 0x98, 104, 101, 108, 108, 111, 0)
 * ```
*/
export const packSeq = (...items: Parameters<typeof pack>[]) => {
	const bufs: Uint8Array[] = []
	for (const item of items) bufs.push(pack(...item))
	return concatBytes(...bufs)
}

/** decode as a sequential array of items. this is the inverse of {@link packSeq}
 * @example
 * ```ts
 * decodeSeq(Uint8Array.of(0x00, 0x12, 0xAB, 0x98, 104, 101, 108, 108, 111, 0), 0, ["u4b"], ["str", 5], ["bool"]) === [[0x12AB98, "hello", false], 10]
 * ```
*/
export const unpackSeq = (buf: Uint8Array, offset: number, ...items: [type: PrimitiveType, ...args: any[]][]): Decoded<JSPrimitive[]> => {
	const values: JSPrimitive[] = []
	let total_bytesize = 0
	for (const [type, ...args] of items) {
		const [value, bytesize] = unpack(type, buf, offset + total_bytesize, ...args)
		values.push(value)
		total_bytesize += bytesize
	}
	return [values, total_bytesize]
}

/** auto value encoder/packer for {@link PrimitiveType} */
export const pack = (type: PrimitiveType, value: JSPrimitive, ...args: any[]): ReturnType<EncodeFunc<JSPrimitive>> => {
	switch (type) {
		case "bool": return encode_bool(value as boolean)
		case "cstr": return encode_cstr(value as string)
		case "str": return encode_str(value as string)
		case "bytes": return encode_bytes(value as Uint8Array)
		default: {
			if (type.endsWith("[]")) return encode_number_array(value as number[], type as NumericArrayType)
			else return encode_number(value as number, type as NumericType)
		}
	}
}

/** auto buffer decoder/unpacker for {@link PrimitiveType} */
export const unpack = (type: PrimitiveType, buf: Uint8Array, offset: number, ...args: any[]): ReturnType<DecodeFunc<JSPrimitive>> => {
	switch (type) {
		case "bool": return decode_bool(buf, offset)
		case "cstr": return decode_cstr(buf, offset)
		case "str": return decode_str(buf, offset, ...args)
		case "bytes": return decode_bytes(buf, offset, ...args)
		default: {
			if (type.endsWith("[]")) return decode_number_array(buf, offset, type as NumericArrayType, ...args)
			else return decode_number(buf, offset, type as NumericType)
		}
	}
}

/** pack a `boolean` as 1-byte of data */
export const encode_bool: EncodeFunc<boolean> = (value) => Uint8Array.of(value ? 1 : 0)

/** unpack a `boolean` from 1-byte of data */
export const decode_bool: DecodeFunc<boolean> = (buf, offset = 0) => [buf[offset] >= 1 ? true : false, 1]

/** pack a `string` as an array of characters, terminated by the `"\u0000"` charbyte. this is the c convention of strings */
export const encode_cstr: EncodeFunc<string> = (value) => txt_encoder.encode(value + "\u0000")

/** unpack a `string` as an array of characters that's terminated by `"\u0000"` charbyte. this is the c convention of strings */
export const decode_cstr: DecodeFunc<string> = (buf, offset = 0) => {
	const
		offset_end = buf.indexOf(0x00, offset),
		txt_arr = buf.subarray(offset, offset_end),
		value = txt_decoder.decode(txt_arr)
	return [value, txt_arr.length + 1]
}

/** pack a `string` as an array of characters */
export const encode_str: EncodeFunc<string> = (value) => txt_encoder.encode(value)

/** unpack a `string` as an array of characters. you must provide the `bytesize` of the string being decoded, otherwise the decoder will unpack till the end of the buffer */
export const decode_str: DecodeFunc<string, [bytesize?: number]> = (buf, offset = 0, bytesize?) => {
	const
		offset_end = bytesize === undefined ? undefined : offset + bytesize,
		txt_arr = buf.subarray(offset, offset_end),
		value = txt_decoder.decode(txt_arr)
	return [value, txt_arr.length]
}

/** pack a `Uint8Array` array of bytes as is. (ie: don't perform any operation) */
export const encode_bytes: EncodeFunc<Uint8Array> = (value) => value

/** unpack a `Uint8Array` array of bytes. you must provide the `bytesize` of the bytes being decoded, otherwise the decoder will unpack till the end of the buffer */
export const decode_bytes: DecodeFunc<Uint8Array, [bytesize?: number]> = (buf, offset = 0, bytesize?) => {
	const
		offset_end = bytesize === undefined ? undefined : offset + bytesize,
		value = buf.slice(offset, offset_end)
	return [value, value.length]
}

/** pack a numeric array (`number[]`) in the provided {@link NumericArrayType} byte representation */
export const encode_number_array: EncodeFunc<number[], [type: NumericArrayType]> = (value, type) => {
	const [t, s, e] = type
	if (s === "v") return t === "u" ? encode_uvar_array(value) : encode_ivar_array(value)
	const
		typed_arr_constructor = typed_array_constructor_of(type as Exclude<NumericArrayType, "uv[]" | "iv[]">),
		bytesize = parseInt(s) as (1 | 2 | 4 | 8),
		is_native_endian = (e === "l" && env_le) || (e === "b" && !env_le) || bytesize === 1 ? true : false,
		typed_arr: TypedArray = typed_arr_constructor.from(value)
	if (typed_arr instanceof Uint8Array) return typed_arr
	const buf = new Uint8Array(typed_arr.buffer)
	if (is_native_endian) return buf
	else return swapEndianessFast(buf, bytesize)
}

/** unpack a numeric array (`number[]`) that's encoded in one of {@link NumericArrayType} byte representation. you must provide the `array_length` of the array being decoded, otherwise the decoder will unpack till the end of the buffer */
export const decode_number_array: DecodeFunc<number[], [type: NumericArrayType, array_length?: number]> = (buf, offset = 0, type, array_length?) => {
	const [t, s, e] = type
	if (s === "v") return t === "u" ? decode_uvar_array(buf, offset, array_length) : decode_ivar_array(buf, offset, array_length)
	const
		bytesize = parseInt(s) as (1 | 2 | 4 | 8),
		is_native_endian = (e === "l" && env_le) || (e === "b" && !env_le) || bytesize === 1 ? true : false,
		bytelength = array_length ? bytesize * array_length : undefined,
		array_buf = buf.slice(offset, bytelength ? offset + bytelength : undefined),
		array_bytesize = array_buf.length,
		typed_arr_constructor = typed_array_constructor_of(type as Exclude<NumericArrayType, "uv[]" | "iv[]">),
		typed_arr: TypedArray = new typed_arr_constructor(is_native_endian ? array_buf.buffer : swapEndianessFast(array_buf, bytesize).buffer)
	return [Array.from(typed_arr), array_bytesize]
}

/** pack a `number` in the provided {@link NumericType} byte representation */
export const encode_number: EncodeFunc<number, [type: NumericType]> = (value, type) => encode_number_array([value,], type as NumericArrayType)

/** unpack a `number` in the provided {@link NumericType} byte representation */
export const decode_number: DecodeFunc<number, [type: NumericType]> = (buf, offset = 0, type) => {
	const [value_arr, bytesize] = decode_number_array(buf, offset, type as NumericArrayType, 1)
	return [value_arr[0], bytesize]
}

/** `uvar` stands for unsigned variable-sized integer <br>
 * this number occupies a variable number of bytes to accomodate the integer that it's holding <br>
 * it uses the first bit of the octet (0bXYYYYYYY) to signal whether the integer carries on to the next byte (X == 1) or not (X == 0), <br>
 * and uses base 7 big endian encoding to read the data bytes (YYYYYYY) <br>
 * you can read more about it on [wikipedia](https://en.wikipedia.org/wiki/Variable-length_quantity). <br>
 * the following table lists the first few bounds of this encoding: <br>
 * | decimal          | unsigned big endian binary                  | unsigned variable binary         |
 * |------------------|---------------------------------------------|----------------------------------|
 * | 0                | 0b00000000 0b00000000 0b00000000 0b00000000 | 0b00000000                       |
 * | 127 = 2^7 - 1    | 0b00000000 0b00000000 0b00000000 0b01111111 | 0b01111111                       |
 * | 128 = 2^7        | 0b00000000 0b00000000 0b00000000 0b10000000 | 0b10000001 0b00000000            |
 * | 16383 = 2^14 - 1 | 0b00000000 0b00000000 0b00111111 0b11111111 | 0b11111111 0b01111111            |
 * | 16384 = 2^14     | 0b00000000 0b00000000 0b01000000 0b00000000 | 0b10000001 0b10000000 0b00000000 |
 * <br>
 * this encoding is especially useful for encoding the length of other variables as in their header (begining of their sequence)
*/
export const encode_uvar: EncodeFunc<number> = (value) => encode_uvar_array([value,])

/// the old implementation, which was designed for a single `number` and was easier to read, has been kept here for refence.
/*
const encode_uvar: EncodeFunc<number | bigint> = (value) => {
	value = BigInt(value) * (value >= 0 ? 1n : -1n) // converting to absolute value
	const lsb_to_msb: number[] = []
	do {
		lsb_to_msb.push(Number((value & 0b01111111n) + 0b10000000n))
		value >>= 7n
	} while (value > 0n)
	lsb_to_msb[0] &= 0b01111111
	return Uint8Array.from(lsb_to_msb.reverse())
}
*/

/** see {@link encode_uvar} */
export const decode_uvar: DecodeFunc<number> = (buf, offset = 0) => {
	const [value_arr, bytesize] = decode_uvar_array(buf, offset, 1)
	return [value_arr[0], bytesize]
}

/// the old implementation, which was designed for a single `number` and was easier to read, has been kept here for refence.
/*
const decode_uvar: DecodeFunc<number> = (buf, offset = 0) => {
	const offset_start = offset
	let
		byte: number,
		value: bigint = 0n
	do {
		byte = buf[offset++]
		value <<= 7n
		value += BigInt(byte & 0b01111111)
	} while (byte >> 7 === 1)
	return [Number(value), offset - offset_start]
}
*/

/** array encode version of {@link encode_ivar} */
export const encode_uvar_array: EncodeFunc<number[]> = (value) => {
	const
		len = value.length,
		bytes: number[] = []
	for (let i = 0; i < len; i++) {
		let v = value[i]
		v = v * (v >= 0 ? 1 : -1) // converting to absolute value
		const lsb_to_msb: number[] = []
		do {
			lsb_to_msb.push((v & 0b01111111) + 0b10000000)
			v >>= 7
		} while (v > 0)
		lsb_to_msb[0] &= 0b01111111
		bytes.push(...lsb_to_msb.reverse())
	}
	return Uint8Array.from(bytes)
}


/** array decode version of {@link decode_uvar} */
const decode_uvar_array: DecodeFunc<number[], [array_length?: number]> = (buf, offset = 0, array_length?) => {
	if (array_length === undefined) array_length = Infinity
	const
		array: number[] = [],
		offset_start = offset,
		buf_length = buf.length
	// this is a condensed version of {@link decode_uvar}
	let value = 0
	for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++]) {
		value <<= 7
		value += byte & 0b01111111
		if (byte >> 7 === 0) {
			array.push(value)
			array_length--
			value = 0
		}
	}
	offset--
	return [array, offset - offset_start]
}


/** `ivar` stands for signed variable-sized integer <br>
 * it's similar to `uvar` (see {@link encode_uvar}), except that in the first byte, the second-major bit `Z` of the octet (0b0ZYYYYYY), signals whether the number is positive (Z == 0), or negative (Z == 1) <br>
 * the following table lists the first few bounds of this encoding: <br>
 * | decimal             | signed big endian binary                    | signed variable binary           |
 * |---------------------|---------------------------------------------|----------------------------------|
 * |  0                  | 0b00000000 0b00000000 0b00000000 0b00000000 | 0b00000000 or 0b01000000         |
 * |  63 =   2^6 - 1     | 0b00000000 0b00000000 0b00000000 0b00111111 | 0b00111111                       |
 * | -63 = -(2^6 - 1)    | 0b00000000 0b00000000 0b00000000 0b11000001 | 0b01111111                       |
 * |  8191 =   2^13 - 1  | 0b00000000 0b00000000 0b00011111 0b11111111 | 0b10111111 0b01111111            |
 * | -8191 = -(2^13 - 1) | 0b00000000 0b00000000 0b11100000 0b00000001 | 0b11111111 0b01111111            |
 * <br>
*/
export const encode_ivar: EncodeFunc<number> = (value) => encode_ivar_array([value,])

/// the old implementation, which was designed for a single `number` and was easier to read, has been kept here for refence.
/*
const encode_ivar: EncodeFunc<number | bigint> = (value) => {
	const
		sign = value >= 0 ? 1n : -1n,
		lsb_to_msb: number[] = []
	value = BigInt(value) * sign // `val` is now positive
	while (value > 0b00111111n) {
		lsb_to_msb.push(Number((value & 0b01111111n) + 0b10000000n))
		value >>= 7n
	}
	lsb_to_msb.push(Number((value & 0b00111111n) | (sign == -1n ? 0b11000000n : 0b10000000n)))
	lsb_to_msb[0] &= 0b01111111
	return Uint8Array.from(lsb_to_msb.reverse())
}
*/

/** see {@link encode_ivar} */
export const decode_ivar: DecodeFunc<number> = (buf, offset = 0) => {
	const [value_arr, bytesize] = decode_ivar_array(buf, offset, 1)
	return [value_arr[0], bytesize]
}

/// the old implementation, which was designed for a single `number` and was easier to read, has been kept here for refence.
/*
const decode_ivar: DecodeFunc<number> = (buf, offset = 0) => {
	const offset_start = offset
	let
		byte: number = buf[offset++],
		sign: bigint = (byte & 0b01000000) > 0n ? -1n : 1n,
		value: bigint = BigInt(byte & 0b00111111)
	while (byte >> 7 === 1) {
		byte = buf[offset++]
		value <<= 7n
		value += BigInt(byte & 0b01111111)
	}
	value *= sign
	return [Number(value), offset - offset_start]
}
*/

/** array encode version of {@link encode_ivar} */
export const encode_ivar_array: EncodeFunc<number[]> = (value) => {
	const
		len = value.length,
		bytes: number[] = []
	for (let i = 0; i < len; i++) {
		let v = value[i]
		const
			sign = v >= 0 ? 1 : -1,
			lsb_to_msb: number[] = []
		v = v * sign // `v` is now positive
		while (v > 0b00111111) {
			lsb_to_msb.push((v & 0b01111111) + 0b10000000)
			v >>= 7
		}
		lsb_to_msb.push((v & 0b00111111) | (sign == -1 ? 0b11000000 : 0b10000000))
		lsb_to_msb[0] &= 0b01111111
		bytes.push(...lsb_to_msb.reverse())
	}
	return Uint8Array.from(bytes)
}


/** array decode version of {@link decode_ivar} */
export const decode_ivar_array: DecodeFunc<number[], [array_length?: number]> = (buf, offset = 0, array_length?) => {
	if (array_length === undefined) array_length = Infinity
	const
		array: number[] = [],
		offset_start = offset,
		buf_length = buf.length
	// this is a condensed version of {@link decode_ivar}
	let
		sign: (1 | 0 | -1) = 0,
		value: number = 0
	for (let byte = buf[offset++]; array_length > 0 && offset < buf_length + 1; byte = buf[offset++]) {
		if (sign === 0) {
			sign = (byte & 0b01000000) > 0 ? -1 : 1
			value = (byte & 0b00111111)
		} else {
			value <<= 7
			value += byte & 0b01111111
		}
		if (byte >> 7 === 0) {
			array.push(value * sign)
			array_length--
			sign = 0
			value = 0
		}
	}
	offset--
	return [array, offset - offset_start]
}
