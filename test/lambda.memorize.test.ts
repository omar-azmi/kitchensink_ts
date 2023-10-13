import { memorizeMultiCore, memorizeLRU } from "../src/lambda.ts"

const sum_fn = (...args: Array<number | { n: number }>): number => {
	console.log("sum_fn called with args:", ...args)
	return args.reduce((sum: number, v) => {
		return sum + (typeof v === "number" ? v : v.n)
	}, 0)
}

const
	a1 = { n: 1 },
	b1 = { n: 2 },
	c1 = { n: 3 },
	a2 = { x: { n: 1 }, y: {}, z: {} },
	b2 = { x: { n: 2 }, y: {}, z: {} },
	c2 = { x: { n: 3 }, y: {}, z: {} }

const { fn: memorized_sum_fn, memory: cache } = memorizeMultiCore(sum_fn, false)

console.log("1", memorized_sum_fn())
console.log("2", memorized_sum_fn(1, 2, 3))
console.log("3", memorized_sum_fn(1, a1, 2, b1, 3, c1))
console.log("4", memorized_sum_fn(1, a1, 2, b2.x, 3, c1))
console.log("5", memorized_sum_fn(1, a2.x, 2, b1, 3, c2.x))
console.log("6", memorized_sum_fn(a1, a2.x, b1, b2.x, c1, c2.x))
console.log(cache)

console.log("1", memorized_sum_fn())
console.log("2", memorized_sum_fn(1, 2, 3))
console.log("3", memorized_sum_fn(1, a1, 2, b1, 3, c1))
console.log("4", memorized_sum_fn(1, a1, 2, b2.x, 3, c1))
console.log("5", memorized_sum_fn(1, a2.x, 2, b1, 3, c2.x))
console.log("6", memorized_sum_fn(a1, a2.x, b1, b2.x, c1, c2.x))


const fn_lru = memorizeLRU(5, 10, sum_fn)
console.log("1", fn_lru(1))
console.log("2", fn_lru(2))
console.log("3", fn_lru(3))
console.log("4", fn_lru(4))
console.log("5", fn_lru(5))
console.log("6", fn_lru(6))
console.log("7", fn_lru(7))
console.log("8", fn_lru(8))
console.log("9", fn_lru(9))
console.log("10", fn_lru(10))
console.log("6", fn_lru(6))
console.log("7", fn_lru(7))
console.log("8", fn_lru(8))
console.log("9", fn_lru(9))
console.log("10", fn_lru(10))
console.log("11", fn_lru(11))
console.log("12", fn_lru(12))
console.log("13", fn_lru(13))
console.log("14", fn_lru(14))
console.log("15", fn_lru(15))
console.log("16", fn_lru(16))
console.log("6", fn_lru(6))
console.log("7", fn_lru(7))
console.log("8", fn_lru(8))
console.log("9", fn_lru(9))
console.log("10", fn_lru(10))
