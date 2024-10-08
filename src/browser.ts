/** utility functions for web browser interaction.
 * 
 * @module
*/

import { bind_string_charCodeAt } from "./binder.ts"
import { string_fromCharCode } from "./builtin_aliases_deps.ts"

/** create a blob out of your `Uint8Array` bytes buffer and queue it for downloading. <br>
 * you can also provide an optional `file_name` and `mime_type` <br>
 * technically, you can download any kind of data, so long as your `mime_type` and `data` pair match within the capabilities of your the browser's internal blob encoder <br>
*/
export const downloadBuffer = (data: Uint8Array | string | any, file_name: string = "data.bin", mime_type: string = "application/octet-stream") => {
	const
		blob = new Blob([data], { type: mime_type }),
		anchor = document.createElement("a")
	anchor.href = URL.createObjectURL(blob)
	anchor.download = file_name
	anchor.click()
	URL.revokeObjectURL(anchor.href) // saves up memory after the user has used the data URL
	anchor.remove() // removethe un-needed node
}

/** convert a blob to base64 string, with the data header included. <br>
 * use {@link blobToBase64Split} to get a 2-tuple with the data header split from the data body <br>
 * or use {@link blobToBase64Body} to get just the body of the data <br>
 * this function works correctly all the time, unlike `btoa`, which fails for arbitrary bytes
*/
export const blobToBase64 = (blob: Blob): Promise<string> => {
	const reader = new FileReader()
	return new Promise<string>((resolve, reject) => {
		reader.onload = () => resolve(reader.result as string)
		reader.onerror = reject
		reader.readAsDataURL(blob)
	})
}

/** convert a blob to base64 string with the header and body separated as a 2-tuple. <br> */
export const blobToBase64Split = (blob: Blob): Promise<[string, string]> => blobToBase64(blob).then((str_b64: string) => {
	const [head, body] = str_b64.split(";base64,", 2) as [string, string]
	return [head + ";base64,", body]
})

/** convert a blob to base64 string with the header omitted. <br> */
export const blobToBase64Body = (blob: Blob): Promise<string> => blobToBase64Split(blob).then((b64_tuple: [string, string]) => b64_tuple[1])

/** convert a base64 encoded string (no header) into a `Uint8Array` bytes containing the binary data
 * see {@link bytesToBase64Body} for the reverse
*/
export const base64BodyToBytes = (data_base64: string): Uint8Array => {
	const
		data_str = atob(data_base64),
		len = data_str.length,
		data_str_charCodeAt = bind_string_charCodeAt(data_str),
		data_buf = new Uint8Array(len)
	for (let i = 0; i < len; i++) { data_buf[i] = data_str_charCodeAt(i) }
	return data_buf
}

/** encode data bytes into a base64 string (no header)
 * see {@link base64BodyToBytes} for the reverse
*/
export const bytesToBase64Body = (data_buf: Uint8Array): string => {
	// here, we use `String.fromCharCode` to convert numbers to their equivalent binary string encoding. ie: `String.fromCharCode(3, 2, 1) === "\x03\x02\x01"`
	// however, most browsers only allow a maximum number of function argument to be around `60000` to `65536`, so we play it safe here by picking around 33000
	// we must also select a `max_args` such that it is divisible by `6`, because we do not want any trailing "=" or "==" to appear in the middle of our base64
	// encoding where we've split the data.
	const
		max_args = 2 ** 15 - 2 as 32766,
		data_str_parts: string[] = []
	for (let i = 0; i < data_buf.length; i += max_args) {
		const sub_buf = data_buf.subarray(i, i + max_args)
		data_str_parts.push(string_fromCharCode(...sub_buf))
	}
	return btoa(data_str_parts.join(""))
}
