/** utility functions for web browser interaction
 * @module
*/
/** create a blob out of your `Uint8Array` bytes buffer and queue it for downloading. <br>
 * you can also provide an optional `file_name` and `mime_type` <br>
 * technically, you can download any kind of data, so long as your `mime_type` and `data` pair match within the capabilities of your the browser's internal blob encoder <br>
*/
export declare const downloadBuffer: (data: Uint8Array | string | any, file_name?: string, mime_type?: string) => void;
/** convert a blob to base64 string, with the data header included. <br>
 * use {@link blobToBase64Split} to get a 2-tuple with the data header split from the data body <br>
 * or use {@link blobToBase64Body} to get just the body of the data <br>
 * this function works correctly all the time, unlike `btoa`, which fails for arbitrary bytes
*/
export declare const blobToBase64: (blob: Blob) => Promise<string>;
/** convert a blob to base64 string with the header and body separated as a 2-tuple. <br> */
export declare const blobToBase64Split: (blob: Blob) => Promise<[string, string]>;
/** convert a blob to base64 string with the header omitted. <br> */
export declare const blobToBase64Body: (blob: Blob) => Promise<string>;
/** convert a base64 encoded string (no header) into a `Uint8Array` bytes containing the binary data
 * see {@link bytesToBase64Body} for the reverse
*/
export declare const base64BodyToBytes: (data_base64: string) => Uint8Array;
/** encode data bytes into a base64 string (no header)
 * see {@link base64BodyToBytes} for the reverse
*/
export declare const bytesToBase64Body: (data_buf: Uint8Array) => string;
