/** utility functions for web browser interaction
 * @module
*/

/** create a blob out of your `Uint8Array` bytes buffer and queue it for downloading. <br>
 * you can also provide an optional `file_name` and `mime_type`
*/
export const downloadBuffer = async (buf: Uint8Array, file_name: string = "data.bin", mime_type: string = "application/octet-stream") => {
	const
		blob = new Blob([buf], { type: mime_type }),
		anchor = document.createElement("a")
	anchor.href = window.URL.createObjectURL(blob)
	anchor.download = file_name
	anchor.click()
}
