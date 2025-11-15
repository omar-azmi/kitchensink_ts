/** this (incomplete) submodule contains convenient utility functions for interacting with an S3 storage.
 *
 * - the implementation of *AWS Signature Version 4* http headers generator was adapted from amazon's guide:
 *   [`https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html`](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html)
 * - and the implementation of *AWS Signature Version 4* pre-signed url generator was adapted from this amazon guide:
 *   [`https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-param-auth.html`](https://docs.aws.amazon.com/AmazonS3/latest/API/sigv4-query-param-auth.html)
 *
 * @module
*/
import { object_entries, object_fromEntries, object_keys } from "./alias.js";
import { hmacSha256, hmacSha256Recursive, sha256 } from "./cryptoman.js";
import { hexStringOfArray } from "./stringman.js";
import { isArray, isString } from "./struct.js";
const httpHeadersToRecord = (headers) => (isArray(headers) ? object_fromEntries(headers) : headers);
/** get the keys of an http header object in alphabetically sorted order.
 *
 * @example
 * ```ts ignore
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const sorted_header_keys = getHttpHeaderKeys({
 * 	"host": "localhost:9000",
 * 	"X-AMZ-DATE": "20240920T000000Z",
 * 	"Algorithm": "AWS4-HMAC-SHA256",
 * 	"x-amz-content-sha256": "Blah Blah",
 * })
 *
 * assertEquals(
 * 	sorted_header_keys,
 * 	["algorithm", "host", "x-amz-content-sha256", "x-amz-date"],
 * )
 * ```
*/
const getHttpHeaderKeys = (headers) => {
    return object_keys(httpHeadersToRecord(headers))
        .map((key) => key.toLowerCase())
        .sort();
};
/** normalize and format an http header object.
 *
 * the following actions take place:
 * - the entries are sorted alphabetically by the key's name
 * - the keys are lowered in their casing
 * - the values have their leading and trailing empty spaces trimmed
 *
 * @example
 * ```ts ignore
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const header_text = httpHeadersToString({
 * 	"host": "localhost:9000",
 * 	"X-AMZ-DATE": "20240920T000000Z",
 * 	"Algorithm": "AWS4-HMAC-SHA256",
 * 	"x-amz-content-sha256": "Blah Blah",
 * })
 *
 * assertEquals(header_text, `
 * algorithm:AWS4-HMAC-SHA256
 * host:localhost:9000
 * x-amz-content-sha256:Blah Blah
 * x-amz-date:20240920T000000Z
 * `.trim())
 * ```
*/
const httpHeadersToString = (headers) => {
    // convert header to a key-value record object if it isn't already
    headers = httpHeadersToRecord(headers);
    // lower the case of all keys, and trim spacing from all values
    headers = object_fromEntries(object_entries(headers).map(([key, value]) => [key.toLowerCase(), value.trim()]));
    // sort the keys and then map the key-value pairs as "${key}:${value}", then join them with line breaks
    return getHttpHeaderKeys(headers)
        .map((key) => (key + ":" + headers[key]))
        .join("\n");
};
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
export const queryParamsToString = (params_or_url) => {
    if (isString(params_or_url)) {
        try {
            params_or_url = new URL(params_or_url);
        }
        catch (err) {
            params_or_url = new URLSearchParams(params_or_url);
        }
    }
    if (params_or_url instanceof URL) {
        params_or_url = params_or_url.searchParams;
    }
    // for a signed aws request, the parameters need to be sorted,
    // and the common "+" character used for blank space needs in query parameters must be replaced with "%20".
    params_or_url.sort();
    return params_or_url.toString().replace("+", "%20");
};
const aws4RequestScope = "aws4_request", defaultS3SignHeadersV4Config = {
    query: "", headers: {}, date: "now", service: "s3",
    payload: { unsigned: true }, method: "GET", region: "us-east-1",
}, defaultS3PresignUrlV4Config = {
    ...defaultS3SignHeadersV4Config,
    expires: 3600, scheme: "https", payload: { unsigned: true },
}, hexStringOfArray_config = { bra: "", ket: "", prefix: "", sep: "", toUpperCase: false };
/** convert an `ArrayBuffer` to hex `string`. */
const bufferToHex = (buffer) => {
    // return new Uint8Array(buffer).toHex() // TODO FUTURE: uncomment once deno updates its typedefinitions.
    return hexStringOfArray(new Uint8Array(buffer), hexStringOfArray_config);
};
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
export const s3SignHeadersV4 = async (host, pathname, accessKey, secretKey, config) => {
    const { query, headers: additionalHeaders, date, service, payload, method, region } = { ...defaultS3SignHeadersV4Config, ...config }, amzDate = (date === "now" || typeof date === "number")
        ? (new Date(date === "now" ? Date.now() : date)).toISOString().replace(/[:-]|\.\d{3}/g, "") // e.g., "20240920T000000Z"
        : date, dateStamp = amzDate.slice(0, 8), // e.g., "20240920"
    payloadHashBuffer = (typeof payload === "string" || payload instanceof ArrayBuffer)
        ? await sha256(payload)
        : "sha256" in payload
            ? payload.sha256
            : "UNSIGNED-PAYLOAD", payloadHash = payloadHashBuffer instanceof ArrayBuffer ? bufferToHex(payloadHashBuffer) : payloadHashBuffer;
    // task 1: create a canonical request
    const 
    // payloadHash = "UNSIGNED-PAYLOAD", // "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", // TODO: this value comes from `forge.md.sha256.create().update('').digest().toHex()`. but also try `"UNSIGNED-PAYLOAD"`
    canonicalHeaders = {
        "host": host,
        "x-amz-date": amzDate,
        "x-amz-content-sha256": payloadHash,
        ...httpHeadersToRecord(additionalHeaders),
    }, canonicalQueryParams = queryParamsToString(query), signedHeaders = getHttpHeaderKeys(canonicalHeaders).join(";"), canonicalRequest = [
        method, pathname, canonicalQueryParams,
        httpHeadersToString(canonicalHeaders),
        "", signedHeaders, payloadHash,
    ].join("\n");
    // task 2: create a string to sign
    const algorithm = "AWS4-HMAC-SHA256", credentialScope = [dateStamp, region, service, aws4RequestScope].join("/"), stringToSign = [algorithm, amzDate, credentialScope, bufferToHex(await sha256(canonicalRequest))].join("\n");
    // task 3a: calculate the signing Key
    const signingKey = await hmacSha256Recursive("AWS4" + secretKey, dateStamp, region, service, aws4RequestScope);
    // task 3b: calculate signature
    const signature = bufferToHex(await hmacSha256(signingKey, stringToSign));
    // task 4a: prepare the authorization header
    const authorizationHeader = `${algorithm} Credential=${accessKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;
    // task 4b: make the fetch request with signed headers
    const headers = {
        ...canonicalHeaders,
        "Authorization": authorizationHeader,
    };
    return headers;
};
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
export const s3PresignUrlV4 = async (host, pathname, accessKey, secretKey, config) => {
    const { query, headers: additionalHeaders, date, service, method, region, expires, scheme } = { ...defaultS3PresignUrlV4Config, ...config }, amzDate = (date === "now" || typeof date === "number")
        ? (new Date(date === "now" ? Date.now() : date)).toISOString().replace(/[:-]|\.\d{3}/g, "") // e.g., "20240920T000000Z"
        : date, dateStamp = amzDate.slice(0, 8), // e.g., "20240920"
    // as stated in the specs, you don't include an additional payload hash in the canonical request,
    // because the url is meant to be used for uploading arbitrary payloads, for which the hash cannot be known before hand.
    payloadHash = "UNSIGNED-PAYLOAD";
    // task 1: create a canonical request
    const 
    // unlike the header-based signer, the query-based signature only requires the `host` to be part of the required headers.
    // "x-amz-date" and "x-amz-content-sha256" are not in the headers.
    canonicalHeaders = {
        "host": host,
        ...httpHeadersToRecord(additionalHeaders),
    }, signedHeaders = getHttpHeaderKeys(canonicalHeaders).join(";"), credentialScope = [dateStamp, region, service, aws4RequestScope].join("/"), algorithm = "AWS4-HMAC-SHA256", queryParams = new URLSearchParams(query);
    queryParams.set("X-Amz-Algorithm", algorithm);
    queryParams.set("X-Amz-Credential", `${accessKey}/${credentialScope}`);
    queryParams.set("X-Amz-Date", amzDate);
    queryParams.set("X-Amz-Expires", expires.toFixed(0));
    queryParams.set("X-Amz-SignedHeaders", signedHeaders);
    const canonicalQueryParams = queryParamsToString(queryParams), canonicalRequest = [
        method, pathname, canonicalQueryParams,
        httpHeadersToString(canonicalHeaders),
        "", signedHeaders, payloadHash,
    ].join("\n");
    // task 2: create a string to sign
    const stringToSign = [algorithm, amzDate, credentialScope, bufferToHex(await sha256(canonicalRequest))].join("\n");
    // task 3a: calculate the signing key
    const signingKey = await hmacSha256Recursive("AWS4" + secretKey, dateStamp, region, service, aws4RequestScope);
    // task 3b: calculate signature
    const signature = bufferToHex(await hmacSha256(signingKey, stringToSign));
    // task 4: create the finalized presigned url.
    // here, after appending the authorization signature to the canonical query,
    // there's no need for re-sorting the query parameters again, as the added signature is not a part of the canonical request.
    const authorizedQueryParams = canonicalQueryParams + "&X-Amz-Signature=" + signature, presignedUrl = `${scheme}://${host}${pathname}?${authorizedQueryParams}`;
    return presignedUrl;
};
