/** this submodule has some basic tools for timing functions.
 * 
 * @module
*/
import "./_dnt.polyfills.js";


import { date_now, performance_now } from "./builtin_aliases_deps.js"
import { DEBUG } from "./deps.js"
import type { MaybePromiseLike } from "./typedefs.js"


/** the time function to use for your {@link Stopwatch} instance.
 * it is best if it returns the time in milliseconds, so that the time scale can be consistient across various uses.
 * - `"perf"` is equivalent to using the built-in `performance.now` function. (default)
 * - `"date"` is equivalent to using the built-in `Date.now` function.
 * - alternatively, you could define your own time function.
*/
export type TimeFunction = "perf" | "date" | (() => number)

const parseTimeFn = (time_fn: TimeFunction): (() => number) => {
	return time_fn === "perf" ? performance_now
		: time_fn === "date" ? date_now
			: time_fn
}

/** time the execution of a function.
 * @returns millisecond time for function execution.
 * 
 * ```ts
 * import { assertGreater, assertLess } from "jsr:@std/assert"
 * 
 * const
 * 	testFn = (a: number, b: number): number => { return a + b },
 * 	delta_time = timeIt(testFn, 5, 10),
 * 	log = `execution time: ${delta_time} ms`
 * assertGreater(delta_time, 0) // computing a sum should take more than `0` milliseconds
 * assertLess(delta_time, 2) // computing a sum should take less than `2` milliseconds
 * ```
*/
export const timeIt = <ARGS extends Array<any> = any[]>(fn: ((...args: ARGS) => any), ...args: ARGS): number => {
	const t1 = performance_now()
	fn(...args)
	return performance_now() - t1
}

/** asynchronously time the execution of an async function.
 * if you are going to provide a synchronous function with certainty, then you might be better off using {@link timeIt} instead.
 * @returns millisecond time for function execution.
 * 
 * @example
 * ```ts
 * import { assertGreater, assertLess } from "jsr:@std/assert"
 * 
 * const asyncTestFn = async (a: number, b: number): Promise<number> => new Promise((resolve) => {
 * 	setTimeout(() => { resolve(a + b) }, 300)
 * })
 * const
 * 	delta_time = await asyncTimeIt(asyncTestFn, 5, 10),
 * 	log = `execution time: ${delta_time} ms`
 * assertGreater(delta_time, 290) // completing the promise should take more than `290` milliseconds
 * assertLess(delta_time, 400) // completing the promise should take less than `400` milliseconds
 * ```
*/
export const asyncTimeIt = async <ARGS extends Array<any> = any[]>(fn: ((...args: ARGS) => MaybePromiseLike<any>), ...args: ARGS): Promise<number> => {
	const t1 = performance_now()
	await fn(...args)
	return performance_now() - t1
}

/** a stopwatch class that provides convince methods for timing.
 * this module exports a global {@link defaultStopwatch} available to all importing scripts,
 * which is beneficial if you want to use a single stop watch across many modules,
 * otherwise, if you want a dedicated stopwatch, you can create a new instance of this class.
 * 
 * this stopwatch operates on the principals of a stack data-structure:
 * that is, you can `push`, `pop`, and `seek` the time.
 * the `Delta` methods provide the *elapsed* time since the last `push`.
 * 
 * @example
 * ```ts
 * import { assertGreater, assertLess, assertThrows } from "jsr:@std/assert"
 * 
 * const stop_watch = new Stopwatch("perf")
 * stop_watch.push()
 * const
 * 	resolved_value: "hello" = await (new Promise((resolve) => {
 * 		setTimeout(() => { resolve("hello") }, 300)
 * 	})),
 * 	delta_time = stop_watch.popDelta(),
 * 	log = `execution time: ${delta_time} ms`
 * assertGreater(delta_time, 290) // completing the promise should take more than `290` milliseconds
 * assertLess(delta_time, 400) // completing the promise should take less than `400` milliseconds
 * // the stack of `stop_watch` is empty now, so trying to `popDelta` will throw an error (intentional by design)
 * assertThrows(() => stop_watch.popDelta())
 * ```
*/
export class Stopwatch {
	/** the stack in which we push timestamps. */
	protected stack: number[] = []

	/** a function that returns the current time */
	protected readonly time: (() => number)

	constructor(get_time_fn: TimeFunction = "perf") {
		this.time = parseTimeFn(get_time_fn)
	}

	/** get the current time. */
	getTime(): number { return this.time() }

	/** push the current time into the stack, and get the value of the current time returned. */
	push(): number {
		const current_time = this.time()
		this.stack.push(current_time)
		return current_time
	}

	/** push the current time into the stack, and get the time elapsed since the last push.
	 * if this is the first push, then the returned value will be `undefined`.
	*/
	pushDelta(): number | undefined {
		const
			current_time = this.time(),
			prev_time = this.seek()
		this.stack.push(current_time)
		return prev_time === undefined
			? prev_time
			: current_time - prev_time
	}

	/** pop the top most time from the time stack.
	 * if the time stack is empty, then an `undefined` will be returned.
	*/
	pop(): number | undefined { return this.stack.pop() }

	/** get the time elapsed since the most recent push into the time stack, and also pop.
	 * 
	 * @throws `Error` this function will throw an error if the time stack was already empty.
	 *   this is intentional, since it would hint that you are using this method non-deterministically, and thus incorrectly.
	*/
	popDelta(): number {
		const
			current_time = this.time(),
			prev_time = this.pop()
		if (prev_time === undefined) { throw new Error(DEBUG.ERROR ? "there was nothing in the time stack to pop" : "") }
		return current_time - prev_time
	}

	/** preview the top most time in the stack without popping.
	 * if the time stack is empty, then an `undefined` will be returned.
	*/
	seek(): number | undefined { return this.stack.at(-1) }

	/** preview the time elapsed since the most recent push into the time stack, without popping.
	 * if there is nothing in the time stack, then an `undefined` will be returned.
	*/
	seekDelta(): number | undefined {
		const
			current_time = this.time(),
			prev_time = this.seek()
		return prev_time === undefined
			? prev_time
			: current_time - prev_time
	}
}

/** a default instance of {@link Stopwatch} (in `performance.now` timer mode) is exported for convenience,
 * so that it is easily shareable among all libraries that import this submodule.
*/
export const defaultStopwatch = /*@__PURE__*/ new Stopwatch("perf")
