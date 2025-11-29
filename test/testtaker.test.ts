import { assertEquals } from "jsr:@std/assert"
import { subtestResults, test } from "../src/testtaker.ts"


await test("testing test", async (t) => {
	await t.step("non-problematic steps should have no problems!", () => {
		assertEquals(1 + 1, 2)
	})

	await t.step("erroneous steps should be reported!", (t2) => {
		// silencing the logger for this step.
		t2.logger = { error: () => undefined, log: () => undefined }
		assertEquals("the earth is flat", "the earth is an oblate ellipsoid")
	})

	const [result_1, result_2] = t[subtestResults]
	assertEquals(result_1.passed, true)
	assertEquals(result_1.error, undefined)
	assertEquals(result_2.passed, false)
	assertEquals(result_2.error instanceof Error, true)

	// popping away the failing result, so that the main test itself does not fail.
	t[subtestResults].pop()
})
