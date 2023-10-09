/** utility functions for web browser interaction <br>
 * TODO: move higher order functions to a new submodule `lambda.ts`
 * @module
*/

import { date_now, dom_clearTimeout, dom_setTimeout, promise_resolve, string_fromCharCode } from "./builtin_aliases_deps.ts"

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
		data_buf = new Uint8Array(len)
	for (let i = 0; i < len; i++) data_buf[i] = data_str.charCodeAt(i)
	return data_buf
}

/** encode data bytes into a base64 string (no header)
 * see {@link base64BodyToBytes} for the reverse
*/
export const bytesToBase64Body = (data_buf: Uint8Array): string => {
	// here, we use `String.fromCharCode` to convert numbers to their equivalent binary string encoding. ie: `String.fromCharCode(3, 2, 1) === "\x03\x02\x01"`
	// however, most browsers only allow a maximum number of function agument to be around `60000` to `65536`, so we play it safe here by picking around 33000
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

/** creates a debounced version of the provided function that returns a new promise. <br>
 * the debounced function delays the execution of the provided function `fn` until the debouncing interval `wait_time_ms` amount of time has passed without any subsequent calls. <br>
 * if a `rejection_value` is provided, then any subsequent calls to the debounced function that are made within the debouncing interval, will reject the previous promises.
 * thus you will have to `catch` them in that case. (otherwise it will result in an error) <br>
 * you may worry that too many calls to a non-rejectable debounced function (i.e. when `rejection_value === undefined`)
 * will create too many promise objects, possibly resulting in memory leaks.
 * however, luckily, modern javscript engines are not afflicted by too many pending promise objects.
 * in fact, choosing to reject promises (i.e. by setting `rejection_value`), might be more expensive down the line, as error catching is typically expensive. <br>
 * also check out {@link debounceAndShare}, which avoids this "lots of promise objects" issue by sharing the same promise across all quick callers of the debounce.
 * but it will require careful usage, as all promised callers will eventually get resolved, which may create an unintended avalaunch of subsequent `then` calls if not used carefully.
 * 
 * @param wait_time_ms the time interval in milliseconds for debouncing
 * @param fn the function to be debounced
 * @param rejection_value if a rejection value is provided, then old unresolved pending promises will be rejected with the given value,
 * 	 when a new call to the debounced function is made (within the debouncing waiting period)
 * @returns a function (that takes arguments intended for `fn`) that returns a promise, which is resolved once `wait_time_ms` amount of time has passed with no further calls
 * 
 * @example
 * ```ts
 * // assume that `sleep(time_ms: number)` is a function that synchronously creates a delay for `time_ms` number of milliseconds
 * const fn = (v: number) => {
 * 	console.log(v)
 * 	return v + 100
 * }
 * const debounced_fn = debounce(1000, fn, "SEPPUKU!")
 * // `a` is a promise that should resolve after 1000ms
 * const a = debounced_fn(24).catch((reason) => { console.log("they want me to ", reason) })
 * sleep(500)
 * // `debounced_fn(42)` rejects `a`'s promise and then returns a new promise (`b`) that will resolve in 1000ms
 * // when `debounced_fn(42)` is called this quickly, promise `a` is first rejected, which results in immediate logging of `"they want me to SEPPUKU!"` in the console
 * const b debounced_fn(42)
 * // then, 1000ms later, you should see "42" in your console (due to promise `b`)
 * sleep(2000)
 * c = debounced_fn(99) // Returns a new promise that resolves after 1000ms
 * // 1000ms later, you should see "99" in your console
 * ```
*/
export const debounce = <T extends any, ARGS extends any[], REJ>(
	wait_time_ms: number,
	fn: (...args: ARGS) => T,
	rejection_value?: REJ,
): ((...args: ARGS) => Promise<T>) => {
	let
		prev_timer: number,
		prev_reject: (reason: REJ) => void = () => { }
	return (...args) => {
		dom_clearTimeout(prev_timer)
		if (rejection_value) { prev_reject(rejection_value) }
		return new Promise((resolve, reject) => {
			prev_reject = reject
			prev_timer = dom_setTimeout(
				() => resolve(fn(...args)),
				wait_time_ms,
			)
		})
	}
}

/** creates a debounced version of the provided function that returns a shared promise. <br>
 * unlike conventional {@link debounce}, this function reuses and returns the same promise object for all calls that are made within the debouncing interval. <br>
 * this means that all callers within this interval will receive the same promise, which will be resolved once `wait_time_ms` amount of time has passed with no further calls. <br>
 * if subsequent calls are made within the debouncing interval, the debounced function will return the same promise as before, further delaying its resolution. <br>
 * however, once the debouncing interval has elapsed and the promise is resolved, any new calls to the debounced function will create and return a new promise.
 * 
 * @param wait_time_ms the time interval in milliseconds for debouncing
 * @param fn the function to be debounced
 * @returns a function (that takes arguments intended for `fn`) that returns a promise, which is resolved once `wait_time_ms` amount of time has passed with no further calls
 * 
 * @example
 * ```ts
 * // assume that `sleep(time_ms: number)` is a function that synchronously creates a delay for `time_ms` number of milliseconds
 * const fn = (v: number) => {
 * 	console.log(v)
 * 	return v + 100
 * }
 * const debounced_fn = debounceAndShare(1000, fn)
 * const a = debounced_fn(24) // returns a promise that resolves after 1000ms
 * sleep(500)
 * const b debounced_fn(42) // returns the same promise as before, but its resolution is delayed by another 1000ms
 * // 1000ms later, you should see "42" in your console
 * sleep(2000)
 * c = debounced_fn(99) // Returns a new promise that resolves after 1000ms
 * // 1000ms later, you should see "99" in your console
 * // notice that the promises made within the debounce interval are the same pomise objects (ie `a === b`)
 * // however, once out of that interval, an entirely new promise is generated (ie `b !== c`)
 * ```
*/
export const debounceAndShare = <T extends any, ARGS extends any[]>(
	wait_time_ms: number,
	fn: (...args: ARGS) => T,
): ((...args: ARGS) => Promise<T>) => {
	let
		prev_timer: undefined | number,
		current_resolve: (value: T | PromiseLike<T>) => void,
		current_promise: Promise<T>

	const swap_current_promise_with_a_new_one = (value?: T): T => {
		current_promise = new Promise<T>(
			(resolve, reject) => (current_resolve = resolve)
		).then(swap_current_promise_with_a_new_one)
		return value!
	}
	swap_current_promise_with_a_new_one()

	return (...args: ARGS) => {
		dom_clearTimeout(prev_timer)
		prev_timer = dom_setTimeout(
			() => (current_resolve(fn(...args))),
			wait_time_ms
		)
		return current_promise
	}
}

export const THROTTLE_REJECT = /*@__PURE__*/ Symbol("a rejection by a throttled function")

/** blocks the execution of `fn`, if less than `delta_time_ms` amount of time has passed since the previous non-rejected call. <br>
 * @param delta_time_ms the time interval in milliseconds for throttling
 * @param fn the function to be throttled
 * @returns a function (that takes arguments intended for `fn`) that returns the value of `fn` if it was not throttled, otherwise a {@link THROTTLE_REJECT} symbol is returned.
*/
export const throttle = <T extends any, ARGS extends any[]>(
	delta_time_ms: number,
	fn: (...args: ARGS) => T,
): ((...args: ARGS) => T | typeof THROTTLE_REJECT) => {
	let last_call = 0
	return (...args: ARGS) => {
		const time_now = date_now()
		if (time_now - last_call > delta_time_ms) {
			last_call = time_now
			return fn(...args)
		}
		return THROTTLE_REJECT
	}
}

/** a throttle function, similar to {@link throttle}, that also insures that the __final__ call (aka trailing call) made to the throttled function __always__ resolves eventually. <br>
 * this is useful in cases where it is of utmost importance that the throttled function is called one last time with before a prolonged delay. <br>
 * the following visual illustration shows the difference between the regular {@link throttle}, and {@link throttleAndTrail} functions: <br>
 * - `throttleAndTrail`: `fn` throttled with `trailing_time_ms = 1500`, and `delta_time_ms = 1000`.
 *   as you can see below, the trailing calls to the throttled function do get resolved eventually
 * ```text
 * │time    │         ╭╶╶╮ 1.2            2.7   3.3            4.8 5.2         
 * ├────────│       ╭╶┤  │ ┌───(delayed)──┐     ┌───(delayed)──┐   (rejected)  
 * │        │    ╭╶╶┤ │  │ │              ▼   ╭╶┤              ▼   ╭╶╶╶╶╶╶╶╮   
 * │resolved│  o ▼  ▼ ▼  o │              o o ▼ │              o o ▼       o   
 * │rejected│  │ x  x x  │ │                │ x │                │ x       │   
 * │calls───┼──┴─┴──┴─┴──┴─┴────────────────┴─┴─┴────────────────┴─┴───────┴──►
 * │time    │  0         1         2         3         4         5         6   
 * ```
 * 
 * - `throttle`: `fn` throttled with `delta_time_ms = 1000`.
 *   as you can see below, the final call to the throttled function gets rejected, because it was called too quickly
 * ```text
 * │resolved│  o         o                  o                      
 * │rejected│  │ x  x x  │ x                │ x x                  
 * │calls───├──┴─┴──┴─┴──┴─┴────────────────┴─┴─┴─────────────────►
 * │time    │  0         1         2         3         4         5 
 * ```
 * 
 * @param trailing_time_ms the time in milliseconds after which a trailing (pending) call to the function gets resolved if no other calls are made during that time interval.
 *   you would definitely want this to be some value greater than {@link delta_time_ms}, otherwise it will be weird because if this value is smaller, then `trailing_time_ms`
 *   will become the "effective" throttling time interval, but also one that always resolved later rather than immediately.
 * @param delta_time_ms the time interval in milliseconds for throttling
 * @param fn the function to be throttled
 * @param rejection_value if a rejection value is provided, then old unresolved pending promises will be rejected with the given value,
 * 	 when a new call to the throttled function is made within the {@link trailing_time_ms} waiting period
 * @returns a function (that takes arguments intended for `fn`) that returns a `Promise` to the value of `fn` if it is resolved (i.e. not throttled or when trailing),
 *   otherwise if throttled, then that promise will either be never be resolved, or rejected based on if a {@link rejection_value} was provided.
*/
export const throttleAndTrail = <T extends any, ARGS extends any[], REJ>(
	trailing_time_ms: number,
	delta_time_ms: number,
	fn: (...args: ARGS) => T,
	rejection_value?: REJ,
): ((...args: ARGS) => Promise<T>) => {
	let
		prev_timer: number,
		prev_reject: (reason: REJ) => void = () => { }

	const throttled_fn = throttle(delta_time_ms, fn)
	return (...args: ARGS) => {
		dom_clearTimeout(prev_timer)
		if (rejection_value) { prev_reject(rejection_value) }
		const result = throttled_fn(...args)
		if (result === THROTTLE_REJECT) {
			return new Promise<T>((resolve, reject) => {
				prev_reject = reject
				prev_timer = dom_setTimeout(
					() => resolve(fn(...args)),
					trailing_time_ms,
				)
			})
		}
		return promise_resolve(result)
	}
}
