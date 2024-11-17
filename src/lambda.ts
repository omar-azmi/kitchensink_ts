/** utility functions for creating higher order functions.
 * 
 * @module
*/

import { type BindableFunction, bindMethodToSelfByName } from "./binder.ts"
import { date_now, dom_clearTimeout, dom_setTimeout, promise_resolve } from "./alias.ts"
import { HybridTree, HybridWeakMap, LimitedStack, type SimpleMap, StrongTree, TREE_VALUE_UNSET } from "./collections.ts"
import { DEBUG } from "./deps.ts"


export const THROTTLE_REJECT = /*@__PURE__*/ Symbol(DEBUG.MINIFY || "a rejection by a throttled function")
export const TIMEOUT = /*@__PURE__*/ Symbol(DEBUG.MINIFY || "a timeout by an awaited promiseTimeout function")

/** creates a debounced version of the provided function that returns a new promise. <br>
 * the debounced function delays the execution of the provided function `fn` until the debouncing interval `wait_time_ms` amount of time has passed without any subsequent calls. <br>
 * if a `rejection_value` is provided, then any subsequent calls to the debounced function that are made within the debouncing interval, will reject the previous promises.
 * thus you will have to `catch` them in that case. (otherwise it will result in an error) <br>
 * you may worry that too many calls to a non-rejectable debounced function (i.e. when `rejection_value === undefined`)
 * will create too many promise objects, possibly resulting in memory leaks.
 * however, luckily, modern javascript engines are not afflicted by too many pending promise objects.
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

/** a promise that resolves (or rejects if `should_reject = true`) after a certain number of milliseconds. <br>
 * this is a useful shorthand for creating delays, and then following them up with a `.then` call. <br>
 * you may also use this as a sleep/wait function in an async context where `wait` is available
*/
export const promiseTimeout = (wait_time_ms: number, should_reject?: boolean) => {
	return new Promise<typeof TIMEOUT>((resolve, reject) => {
		dom_setTimeout(should_reject ? reject : resolve, wait_time_ms, TIMEOUT)
	})
}

export interface MemorizeCoreControls<V, K> {
	fn: (arg: K) => V
	// TODO: use HybridWeakMap for memory instead of Map, so that key references to objects and functions are held loosely/weakly, and garbage collectible
	memory: SimpleMap<K, V>
}

export const memorizeCore = <V, K>(fn: (arg: K) => V, weak_ref: boolean = false): MemorizeCoreControls<V, K> => {
	const
		// TODO: use HybridWeakMap for memory instead of Map, so that key references to objects and functions are held loosely/weakly, and garbage collectible
		memory: SimpleMap<K, V> = weak_ref ? new HybridWeakMap<K, V>() : new Map<K, V>(),
		get = bindMethodToSelfByName(memory, "get"),
		set = bindMethodToSelfByName(memory, "set"),
		has = bindMethodToSelfByName(memory, "has"),
		memorized_fn: typeof fn = (arg: K): V => {
			const
				arg_exists = has(arg),
				value = arg_exists ? get(arg)! : fn(arg)
			if (!arg_exists) { set(arg, value) }
			return value
		}
	return { fn: memorized_fn, memory }
}

/** memorize the return value of a single parameter function. further calls with memorized arguments will return the value much quicker. */
export const memorize = <V, K>(fn: (arg: K) => V): (typeof fn) => {
	return memorizeCore(fn).fn
}

/** similar to {@link memorize}, but halts its memorization after `n`-unique unmemorized calls are made to the function. */
export const memorizeAtmostN = <V, K>(n: number, fn: (arg: K) => V): typeof fn => {
	const
		memorization_controls = memorizeCore(fn),
		memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"),
		memorized_fn = memorization_controls.fn,
		memorized_atmost_n_fn: typeof fn = (arg: K) => {
			if (memory_has(arg) || (--n >= 0)) {
				return memorized_fn(arg)
			}
			return fn(arg)
		}
	return memorized_atmost_n_fn
}

