/** utility functions for mapping generic arrays and objects (records/dictionaries) <br>
 * to utilize the strict-narrow typing features of this submodule, you will have to write your mapping functions in a certain way. <br>
 * moreover you will need to use `typescript 4.9`'s `satisfies` operator for further better type checking.
 * @module
*/

type ArrayFixedLength<T, L extends number> = Array<T>

export type SequenceOfFunc<T extends any, U extends any, L extends number> = ArrayFixedLength<(value: T) => U, L>

export type SequenceOfVarargsFunc<ARGS extends any[], U extends any, L extends number> = ArrayFixedLength<(...args: ARGS) => U, L>

export type RecordOfFunc<R, U extends { [key in keyof R]: unknown }> = { [K in keyof R]: (value: R[K]) => U[K] }

export type RecordMapperFunc<R, U extends { [key in keyof R]: unknown }> = { [K in keyof R]: (value: R[K]) => U[K] }

export type RecordMapper<
	R,
	T extends any = unknown,
	U extends { [K in keyof R]: any } = T extends object ? T : { [K in keyof R]: T }
> = { [K in keyof R]: (value: R[K]) => U[K] }


export const sequentialMap = <T extends any, U extends any, L extends number>(funcs: SequenceOfFunc<T, U, L>, data: ArrayFixedLength<T, L>): ArrayFixedLength<U, L> => {
	const out_data: ArrayFixedLength<U, L> = []
	for (let i = 0; i < funcs.length; i++) out_data.push(funcs[i](data[i]))
	return out_data
}

export const sequentialArgsMap = <ARGS extends any[], U extends any, L extends number>(funcs: SequenceOfVarargsFunc<ARGS, U, L>, data: ArrayFixedLength<ARGS, L>): ArrayFixedLength<U, L> => {
	const out_data: ArrayFixedLength<U, L> = []
	for (let i = 0; i < funcs.length; i++) out_data.push(funcs[i](...data[i]))
	return out_data
}

export const recordMap = <
	R,
	U extends any = any,
	F extends RecordMapper<R, U> = RecordMapper<R, U>
>(funcs: F, data: R): { [K in keyof R]: ReturnType<F[K]> } => {
	const out_data: Partial<{ [K in keyof R]: F[K] }> = {}
	for (const [k, fn] of Object.entries(funcs) as ([keyof R, F[keyof R]])[]) out_data[k] = fn(data[k] as any) as typeof out_data[keyof R]
	return out_data as { [K in keyof R]: ReturnType<F[K]> }
}

const a = { a: 1, b: 2, c: 3 }
const mpa = { a: (v) => "kill", b: (v) => "self", c: (v) => 55 } // satisfies RecordMapper<typeof a>; //REQUIRES TSC4.9
const mp: RecordOfFunc<typeof a, Record<typeof a, string>> = { a: (v) => "kill", b: (v) => "self" } as const
let z = recordMap(mpa, a)
mpa.c()

export const recordArgsMap = <ARGS extends any[], U extends any, L extends number>(funcs: SequenceOfVarargsFunc<ARGS, U, L>, data: ArrayFixedLength<ARGS, L>): ArrayFixedLength<U, L> => {
	const out_data: ArrayFixedLength<U, L> = []
	for (let i = 0; i < funcs.length; i++) out_data.push(funcs[i](...data[i]))
	return out_data
}

