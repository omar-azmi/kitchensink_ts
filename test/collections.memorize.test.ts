import { memorizeMultiCore } from "../src/lambda.ts"

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
