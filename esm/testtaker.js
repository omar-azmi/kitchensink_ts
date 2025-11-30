/** the following shim (polyfill) defines a simple standalone `Deno.Test`-like replacement for non-deno environments.
 *
 * the only two things implemented here are:
 * - `test: Deno.Test` function.
 * - `step: Deno.TestContext` interface, which is passed onto your test-function that you feed to `Deno.test`.
 *
 * > [!note]
 * > make sure that your test-function's body is side-effect free if you will be using `async` test functions in parallel.
 * > otherwise, always perform a top-level await on all `Deno.test`s.
 * > deno itself waits for all async tests to end their execution, so we don't have to write `await` before every `Deno.test`.
 * > however, you don't get that luxury in the browser or other runtimes.
 * > thus, you should **always** `await` your calls to {@link test | `Deno.test`} if you wish to use this shim/polyfill.
 * >
 * > @example
 * > ```diff
 * >   // adapting a deno-native test file to become browser compatible:
 * > - Deno.test("my test", (t): Promise<void> => {
 * > + await Deno.test("my test", (t): Promise<void> => {
 * >   	// do the test
 * >   })
 * > ```
 *
 * @module
*/
import * as dntShim from "./_dnt.shims.js";
import { noop } from "./alias.js";
import { isFunction, isString } from "./struct.js";
export const subtestResults = Symbol();
let anon_test_counter = 0;
const parseTestArgs = (arg1, arg2, arg3) => {
    if (arg3 !== undefined) {
        return parseTestArgs({ ...arg2, name: arg1, fn: arg3 });
    }
    if (arg2 !== undefined) {
        const options = isString(arg1) ? { name: arg1 } : arg1;
        return parseTestArgs({ ...options, fn: arg2 });
    }
    const definition = isFunction(arg1)
        ? { name: `anon-test-${anon_test_counter++}`, fn: arg1 }
        : arg1;
    if (!isFunction(definition.fn)) {
        console.warn(`the test \"${definition.name}\" is missing a test-function, so we're attaching a dummy one.`);
        definition.fn = noop;
    }
    return definition;
};
const parseStepTestArgs = (arg1, arg2, arg3) => {
    return (arg3 === undefined && arg2 === undefined && isFunction(arg1))
        ? parseTestArgs({ name: `anon-test-step-${anon_test_counter++}`, fn: arg1 })
        : parseTestArgs(arg1, arg2, arg3);
};
const createTestContext = (definition, parent) => {
    const t = {
        name: definition.name,
        origin: "unknown",
        parent: parent,
        logger: parent?.logger ?? console,
        [subtestResults]: [],
        async step(arg1, arg2, arg3) {
            const definition = parseStepTestArgs(arg1, arg2, arg3), { name, ignore } = definition;
            if (ignore) {
                return true;
            }
            const t_sub_test = createTestContext(definition, t);
            // run the nested step function and pass the `t_sub_test` context to it.
            try {
                await definition.fn(t_sub_test);
            }
            catch (err) {
                t[subtestResults].push({ name, passed: false, error: err });
                t_sub_test.logger.error(`[sub-test-FAILED]: ${name}`);
                t_sub_test.logger.error(err);
                return false;
            }
            t[subtestResults].push({ name, passed: true });
            return true;
        },
    };
    return t;
};
/** this function mimics the behavior of `Deno.test` so that it can be used in non-deno environments.
 *
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * await test("testing test", async (t) => {
 * 	await t.step("non-problematic steps should have no problems!", () => {
 * 		assertEquals(1 + 1, 2)
 * 	})
 *
 * 	await t.step("erroneous steps should be reported!", (t2) => {
 * 		// silencing the logger for this step.
 * 		t2.logger = { error: () => undefined, log: () => undefined }
 * 		assertEquals("the earth is flat", "the earth is an oblate ellipsoid")
 * 	})
 *
 * 	const [result_1, result_2] = t[subtestResults]
 * 	assertEquals(result_1.passed, true)
 * 	assertEquals(result_1.error, undefined)
 * 	assertEquals(result_2.passed, false)
 * 	assertEquals(result_2.error instanceof Error, true)
 *
 * 	// popping away the failing result, so that the main test itself does not fail.
 * 	t[subtestResults].pop()
 *
 * 	// TODO: add more test cases, such as teting multi-depth steps, etc...
 * })
 * ```
*/
export const test = async (arg1, arg2, arg3) => {
    const definition = parseTestArgs(arg1, arg2, arg3), t = createTestContext(definition);
    try {
        // running the main test function, and passing the context to it.
        await definition.fn(t);
        const failed_tests = t[subtestResults].filter((info) => (!info.passed)), failed_tests_len = failed_tests.length;
        if (failed_tests_len > 0) {
            throw Error(`[sub-tests      ]: ${failed_tests_len} sub-tests have failed.`);
        }
        t.logger.log(`[    test-passed]: ${definition.name}`);
        return true;
    }
    catch (err) {
        t.logger.error(`[    test-FAILED]: ${definition.name}`);
        t.logger.error(err);
        return false;
    }
};
/** injects the {@link test} function to the global `Deno` variable's `test` property, if it is not already defined.
 *
 * @returns the polyfilled {@link test} function.
*/
export const injectTestShim = () => {
    if (typeof Deno === "undefined") {
        dntShim.dntGlobalThis.Deno = {};
    }
    if (Deno.test === undefined) {
        Object.assign(Deno, { test });
    }
};
