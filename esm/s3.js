/** this (incomplete) submodule contains convenient utility functions for interacting with an S3 storage.
 *
 * the implementation of *AWS Signature Version 4* http headers generator was adapted from amazon's guide:
 * [`https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html`](https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html)
 *
 * @module
*/
import { object_entries, object_fromEntries, object_keys } from "./alias.js";
import { hmacSha256, hmacSha256Recursive, sha256 } from "./cryptoman.js";
import { hexStringOfArray } from "./stringman.js";
import { isArray } from "./struct.js";
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
const aws4RequestScope = "aws4_request", defaultSignedHeadersConfig = {
    query: "", headers: {}, date: "now", service: "s3",
    payload: { unsigned: true }, method: "GET", region: "us-east-1",
}, hexStringOfArray_config = { bra: "", ket: "", prefix: "", sep: "", toUpperCase: false };
/** convert an `ArrayBuffer` to hex `string`. */
const bufferToHex = (buffer) => {
    // return new Uint8Array(buffer).toHex() // TODO FUTURE: uncomment once deno updates its typedefinitions.
    return hexStringOfArray(new Uint8Array(buffer), hexStringOfArray_config);
};
/** this function computes the `Authentication` field for your http request headers,
 * so that it is accepted by an S3 server that uses *AWS Signature Version 4* for authentication.
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
    const { query, headers: additionalHeaders, date, service, payload, method, region } = { ...defaultSignedHeadersConfig, ...config }, amzDate = (date === "now" || typeof date === "number")
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
    }, signedHeaders = getHttpHeaderKeys(canonicalHeaders).join(";"), canonicalRequest = [method, pathname, query, httpHeadersToString(canonicalHeaders), "", signedHeaders, payloadHash].join("\n");
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