/** memorize the function's return value up-until `n`-calls.
 * after this, unmemorized call arguments will either return the optional `default_value` (if it was provided),
 * or it will return value of the `n`th call (final call that got memorized).
*/
export const memorizeAfterN = <K, V>(n: number, fn: (arg: K) => V, default_value?: V): typeof fn => {
	const
		memorization_controls = memorizeCore(fn),
		memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"),
		memorized_fn = memorization_controls.fn,
		memorized_after_n_fn: typeof fn = (arg: K) => {
			const value = memory_has(arg) || (--n >= 0) ? memorized_fn(arg) : default_value
			if (n === 0) { default_value ??= value }
			return value as V
		}
	return memorized_after_n_fn
}

/** memorize function and limit the caching memory used for it, through the use of LRU-scheme */
export const memorizeLRU = <K, V>(min_capacity: number, max_capacity: number, fn: (arg: K) => V): typeof fn => {
	const
		memorization_controls = memorizeCore(fn),
		memory_has = bindMethodToSelfByName(memorization_controls.memory, "has"),
		memory_del = bindMethodToSelfByName(memorization_controls.memory, "delete"),
		memorized_fn = memorization_controls.fn,
		memorized_args_lru = new LimitedStack<K>(min_capacity, max_capacity, (discarded_items: K[]) => {
			discarded_items.forEach(memory_del)
		}),
		memorized_args_lru_push = bindMethodToSelfByName(memorized_args_lru, "push"),
		memorized_lru_fn: typeof fn = (arg: K) => {
			const arg_memorized = memory_has(arg)
			if (!arg_memorized) { memorized_args_lru_push(arg) }
			return memorized_fn(arg)
		}
	return memorized_lru_fn
}

/** memorize the result of a function only once. after that, further calls to the function will not invoke `fn` anymore,
 * and instead simply return the memorized value.
*/
export const memorizeOnce = <K, V>(fn: (arg: K) => V): (typeof fn) => {
	return memorizeAfterN(1, fn)
}

export interface memorizeMultiCore_Signature {
	<V, ARGS extends any[]>(fn: (...args: ARGS) => V, weak_ref?: false): { fn: (typeof fn), memory: typeof StrongTree<ARGS[number], V> }
	<V, ARGS extends any[]>(fn: (...args: ARGS) => V, weak_ref: true): { fn: (typeof fn), memory: typeof HybridTree<ARGS[number], V> }
}

export const memorizeMultiCore: memorizeMultiCore_Signature = <V, ARGS extends any[]>(fn: (...args: ARGS) => V, weak_ref: boolean = false) => {
	const
		tree = weak_ref ? new HybridTree<ARGS[number], V>() : new StrongTree<ARGS[number], V>(),
		memorized_fn: typeof fn = (...args: ARGS): V => {
			const
				subtree = tree.getDeep(args.toReversed()),
				args_exist = subtree.value !== TREE_VALUE_UNSET,
				value: V = args_exist ? subtree.value : fn(...args)
			if (!args_exist) { subtree.value = value }
			return value
		}
	return { fn: memorized_fn, memory: tree as any }
}

/** memorize the results of a multi-parameter function. <br>
 * since references to object type arguments are held strongly in the memorized function's cache, you will probably
 * want to manage clearing entries manually, using either {@link Map} methods, or {@link StrongTree} methods.
*/
export const memorizeMulti = <V, ARGS extends any[]>(fn: (...args: ARGS) => V): (typeof fn) => {
	return memorizeMultiCore(fn, false).fn
}

/** memorize the results of a multi-parameter function. <br>
 * the used arguments are cached _weakly_, meaning that if an non-primitive object `obj` was used as an argument,
 * then `obj` is __not__ strongly bound to the memorized function's cache, meaning that if `obj` becomes inaccessible in all scopes,
 * then `obj` will become garbage collectible, which then will also clear the cache's reference to `obj` (and its memorized result).
*/
export const memorizeMultiWeak = <V, ARGS extends any[]>(fn: (...args: ARGS) => V): (typeof fn) => {
	return memorizeMultiCore(fn, true).fn
}

// TODO: implement a multi-parameter memorize function. you could possibly use a form of currying + basic memorization, or you could build a tree structure around the passed arguments for looking up past results

