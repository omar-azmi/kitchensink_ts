/** this (incomplete) submodule contains convenient utility functions for interacting with an S3 storage.
 *
 * - the implementation of *AWS Signature Version 4* http headers generator was adapted from amazon's guide:
 *   [`https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html`](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html)
 * - and the implementation of *AWS Signature Version 4* pre-signed url generator was adapted from this amazon guide:
 *   [`https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-param-auth.html`](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-param-auth.html)
 *
 * @module
*/
type HttpHeaderObject = Array<[key: string, value: string]> | Record<string, string>;
/** sorts and formats your query parameters, so that it's suitable for a signed aws request.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const
 * 	params_text_1 = queryParamsToString("http://localhost:9000/default/temp/hello_world.txt?attributes&max-keys=20"),
 * 	params_text_2 = queryParamsToString(new URL("http://localhost:9000/default/temp/hello_world.txt?attributes&max-keys=20")),
 * 	params_text_3 = queryParamsToString("?attributes&max-keys=20"),
 * 	params_text_4 = queryParamsToString("attributes&max-keys=20"),
 * 	params_text_5 = queryParamsToString(new URLSearchParams("?attributes&max-keys=20"))
 *
 * assertEquals(params_text_1, "attributes=&max-keys=20")
 * assertEquals(params_text_2, "attributes=&max-keys=20")
 * assertEquals(params_text_3, "attributes=&max-keys=20")
 * assertEquals(params_text_4, "attributes=&max-keys=20")
 * assertEquals(params_text_5, "attributes=&max-keys=20")
 * ```
*/
export declare const queryParamsToString: (params_or_url: URL | string | URLSearchParams) => string;
/** configuration options for the {@link s3SignHeadersV4} function. */
export interface S3SignHeadersV4Config<T = Record<string, string>> {
    /** query strings should go here instead of being part of the `pathname`.
     * moreover, it should *not* include the leading `"?"` query character, and boolean query keys should always be followed with an "=" equals sign
     * for instance, for the url "http://localhost:9000/default/temp/hello_world.txt?attributes&max-keys=20", the query string `"attributes=&max-keys=20"`
     *
     * [!note]
     * > amazon requires you to sort the query parameters by their key names, according to:
     * > [link](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html#:~:text=You%20must%20also%20sort%20the%20parameters).
     * > so the s3 signer functions perform the query-parameter sorting automatically.
     *
     * @defaultValue `undefined`
    */
    query?: string;
    /** provide the payload (`string` or `ArrayBuffer`) of your request's body so that the sha256 hash of it can be computed and signed as a part of the header.
     * you have various hashing options to choose from, based on what you provide:
     * - `string | ArrayBuffer`: this will be treated as the payload, and its SHA256 will be computed and appended to the `"x-amz-content-sha256"` key of your header.
     * - `{ sha256: string | ArrayBuffer }`: if you provide an object with the member `sha256`, then this value will be used, and no SHA256 computation of a payload will take place.
     *   this is useful if you have already computed the SHA256, or maybe you don't have the payload, but only its SHA256 is available to you.
     *   you can use the {@link sha256} helper function to compute the hash yourself.
     * - `{ unsigned: true }`: if you provide an object with the member `unsigned`, then it will be assumed that your request's body (payload) will not be cryptographically encrypted,
     *   and sent out without encryption. or maybe there is no payload to encrypt.
     *   under the hood, this option will set the `"x-amz-content-sha256"` header's value to `"UNSIGNED-PAYLOAD"`, which, I guess, understood by many S3 implementations.
     *
     * > [!note]
     * > GET requests do not have a body, thus their `payload` can be considered to be either an empty string (`""`), or `{ unsigned: true }`
     *
     * @defaultValue `{ unsigned: true }`
    */
    payload?: string | ArrayBuffer | {
        sha256: string | ArrayBuffer;
    } | {
        unsigned: true;
    };
    /** additional headers to include in your request.
     * you can use these headers to overwrite some of the following default/computed header fields (which are required to be part of the final header):
     * - `"host"`: the domain name/host server (without the http uri scheme).
     * - `"x-amz-date"`: the date and time the request was made (example: `"20240920T000000Z"`).
     *   also see the {@link date} field for setting a custom amazon formatted date and time.
     * - `"x-amz-content-sha256"`: the sha256 hash of the request's body.
     *   since a GET request cannot have a body, this is the sha256 of and empty string during a get request (default).
     *
     * @defaultValue `undefined`
    */
    headers?: T | HttpHeaderObject;
    /** use a custom date, based on what you provide:
     * - `number`: use a specific epoch time in milliseconds. for example: `1726790400000` (this comes from `new Date("2024-09-20T00:00:00Z").getTime()`).
     * - `"now"`: use `Date.now()` as the time.
     * - `string`: use an amazon formatted string date. example: `"20240920T000000Z"`.
     *
     * any of the value that you provide here is internally converted into an amazon formatted string date, which is required when signing.
     *
     * @defaultValue `"now"` - derived from the javascript runtime's `Date.now()`.
    */
    date?: "now" | number | string;
    /** name of the service being used. typically it is `"s3"`
     * @defaultValue `"s3"`
    */
    service?: string;
    /** which http method will you be using?
     * @defaultValue `"GET"`
    */
    method?: "GET" | "POST" | "HEAD" | "PUT";
    /** what is the region of the server? for locally hosted minio, use the default value.
     * @defaultValue `"us-east-1"`
    */
    region?: string;
}
/** configuration options for the {@link s3PresignUrlV4} function.
 * it has all of the options available to {@link S3SignHeadersV4Config}, in addition to a few more.
*/
export interface S3PresignUrlV4Config<T = Record<string, string>> extends S3SignHeadersV4Config<T> {
    /** specify how long, in seconds, the pre-signed url will be valid for.
     *
     * @defaultValue `3600` (i.e. 1 hour expiration time)
    */
    expires?: number;
    /** specify which url-scheme to use for the finalized url.
     *
     * @defaultValue `"https"`
    */
    scheme?: "http" | "https";
    /** don't attach a payload to your canonical presigned-url request,
     * because they are meant to accept arbitrary payloads
     * (unlike header-based singer, which can optionally use a signed payload).
     *
     * @defaultValue `{ unsigned: true }` (equivalent to `undefined`, and later equivalent to `"UNSIGNED-PAYLOAD"`)
    */
    payload?: undefined | {
        unsigned: true;
    };
}
/** this function computes the `Authentication` field for your S3 http request headers,
 * and then returns a header object (record) that can be used for an *AWS Signature Version 4* authenticated S3 server.
 *
 * @example
 * fetching some content from an S3 bucket (for instance, minio bucket).
 *
 * ```ts
 * const
 * 	method = "GET",
 * 	host = "localhost:9000",
 * 	pathname = "/bucket-name/object-name",
 * 	accessKey = "minioadmin",
 * 	secretKey = "minioadmin",
 * 	endpoint = `https://${host}${pathname}`
 *
 * const headers = s3SignHeadersV4(host, pathname, accessKey, secretKey, {
 * 	method,
 * 	headers: { "Content-Type": "text/plain" },
 * })
 *
 * // usage with fetch:
 * // const my_text_object = await (await fetch(s3_endpoint, { method, headers })).text()
 * ```
 *
 * @example
 * example usage for verifying against amazon's guide page:
 * [link](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html).
 *
 * ```ts
 * import { assert } from "jsr:@std/assert"
 *
 * const
 * 	AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE",
 * 	AWSSecretAccessKey = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY",
 * 	original_headers = { "raNGe": "bytes=0-9" }
 *
 * const signed_headers = await s3SignHeadersV4("examplebucket.s3.amazonaws.com", "/test.txt", AWSAccessKeyId, AWSSecretAccessKey, {
 * 	payload: "",
 * 	headers: original_headers,
 * 	date: "20130524T000000Z",
 * })
 *
 * // expected value: "AWS4-HMAC-SHA256 Credential=AKIAIOSFODNN7EXAMPLE/20130524/us-east-1/s3/aws4_request, SignedHeaders=host;range;x-amz-content-sha256;x-amz-date, Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"
 * const authfield = signed_headers.Authorization
 *
 * assert(authfield.startsWith("AWS4-HMAC-SHA256"))
 * assert(authfield.includes("Credential=" + AWSAccessKeyId))
 * assert(authfield.includes("SignedHeaders=host;range;x-amz-content-sha256;x-amz-date"))
 * assert(authfield.endsWith("Signature=f0e8bdb87c964420e857bd35b5d6ed310bd44f0170aba48dd91039c6036bdb41"))
 * ```
 *
 * @param host the domain name or host name of the server, not including the http uri scheme.
 *   for instance, for the url "http://localhost:9000/default/temp/hello_world.txt", the host is `"localhost:9000"`
 * @param pathname path of the location you wish to access.
 *   for instance, for the url "http://localhost:9000/default/temp/hello_world.txt", the pathname is `"/default/temp/hello_world.txt"`
 * @param accessKey access key or user's username
 * @param secretKey secret key or user's password
 * @param config additional optional configuration. see {@link S3SignHeadersV4Config} for details.
 * @returns returns the original headers with an added `"Authentication"` field.
 *   note that you modifying the returned headers will invalidate your authentication key.
 *   so you should compute it as the last thing before sending out the request.
*/
export declare const s3SignHeadersV4: <T = Record<string, string>>(host: string, pathname: string, accessKey: string, secretKey: string, config?: S3SignHeadersV4Config<T>) => Promise<T & {
    "Authorization": string;
}>;
/** this function computes a pre-signed url for an S3 request (via query parameters),
 * so that it is accepted by an S3 server that uses *AWS Signature Version 4* for authentication.
 *
 * @example
 * sharing an S3 bucket text-file-only upload link with with your client/friend.
 *
 * ```ts
 * const
 * 	method = "PUT",
 * 	host = "localhost:9000",
 * 	pathname = "/bucket-name/object-name",
 * 	accessKey = "minioadmin",
 * 	secretKey = "minioadmin",
 * 	endpoint = `https://${host}${pathname}`
 *
 * const presigned_url = await s3PresignUrlV4(host, pathname, accessKey, secretKey, {
 * 	scheme: "https",
 * 	method,
 * 	expires: 3600, // valid for 1 hour
 * 	// the addition of the canonical header below will force our client to only upload text files.
 * 	headers: { "Content-Type": "text/plain" },
 * })
 *
 * // this is how your client will now use the pre-signed url to upload/PUT a text file via fetch:
 * const is_client = false
 * if (is_client) {
 * 	const file_body = "hello world"
 * 	const s3_response = await fetch(presigned_url, {
 * 		method: "PUT",
 * 		headers: { "content-type": "text/plain" }, // header-keys are case-insensitive
 * 		body: file_body,
 * 	})
 * }
 * ```
 *
 * @example
 * example usage for verifying against amazon's guide page:
 * [link](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-string-auth.html).
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const
 * 	host = "examplebucket.s3.amazonaws.com",
 * 	pathname = "/test.txt",
 * 	AWSAccessKeyId = "AKIAIOSFODNN7EXAMPLE",
 * 	AWSSecretAccessKey = "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
 *
 * const presigned_url: string = await s3PresignUrlV4(host, pathname, AWSAccessKeyId, AWSSecretAccessKey, {
 * 	scheme: "https",
 * 	method: "GET",
 * 	expires: 86400, // valid for 24 hours
 * 	date: "20130524T000000Z",
 * })
 *
 * // expected value for `presigned_url`:
 * // "https://examplebucket.s3.amazonaws.com/test.txt?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=AKIAIOSFODNN7EXAMPLE%2F20130524%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Date=20130524T000000Z&X-Amz-Expires=86400&X-Amz-SignedHeaders=host&X-Amz-Signature=aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404"
 * const params = new URL(presigned_url).searchParams
 *
 * assertEquals(params.get("X-Amz-Algorithm"),     "AWS4-HMAC-SHA256")
 * assertEquals(params.get("X-Amz-Credential"),    `${AWSAccessKeyId}/20130524/us-east-1/s3/aws4_request`)
 * assertEquals(params.get("X-Amz-SignedHeaders"), "host")
 * assertEquals(params.get("X-Amz-Signature"),     "aeeed9bbccd4d02ee5c0109b86d86835f995330da4c265957d157751f604d404")
 * ```
 *
 * @param host the domain name or host name of the server, not including the http uri scheme.
 * @param pathname path of the location you wish to access.
 * @param accessKey access key or user's username
 * @param secretKey secret key or user's password
 * @param config additional optional configuration. see {@link S3PresignUrlV4Config} for details.
 * @returns returns a `string` representing the full pre-signed url.
*/
export declare const s3PresignUrlV4: <T = Record<string, string>>(host: string, pathname: string, accessKey: string, secretKey: string, config?: S3PresignUrlV4Config<T>) => Promise<string>;
export {};
//# sourceMappingURL=s3.d.ts.map