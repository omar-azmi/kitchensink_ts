import type { MaybePromise } from "./typedefs.js";
/** this interface describes what a test or sub-test is composed of.
 * it partially reflects `Deno.TestDefinition`'s interface.
*/
export interface TestDefinition {
    /** the user defined name of the test/sub-test. */
    name: string;
    /** the test function that will be tested when this step is executed.
     *
     * the first (and only) argument passed to this function will contain the current test's {@link TestContext | context}.
    */
    fn: TestFunction;
    /** when this is set to `true`, the current test/sub-test will be skipped.
     *
     * this is can be used for conditional logic, like when an environment feature is present or lacking.
     */
    ignore?: boolean;
}
/** this interface describes your current test context, similar to `Deno.TestContext`. */
export interface TestContext {
    /** the name of the test.
     *
     * @defaultValue `anon-test-${test_number}`, when no name is provided by the user.
    */
    name: string;
    /** this is supposed to be the string url of the current test file in deno,
     * but since that doesn't make much sense in browser environment, I will always set it to `"unknown"`.
     *
     * @defaultValue `"unknown"`
    */
    origin: "unknown";
    /** lets you attach a sub-test step to your upper-level test. */
    step: TestSpec;
    /** if this test context is a sub-step of another, then the parent/upper-level test context will be referenced here. */
    parent?: TestContext;
    /** a customizable logger. defaults to the built-in `console` object.
     * you can turn off logging by replacing the members with a dummy no-op (no-operation) function.
    */
    logger: {
        log: LogFn;
        error: LogFn;
    };
    /** the child sub-test results get accumulated in here.
     *
     * @internal
    */
    [subtestResults]: Array<{
        name: string;
        passed: boolean;
        error?: any;
    }>;
}
/** your test function. the first argument can be used for defining _sub-tests_ within this test. */
export type TestFunction = (t: TestContext) => MaybePromise<void>;
/** any logger function, similar to `console.log`. */
export type LogFn = (...data: any[]) => void;
/** this is a union of various function signatures accepted by the {@link test} function, similar to `Deno.test`'s function signature.
 *
 * however, keep in mind that these are **asynchronous**, unlike `Deno.test`, which isn't.
 * thus, you will probably want to wait for the returned promise before for exiting your test script.
*/
export interface TestSpec {
    (fn: TestFunction): Promise<boolean>;
    (name: string, fn: TestFunction): Promise<boolean>;
    (definition: TestDefinition): Promise<boolean>;
    (options: Omit<TestDefinition, "fn">, fn: TestFunction): Promise<boolean>;
    (name: string, options: Omit<TestDefinition, "fn" | "name">, fn: TestFunction): Promise<boolean>;
}
export declare const subtestResults: unique symbol;
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
export declare const test: TestSpec;
/** injects the {@link test} function to the global `Deno` variable's `test` property, if it is not already defined.
 *
 * @returns the polyfilled {@link test} function.
*/
export declare const injectTestShim: () => void;
//# sourceMappingURL=testtaker.d.ts.map