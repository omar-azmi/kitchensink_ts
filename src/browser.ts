/** utility functions for web browser interaction
 * @module
*/

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