/** this is the return type of {@link curry}, made for the sole purpose of type recursion. */
export type CurrySignature<
	FN extends (...args: any) => any,
	R extends ReturnType<FN> = ReturnType<FN>,
	ARGS extends Parameters<FN> = Parameters<FN>,
> = ARGS extends [infer ARG0, ...infer REST] ? (arg: ARG0) => CurrySignature<(...rest_args: REST) => R> : R

/** this is the return type of {@link CurryMultiSignature}, made for the sole purpose of type recursion. */
export type CurryMultiSignature<
	FN extends BindableFunction<THIS, any, any, any>,
	R extends (FN extends BindableFunction<THIS, any, any, infer P> ? P : void) = ReturnType<FN>,
	THIS extends any = any,
> = <
	A extends (FN extends BindableFunction<THIS, infer P, any, R> ? P : never),
	B extends (FN extends BindableFunction<THIS, A, infer P, R> ? P : never),
	FN_B extends (B extends never[] ? never : (...args_b: B) => R),
> (...args_a: A) => B extends never[] ?
		R :
		CurryMultiSignature<FN_B, ReturnType<FN_B> & R, THIS>

/** curry a function `fn`, with optional `thisArg` option for binding as the `this`-object. <br>
 * what is currying? it allows a multi-parameter function to be transformed into a higher order function that always takes one argument,
 * and spits out another function which also take only one argument, and so on... until all parameters have been filled,
 * upon which the final function finally evaluates into the return value (type parameter {@link R} in this case). <br>
 * 
 * note that this function relies on `fn.length` property to identify the number of __required__ arguments taken by `fn`.
 * this means that default valued arguments (such as `c` in `fn: (a: number, b: number, c = 5) => number`), or rest/spread
 * arguments (such as `args` in `fn: (a: number, b: number, ...args: number[]) => number`), are not considered as required,
 * and thus do not increment the count of `fn.length`.
 * 
 * currying is usually implemented terribly through the use of closure. example: `((arg0) => (arg1) => (arg2) => fn(arg1, arg2, arg3))()` <br>
 * this is bad because when you evaluate a curry with N-parameters, you also have to make N-calls (albeit it being tail-calls), instead of just one call should
 * you have had all the parameters from the beginning. not to mention that all javascript engines famously do not perform tail-call optimizations. <br>
 * but here, I've implemented currying using the `bind` method, which means that once all parameters are filled, the function goes through only one call (no overheads). <br>
 * the same example from before would translate into: `fn.bind(thisArg, arg0).bind(thisArg, arg1).bind(thisArg, arg2)()` when binding is used <br>
 * 
 * @param fn the function to curry
 * @param thisArg provide an optional argument to use as the `this` object inside of `fn`
 * @returns a series of single argument partial functions that does not evaluate until all parameters have been provided
 * 
 * @example
 * ```ts
 * const abcd = (a: number, b: string, c: boolean, d: symbol): string => (String(a) + b + String(c) + String(d))
 * const abcd_curry = curry(abcd) // type: (arg: number) => (arg: string) => (arg: boolean) => (arg: symbol) => string
 * console.log(
 * 	abcd_curry(42)            // type: (arg: string) => (arg: boolean) => (arg: symbol) => string
 * 	(" hello to za warudo! ") // type: (arg: boolean) => (arg: symbol) => string
 * 	(true)                    // type: (arg: symbol) => string
 * 	(Symbol.iterator)         // return type: string
 * ) // logs `"42 hello to za warudo! true Symbol(Symbol.iterator)"`
 * ```
*/
export const curry = <
	FN extends (...args: any) => any,
	R extends ReturnType<FN> = ReturnType<FN>,
	ARGS extends Parameters<FN> = Parameters<FN>,
>(fn: FN, thisArg?: ThisParameterType<FN>): CurrySignature<FN, R, ARGS> => {
	// note that we don't actually bind `fn` to `thisArg`, not until `fn.length <= 1`.
	// this is because then we would be binding `fn` to `thisArg` again and again, on every curried recursive call.
	// it might be more performant to bind `fn` to `thisArg` on only the final execution call,
	// when all parameters, except for the last one, have been provided.
	// which is what the `(fn.bind(thisArg) as (arg: ARGS[0]) => R) as any` line below does on the final call
	return fn.length > 1 ?
		((arg: ARGS[0]) => curry(fn.bind(undefined, arg))) as any :
		(fn.bind(thisArg) as (arg: ARGS[0]) => R) as any
}

