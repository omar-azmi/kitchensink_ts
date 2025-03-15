import { assertEquals } from "jsr:@std/assert"
import { parse as stdJsoncParser } from "jsr:@std/jsonc"
import { camelToKebab, jsoncRemoveComments, kebabToCamel, snakeToCamel } from "../src/stringman.ts"

Deno.test("test string token case conversion", () => {
	console.log(camelToKebab("helloWorld"))
	console.log(kebabToCamel("hello-world"))
	console.log(snakeToCamel("hello_world"))
})

Deno.test("test jsonc comment and trailing comma removal", () => {
	const my_jsonc = String.raw`
/** the use of a mixture of tabs and spaces for indentation is intentional. */
{
	// Normal comment
	"regularKey": "Some value",
  
	"inlineCommentTrick": "// This is not a comment, it's inside a string",
	"multiLineCommentTrick": "/* This looks like a comment but isn't */",
  
	"jsonInComment": "/* { \"key\": \"value\" } */",
	"trickyEscapes": "This is a string with \\\"escaped quotes\\\" and /* fake comment */ inside",
	
	"arrayWithConfusingEntries": [
	  "/* not a comment */", 
	  "// also not a comment",
	  "Comma issue", // Trailing comma below
	],  	
  
	/* Block comment containing JSON:
	   {
		 "fakeKey": "fakeValue"
	   }
	*/
  
	"nested": {
	  "subKey": "value",
	  "commentInString": "Here is /* a fake block comment */ inside a string",
	  "moreTricks": "// Fake inline comment"
	},
  
	"deepNest": {
	  "level1": {
		"level2": {
		  "level3": {
			"level4": {
			  "finalKey": "Deeply nested value",  
			}
		  }  ,
		}
	  },},
  
	"weirdNumbers": [
	  42,
	  7, // Leading zero, should convert to 7
	  1e10, // Scientific notation
	],
  
	"trailingCommaTest": {
	  "lastItem": "keep this",
	}, // Trailing comma at root
}`

	assertEquals(
		JSON.parse(jsoncRemoveComments(my_jsonc)),
		stdJsoncParser(my_jsonc),
	)
})
