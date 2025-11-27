/** this submodule contains _promise_, _task_, and _scheduling_ related utility functions.
 * 
 * @module
*/

import { date_now, dom_clearTimeout, dom_setTimeout, promise_outside, promise_resolve } from "./alias.ts"
import { DEBUG } from "./deps.ts"
import type { MaybePromiseLike } from "./typedefs.ts"


/** this is a re-export of {@link promise_outside}.
 * 
 * {@inheritDoc promise_outside}
*/
export const promiseOutside = promise_outside

/** a promise that resolves (or rejects if `should_reject = true`) after a certain number of milliseconds.
 * 
 * this is a useful shorthand for creating delays, and then following them up with a `.then` call.
 * you may also use this as a sleep/wait function in an async context where `await` is available.
*/
export const promiseTimeout = (
	wait_time_ms: number,
	should_reject?: boolean
): Promise<typeof TIMEOUT> => {
	return new Promise<typeof TIMEOUT>((resolve, reject) => {
		dom_setTimeout(should_reject ? reject : resolve, wait_time_ms, TIMEOUT)
	})
}

/** a special symbol that signifies when a throttle function
 * (such as {@link throttle} and {@link throttleAndTrail})
 * has rejected to run a function, due to calling rate throttling.
*/
export const THROTTLE_REJECT = /*@__PURE__*/ Symbol(DEBUG.MINIFY || "a rejection by a throttled function")

/** a special symbol that signifies when a timeout function (such as {@link promiseTimeout}) has timed out. */
export const TIMEOUT = /*@__PURE__*/ Symbol(DEBUG.MINIFY || "a timeout by an awaited promiseTimeout function")

