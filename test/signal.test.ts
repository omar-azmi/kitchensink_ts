import { assert } from "https://deno.land/std/testing/asserts.ts"
import { createSignal, createMemo, createEffect, batch, untrack, dependsOn, reliesOn, } from "../src/signal.ts"

Deno.test("create a signal and test getter and setter functions", () => {
	const [getValue, setValue] = createSignal<number>(0)
	assert(getValue() === 0)
	setValue(42)
	assert(getValue() === 42)
})

Deno.test("create a memo and test its memorization and reactivity with signals", () => {
	let counter = 0
	const memoFn = createMemo(() => (counter++))
	assert(memoFn() === 0)
	assert(memoFn() === 0) // memoized value remains the same

	const [getCounter, setCounter] = createSignal<number>(0)
	let times_memo_was_run: number = 0
	const memoFn2 = createMemo(() => {
		times_memo_was_run++
		let double = getCounter() * 2
		return double
	})
	assert((memoFn2() === 0) && (times_memo_was_run === 1 as number))
	setCounter(5)
	assert((memoFn2() === 10) && (times_memo_was_run === 2 as number))
	setCounter(5.0) // same value as before, therefore, signal should NOT notify its `memoFn2` observer to rerun
	assert((memoFn2() === 10) && (times_memo_was_run === 2 as number))
})

Deno.test("create and execute an effect", () => {
	let times_effect_was_run = 0
	const effectFn = () => {
		times_effect_was_run++
		return () => {
			times_effect_was_run--
		}
	}
	createEffect(effectFn)
	assert(times_effect_was_run === 1)

	const [getCounter, setCounter] = createSignal<number>(0)
	let times_effect_was_run2: number = 0
	const effectFn2 = () => {
		times_effect_was_run2++
		let double = getCounter() * 2
		return undefined
	}
	createEffect(effectFn2)
	assert(times_effect_was_run2 === 1 as number)
	setCounter(5)
	assert(times_effect_was_run2 === 2 as number)
	setCounter(5.0) //same value as before, therefore, signal should NOT notify its `createEffect(effectFn2)` observer to rerun
	assert(times_effect_was_run2 === 2 as number)
	//TODO trigger cleanup and implement async testing
})

Deno.test("batch computations", () => {
	let counter = 0
	const [getCounter1, setCounter1] = createSignal<number>(0)
	const [getCounter2, setCounter2] = createSignal<number>(0)
	const [getCounter3, setCounter3] = createSignal<number>(0)
	createEffect(() => batch(() => {
		// create dependance on `getCounter1`, `getCounter2` `getCounter3`, and become an observer of all the three
		const v1 = getCounter1()
		const v2 = getCounter2()
		const v3 = getCounter3()
		counter++
	}))
	setCounter1(1)
	setCounter2(2)
	setCounter3(3)
	assert(counter === 1)
	assert((getCounter1() === 1) && (getCounter2() === 2) && (getCounter3() === 3))
})

Deno.test("untrack reactive dependencies", () => {
	let counter = 0
	const [getCounter1, setCounter1] = createSignal<number>(0)
	const [getCounter2, setCounter2] = createSignal<number>(0)
	const [getCounter3, setCounter3] = createSignal<number>(0)
	createEffect(() => untrack(() => {
		// create dependance on `getCounter1`, `getCounter2` `getCounter3`, and become an observer of all the three
		const v1 = getCounter1()
		const v2 = getCounter2()
		const v3 = getCounter3()
		setCounter1(1)
		setCounter2(2)
		setCounter3(3)
		counter++
	}))
	assert(counter === 1)
	assert((getCounter1() === 1) && (getCounter2() === 2) && (getCounter3() === 3))
})

Deno.test("evaluate function with explicit dependencies", () => {
	let counter = 0
	const [getA, setA] = createSignal<number>(0)
	const [getB, setB] = createSignal<number>(0)
	const [getC, setC] = createSignal<number>(0)
	const dependencyFn = createMemo(dependsOn([getA, getB, getC], () => {
		counter++
		return getA() + getB()
	}))
	setA(1)
	setB(2)
	setC(3)
	assert(counter === 4)
	assert(dependencyFn() === 3)
})

Deno.test("create effect with explicit dependencies", () => {
	let counter = 0
	const [getA, setA] = createSignal<number>(0)
	const [getB, setB] = createSignal<number>(0)
	const [getC, setC] = createSignal<number>(0)
	createEffect(dependsOn([getA, getB, getC], () => {
		counter++
	}))
	assert(counter === 1 as number)
	setA(1)
	assert(counter === 2 as number)
	setB(2)
	assert(counter === 3 as number)
	setC(3)
	assert(counter === 4 as number)
})
