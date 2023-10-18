import { camelToKebab, kebabToCamel, snakeToCamel } from "../src/stringman.ts"

Deno.test("test string token case conversion", () => {
	console.log(camelToKebab("helloWorld"))
	console.log(kebabToCamel("hello-world"))
	console.log(snakeToCamel("hello_world"))
})