/** creates a debounced version of the provided function that returns a new promise.
 * 
 * the debounced function delays the execution of the provided function `fn` until the debouncing interval `wait_time_ms` amount of time has passed without any subsequent calls.
 * 
 * if a `rejection_value` is provided, then any subsequent calls to the debounced function that are made within the debouncing interval, will reject the previous promises.
 * thus you will have to `catch` them in that case (otherwise it will result in an error).
 * 
 * you may worry that too many calls to a non-rejectable debounced function (i.e. when `rejection_value === undefined`)
 * will create too many promise objects, possibly resulting in memory leaks.
 * however, luckily, modern javascript engines are not afflicted by too many pending promise objects.
 * in fact, choosing to reject promises (i.e. by setting `rejection_value`), might be more expensive down the line, as error catching is typically expensive.
 * 
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
 * import {
 * 	assertEquals as assertEq,
 * 	assertLessOrEqual as assertLe,
 * 	assertGreaterOrEqual as assertGe,
 * } from "jsr:@std/assert"
 * 
 * // a function that creates an asynchronous delay of the given number of milliseconds
 * const sleep = (time_ms: number) => (new Promise((resolve) => (setTimeout(resolve, time_ms))))
 * 
 * const
 * 	log_history: Array<[time: number, value: number]> = [],
 * 	error_history: Array<[time: number, message: string]> = [],
 * 	t0 = performance.now(),
 * 	current_time = () => (performance.now() - t0)
 * 
 * // the function that we plan to debounce
 * const fn = (v: number) => {
 * 	log_history.push([current_time(), v])
 * 	return v + 100
 * }
 * 
 * // the debounced version of `fn`, that, when called too quickly, rejects with the reason `"SEPPUKU!"`.
 * const debounced_fn = debounce(1000, fn, "SEPPUKU!")
 * 
 * // `a` is a promise that should resolve after 1000ms. but if it fails (which it will), it will log to `error_history`.
 * const a = debounced_fn(24).catch(
 * 	(reason) => { error_history.push([current_time(), `they want me to ${reason}`]) }
 * )
 * 
 * await sleep(500) // promise `a` is still pending after the 500ms sleep
 * 
 * // the new `debounced_fn(42)` below rejects `a`'s promise, and then returns a new promise (`b`) that will resolve in 1000ms.
 * // since `a` gets rejected as a consequence, it's error handling chain will immediately log `"they want me to SEPPUKU!"` in the console.
 * const b = debounced_fn(42)
 * 
 * // we delay for a tiny while in order for the js-runtime to get `a` rejected. otherwise, without the sleep, `error_history` will be empty.
 * await sleep(50)
 * assertEq(log_history, [])
 * assertGe(error_history[0][0], 499)
 * assertLe(error_history[0][0], 540)
 * assertEq(error_history[0][1], "they want me to SEPPUKU!")
 * 
 * // after 1000ms, the value `42` will be logged into `log_history` (due to promise `b`).
 * // however, no entry will be logged by `a`, since it gets rejected as soon as `b` is created.
 * await sleep(1000)
 * assertGe(log_history[0][0], 500 + 999)
 * assertLe(log_history[0][0], 500 + 1040)
 * assertEq(log_history[0][1], 42)
 * assertEq(await b, 100 + 42)
 * 
 * // we can now safely create a new debounced call without rejecting the already resolved `b` promise, since it is over 1000ms since `b` was created.
 * const c = debounced_fn(99)
 * 
 * // 1000ms later, the value `99` will be logged into `log_history` (due to promise `c`).
 * await sleep(1050)
 * assertGe(log_history[1][0], 1550 + 999)
 * assertLe(log_history[1][0], 1550 + 1100)
 * assertEq(log_history[1][1], 99)
 * assertEq(await c, 100 + 99)
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
		if (rejection_value !== undefined) { prev_reject(rejection_value) }
		return new Promise((resolve, reject) => {
			prev_reject = reject
			prev_timer = dom_setTimeout(
				() => resolve(fn(...args)),
				wait_time_ms,
			)
		})
	}
}

/** creates a debounced version of the provided function that returns a shared promise.
 * 
 * unlike conventional {@link debounce}, this function reuses and returns the same promise object for all calls that are made within the debouncing interval.
 * this means that all callers within this interval will receive the same promise, which will be resolved once `wait_time_ms` amount of time has passed with no further calls.
 * 
 * if subsequent calls are made within the debouncing interval, the debounced function will return the same promise as before, further delaying its resolution.
 * however, once the debouncing interval has elapsed and the promise is resolved, any new calls to the debounced function will create and return a new promise.
 * 
 * @param wait_time_ms the time interval in milliseconds for debouncing
 * @param fn the function to be debounced
 * @returns a function (that takes arguments intended for `fn`) that returns a promise, which is resolved once `wait_time_ms` amount of time has passed with no further calls
 * 
 * @example
 * ```ts
 * import {
 * 	assertEquals as assertEq,
 * 	assertLessOrEqual as assertLe,
 * 	assertGreaterOrEqual as assertGe,
 * } from "jsr:@std/assert"
 * 
 * // a function that creates an asynchronous delay of the given number of milliseconds
 * const sleep = (time_ms: number) => (new Promise((resolve) => (setTimeout(resolve, time_ms))))
 * 
 * const
 * 	log_history: Array<[time: number, value: number]> = [],
 * 	t0 = performance.now(),
 * 	current_time = () => (performance.now() - t0)
 * 
 * // the function that we plan to apply shareable-debouncing to
 * const fn = (v: number) => {
 * 	log_history.push([current_time(), v])
 * 	return v + 100
 * }
 * 
 * // the debounced version of `fn`, that, when called too quickly, shares the existing promise, and prolongs its resolution by the wait time
 * const debounced_fn = debounceAndShare(1000, fn)
 * 
 * // `a` is a promise that should resolve after 1000ms since the last interruption call to `debounced_fn` (i.e. 1000ms from now).
 * const a = debounced_fn(24)
 * 
 * await sleep(500) // promise `a` is still pending after the 500ms sleep
 * 
 * // since `a` has not been resolved yet, calling `debounced_fn` again to construct `b` will result in the reusage of the old existing promise `a`.
 * // in addition, due to the interuptive call, the resolution of the `a` and `b` promises will be delayed by another 1000ms from here on.
 * const b = debounced_fn(42)
 * 
 * assertEq(a === b, true) // the promises `a` and `b` are one and the same, since `debounced_fn` shares the existing non-settled promises.
 * 
 * // after the sleep below, 1050ms would have passed since the creation of `a`, and it would have been resolved had we _not_ created `b`.
 * // however, since we created `b` within the debounce interval of 1000ms, the promise's timer has been reset.
 * await sleep(550)
 * assertEq(log_history, [])
 * 
 * // 1000ms after the creation of `b`, the value `42` will be logged into `log_history` (due to promise `a` and `b`).
 * await sleep(500)
 * assertGe(log_history[0][0], 500 + 999)
 * assertLe(log_history[0][0], 500 + 1040)
 * assertEq(log_history[0][1], 42)
 * assertEq(await a, 100 + 42) // notice that the value of `a` has changed to the expected output value of `b`, because they are one and the same.
 * assertEq(await b, 100 + 42)
 * 
 * // now that promises `a` and `b` have been resolved, executing the shared-debounced function again will create a new promise that will resolve after 1000ms from now.
 * const c = debounced_fn(99)
 * assertEq(c === b, false)
 * 
 * // 1000ms later, the value `99` will be logged into `log_history` (due to promise `c`).
 * await sleep(1050)
 * assertGe(log_history[1][0], 1550 + 999)
 * assertLe(log_history[1][0], 1550 + 1100)
 * assertEq(log_history[1][1], 99)
 * assertEq(await c, 100 + 99)
 * 
 * // key takeaway:
 * // - notice that the promises made within the debounce interval are the same pomise objects (i.e. `a === b`).
 * // - however, once out of that interval, an entirely new promise is generated (i.e. `b !== c`)
 * ```
*/
export const debounceAndShare = <T extends any, ARGS extends any[]>(
	wait_time_ms: number,
	fn: (...args: ARGS) => T,
): ((...args: ARGS) => Promise<T>) => {
	let
		prev_timer: undefined | number,
		current_resolve: (value: MaybePromiseLike<T>) => void,
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

/** a throttled function blocks the execution of `fn`, if less than `delta_time_ms` amount of time has passed since the previous non-rejected call.
 * a rejected caller would receive the {@link THROTTLE_REJECT} symbol, instead of the `fn` function's evaluated value.
 * 
 * ### Visualization
 * 
 * the following visual illustration should give you an idea of how a throttled function with `delta_time_ms = 1000` would behave.
 * - the intersections in the `call made` axis specifies the time where a call is made to the throttled function.
 * - successfully evaluated calls are labeled as `resolved` (with the legend marker `o`), and their caller will receive the evaluated value of `fn()`
 * - unsuccessful calls (i.e. rejected) are labeled as `rejected` (with the legend marker `x`), and their caller will receive the symbol value {@link THROTTLE_REJECT}.
 * 
 * ```text
 * │resolved │  o         o                  o                           
 * │rejected │  │ x  x x  │ x                │ x x                       
 * │call made├──┴─┴──┴─┴──┴─┴────────────────┴─┴─┴─────────────────► time
 * │time     │  0         1         2         3         4         5      
 * ```
 * 
 * @param delta_time_ms the time interval in milliseconds for throttling
 * @param fn the function to be throttled
 * @returns a function (that takes arguments intended for `fn`) that returns the value of `fn` if it was not throttled,
 *   otherwise a {@link THROTTLE_REJECT} symbol is returned.
 * 
 * @example
 * ```ts
 * import {
 * 	assertEquals as assertEq,
 * 	assertLessOrEqual as assertLe,
 * 	assertGreaterOrEqual as assertGe,
 * } from "jsr:@std/assert"
 * 
 * // a function that creates an asynchronous delay of the given number of milliseconds
 * const sleep = (time_ms: number) => (new Promise((resolve) => (setTimeout(resolve, time_ms))))
 * 
 * const
 * 	log_history: Array<[time: number, value: number]> = [],
 * 	t0 = performance.now(),
 * 	current_time = () => (performance.now() - t0)
 * 
 * // the function that we plan to apply throttling to
 * const fn = (v: number) => {
 * 	log_history.push([current_time(), v])
 * 	return v + 100
 * }
 * 
 * // the throttled version of `fn`, that blocks subsequent calls when they are made under the `delta_time` interval (1000ms here).
 * const throttled_fn = throttle(1000, fn)
 * 
 * // first call to the `throttled_fn` will be evaluated successfully and immediately
 * const a = throttled_fn(24)
 * 
 * assertEq(a, 100 + 24)
 * assertGe(log_history[0][0], 0)
 * assertLe(log_history[0][0], 100)
 * assertEq(log_history[0][1], 24)
 * 
 * // subsequent calls to the `throttled_fn` that are made under 1000ms, will be immediately rejected with the symbol value `THROTTLE_REJECT`.
 * await sleep(200)
 * const b1 = throttled_fn(37)
 * const b2 = throttled_fn(42)
 * 
 * assertEq(b1, THROTTLE_REJECT)
 * assertEq(b2, THROTTLE_REJECT)
 * assertGe(current_time(), 199)
 * assertLe(current_time(), 400)
 * 
 * // finally, when 1000ms has passed, `throttled_fn` will permit another successful call
 * await sleep(800)
 * const c = throttled_fn(99)
 * 
 * assertEq(c, 100 + 99)
 * assertGe(log_history[1][0], 999)
 * assertLe(log_history[1][0], 1300)
 * assertEq(log_history[1][1], 99)
 * ```
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

/** a throttle function, similar to {@link throttle}, that also insures that the **final** call (aka trailing call) made to the throttled function **always** resolves eventually.
 * 
 * this is useful in cases where it is of utmost importance that the throttled function is called **one last time** with before a prolonged delay.
 * 
 * ### Visualization
 * 
 * the following visual illustration shows the difference between the regular {@link throttle}, and {@link throttleAndTrail} functions:
 * 
 * #### this {@link throttleAndTrail} function
 * 
 * here is a function `fn` throttled with `trailing_time_ms = 1500`, and `delta_time_ms = 1000`.
 * as you can see below, the trailing calls to the throttled function do get resolved eventually (1500ms after the last call).
 * 
 * ```text
 * │time     │         ╭╶╶╮ 1.2            2.7   3.3            4.8 5.2              
 * ├─────────│       ╭╶┤  │ ┌───(delayed)──┐     ┌───(delayed)──┐   (rejected)       
 * │         │    ╭╶╶┤ │  │ │              ▼   ╭╶┤              ▼   ╭╶╶╶╶╶╶╶╮        
 * │resolved │  o ▼  ▼ ▼  o │              o o ▼ │              o o ▼       o        
 * │rejected │  │ x  x x  │ │                │ x │                │ x       │        
 * │call made├──┴─┴──┴─┴──┴─┴────────────────┴─┴─┴────────────────┴─┴───────┴──► time
 * │time     │  0         1         2         3         4         5         6        
 * ```
 * 
 * #### regular {@link throttle} function
 * 
 * here is a function `fn` throttled with `delta_time_ms = 1000`.
 * as it can be seen below, the final call to the throttled function gets rejected, because it was called too quickly.
 * 
 * ```text
 * │resolved │  o         o                  o                           
 * │rejected │  │ x  x x  │ x                │ x x                       
 * │call made├──┴─┴──┴─┴──┴─┴────────────────┴─┴─┴─────────────────► time
 * │time     │  0         1         2         3         4         5      
 * ```
 * 
 * @param trailing_time_ms the time in milliseconds after which a trailing (pending) call to the function gets resolved if no other calls are made during that time interval.
 *   you would definitely want this to be some value greater than {@link delta_time_ms}, otherwise it will be weird because if this value is smaller,
 *   then `trailing_time_ms` will become the "effective" throttling time interval, but also one that always resolved later rather than immediately.
 * @param delta_time_ms the time interval in milliseconds for throttling
 * @param fn the function to be throttled
 * @param rejection_value if a rejection value is provided, then old unresolved pending promises will be rejected with the given value,
 * 	 when a new call to the throttled function is made within the {@link trailing_time_ms} waiting period.
 *   if no rejection value is provided, then the promise will linger around unsettled forever.
 *   do note that having a rejection value means that you **will** have to catch any rejections if you wait for the promise,
 *   otherwise it will bubble to the top level as an unhandled error.
 * @returns a function (that takes arguments intended for `fn`) that returns a `Promise` to the value of `fn` if it is resolved (i.e. not throttled or when trailing),
 *   otherwise if throttled, then that promise will either be never be resolved, or rejected based on if a {@link rejection_value} was provided.
 * 
 * @example
 * ```ts
 * import {
 * 	assertEquals as assertEq,
 * 	assertLessOrEqual as assertLe,
 * 	assertGreaterOrEqual as assertGe,
 * } from "jsr:@std/assert"
 * 
 * // a function that creates an asynchronous delay of the given number of milliseconds
 * const sleep = (time_ms: number) => (new Promise((resolve) => (setTimeout(resolve, time_ms))))
 * 
 * const
 * 	log_history: Array<[time: number, value: number]> = [],
 * 	t0 = performance.now(),
 * 	current_time = () => (performance.now() - t0)
 * 
 * // the function that we plan to apply throttling to
 * const fn = (v: number) => {
 * 	log_history.push([current_time(), v])
 * 	return v + 100
 * }
 * 
 * // the throttled version of `fn` with trailing enabled.
 * // a call is considered to be a trailing call if more than `trailing_time_ms` of 1500ms has passed since its inception.
 * // however after a successful call, subsequent non-trailing calls made under the `delta_time` interval of 1000ms will be rejected with the value `"REJECTED!"`.
 * const throttled_fn = throttleAndTrail(1500, 1000, fn, "REJECTED!")
 * 
 * // first call to the `throttled_fn` will be evaluated successfully and immediately (albeit being wrapped under a promise)
 * const a = throttled_fn(24)
 * 
 * await sleep(100)
 * assertGe(log_history[0][0], 0)
 * assertLe(log_history[0][0], 100)
 * assertEq(log_history[0][1], 24)
 * assertEq(await a, 100 + 24)
 * 
 * // subsequent non-trailing calls to the `throttled_fn` that are made under 1000ms, will be rejected with the custom value `"REJECTED!"`.
 * await sleep(100)
 * const b1 = throttled_fn(37).catch(reason => reason)
 * const b2 = throttled_fn(42).catch(reason => reason)
 * 
 * assertEq(await b1, "REJECTED!")
 * // we don't await for `b2`, because after 1500ms, it will be resolved due to being a trailing call, and we don't want that right now.
 * assertGe(current_time(), 199)
 * assertLe(current_time(), 400)
 * 
 * // finally, we create a trailing call, which will take 1500ms to resolve, since less than 1000ms has passed since the last call (`b2`).
 * await sleep(100)
 * const c = throttled_fn(99)
 * 
 * assertEq(await c, 100 + 99)
 * assertGe(log_history[1][0], 300 + 1499)
 * assertLe(log_history[1][0], 300 + 1700)
 * assertEq(log_history[1][1], 99)
 * assertEq(await b2, "REJECTED!")
 * ```
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
		if (rejection_value !== undefined) { prev_reject(rejection_value) }
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
