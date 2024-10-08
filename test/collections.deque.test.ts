import { assertEquals } from "jsr:@std/assert@1.0.6"
import { Deque } from "../src/collections.ts"

Deno.test("pushFront and getFront", () => {
	const deque = new Deque<number>(3)
	deque.pushFront(1, 2)
	assertEquals(deque.getFront(), 2)
})

Deno.test("pushBack and getBack", () => {
	const deque = new Deque<number>(3)
	deque.pushBack(1, 2)
	assertEquals(deque.getBack(), 2)
})

Deno.test("popFront and popBack", () => {
	const deque = new Deque<number>(3)
	deque.pushFront(1, 2)
	assertEquals(deque.popFront(), 2)
	deque.pushBack(3)
	assertEquals(deque.popBack(), 3)
})

Deno.test("rotate -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.rotate(2)
	assertEquals([...deque], [4, 5, 1, 2, 3])
})

Deno.test("rotate -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.rotate(2)
	assertEquals([...deque], [4, 5, 1, 2, 3])
})

Deno.test("reverse -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.reverse()
	assertEquals([...deque], [5, 4, 3, 2, 1])
})

Deno.test("reverse -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.reverse()
	assertEquals([...deque], [5, 4, 3, 2, 1])
})

Deno.test("at", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	assertEquals(deque.at(0), 1)
	assertEquals(deque.at(-1), 5)
	assertEquals(deque.at(-2), 4)
	assertEquals(deque.at(2), 3)
})

Deno.test("replace -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.replace(3, 6)
	assertEquals([...deque], [1, 2, 3, 6, 5])
	deque.replace(-2, 7)
	assertEquals([...deque], [1, 2, 3, 7, 5])
})

Deno.test("replace -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.replace(3, 6)
	assertEquals([...deque], [1, 2, 3, 6, 5])
	deque.replace(-2, 7)
	assertEquals([...deque], [1, 2, 3, 7, 5])
})

Deno.test("insert -full", () => {
	const deque = new Deque<number>(5)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.insert(2, 9)
	assertEquals([...deque], [1, 2, 9, 3, 4])
})

Deno.test("insert -partial", () => {
	const deque = new Deque<number>(10)
	deque.pushFront(1, 2, 3, 4, 5)
	deque.insert(2, 9)
	assertEquals([...deque], [1, 2, 9, 3, 4, 5])
})
