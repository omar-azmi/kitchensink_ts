import { assert } from "https://deno.land/std@0.204.0/assert/mod.ts"
import { Deque } from "../src/collections.ts"

Deno.test("pushFront and getFront", () => {
	const deque = new Deque<number>(3)
	deque.pushFront(1, 2)
	assert(deque.getFront() === 2)
})

Deno.test("pushBack and getBack", () => {
	const deque = new Deque<number>(3)
	deque.pushBack(1, 2)
	assert(deque.getBack() === 2)
})

Deno.test("popFront and popBack", () => {
	const deque = new Deque<number>(3)
	deque.pushFront(1, 2)
	assert(deque.popFront() === 2)
	deque.pushBack(3)
	assert(deque.popBack() === 3)
})

Deno.test("rotate -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.rotate(2)
	assert([...deque].join("") === "45123")
})

Deno.test("rotate -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.rotate(2)
	assert([...deque].join("") === "45123")
})

Deno.test("reverse -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.reverse()
	assert([...deque].join("") === "54321")
})

Deno.test("reverse -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.reverse()
	assert([...deque].join("") === "54321")
})

Deno.test("at", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	assert(deque.at(0) === 1)
	assert(deque.at(-1) === 5)
	assert(deque.at(-2) === 4)
	assert(deque.at(2) === 3)
})

Deno.test("replace -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.replace(3, 6)
	assert([...deque].join("") === "12365")
	deque.replace(-2, 7)
	assert([...deque].join("") === "12375")
})

Deno.test("replace -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.replace(3, 6)
	assert([...deque].join("") === "12365")
	deque.replace(-2, 7)
	assert([...deque].join("") === "12375")
})

Deno.test("insert -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.insert(2, 9)
	assert([...deque].join("") === "12934")
})

Deno.test("insert -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.insert(2, 9)
	assert([...deque].join("") === "129345")
})