/** come here, come all! greet the __Types' Olympics Champion__ of winter 2024.
 * it took a while to correctly apply a multitude of gymnastics to get it functioning, but the dedication has paid off!
 * please give `curryMulti` a round of applause! and don't forget that currying a diverse variety of types all at once brings strength! <br>
 * (said a nation right before its downfall) <br>
 * now that introductions are over: {@link curryMulti} behaves very much like {@link curry}, the only difference being that you can bind an
 * arbitrary number of arguments to the curried `fn` function, instead of just one (like in the case of {@link curry})
 * 
 * @param fn the function to multi-curry
 * @param thisArg provide an optional argument to use as the `this` object inside of `fn`
 * @param remaining_args number of arguments remaining until all parameters (required kind, ideally) are filled. intended for internal use onkly
 * @returns a curried function that consumes variable number of arguments, until all required parameters are available, after which a return value is spat out
 * 
 * @example
 * ```ts
 * const abcd = (a: number, b: string, c: boolean, d: symbol): string => (String(a) + b + String(c) + String(d))
 * const abcd_diversity_curry = curryMulti(abcd) // type: CurryMultiSignature<(a: number, b: string, c: boolean, d: symbol) => string, string, any>
 * console.log(
 *	abcd_diversity_curry(
 *		42, " hello to za warudo! "
 *	)                 // type: CurryMultiSignature<(c: boolean, d: symbol) => string, string, any>
 *	(true)            // type: CurryMultiSignature<(d: symbol) => string, string, any>
 *	(Symbol.iterator) // return type: string
 * ) // logs `"42 hello to za warudo! true Symbol(Symbol.iterator)"`
 * ```
*/
export const curryMulti = <
	FN extends BindableFunction<THIS, any, any, any>,
	R extends (FN extends BindableFunction<THIS, any, any, infer P> ? P : void) = ReturnType<FN>,
	THIS extends any = any,
>(
	fn: FN,
	thisArg?: THIS,
	remaining_args: number = fn.length
): CurryMultiSignature<FN, R, THIS> => {
	return <
		A extends (FN extends BindableFunction<THIS, infer P, any, R> ? P : never),
		B extends (FN extends BindableFunction<THIS, A, infer P, R> ? P : never),
		FN_B extends (B extends never[] ? never : (...args_b: B) => R),
	>(...args_a: A): (
			B extends never[] ?
			R :
			CurryMultiSignature<FN_B, ReturnType<FN_B> & R, THIS>
		) => {
		remaining_args -= args_a.length
		// note that we don't actually bind `fn` to `thisArg`, not until `remaining_args === 0`.
		// this is because then we would be binding `fn` to `thisArg` again and again, on every curried recursive call.
		// it might be more performant to bind `fn` to `thisArg` on only the final execution call, when all parameters have been provided.
		// which is what the `(curried_fn as () => R).call(thisArg) as R` line below does on the final call.
		const curried_fn = fn.bind(undefined as THIS, ...args_a) as FN_B
		return (
			remaining_args <= 0 ?
				(curried_fn as () => R).call(thisArg) as R :
				curryMulti(curried_fn, thisArg, remaining_args)
		) as B extends never[] ? R : CurryMultiSignature<FN_B, ReturnType<FN_B> & R, THIS>
	}
}

declare const curryLeft: <T extends any, ARG0 extends any, ARGS extends (ARG0 extends never ? never : any[]) >(fn: (arg0: ARG0, ...args: ARGS) => T) => (ARGS extends never ? ((arg: ARG0) => T) : ((arg: ARG0) => (...args: ARGS) => T))

declare const curryRight: <T extends any, ARGN extends any, ARGS extends (ARGN extends never ? never : any[]) >(fn: (...args: ARGS) => T) => ((...args: ARGS) => T)
