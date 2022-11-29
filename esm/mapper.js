/** utility functions for mapping generic arrays and objects (records/dictionaries) <br>
 * to utilize the strict-narrow typing features of this submodule, you will have to write your mapping functions in a certain way. <br>
 * moreover you will need to use `typescript 4.9`'s `satisfies` operator for further better type checking.
 * @module
*/
/** applies the function `mapping_funcs[K]` to input `input_data[K]`, for every key `K in mapping_funcs` <br>
 * see {@link RecordMapper} to get an understanding of what `mapping_funcs` is supposed to look like, and how to type it. <br>
 * moreover, the 3 generic parameters (`R`, `U`, `D`) used here are the same as the ones at {@link RecordMapper}, so check it out. <br>
 * @example
 * ```ts
 * const now_i_know_my = { a: 1, b: 2, c: 3, s: "nein" }
 * const now_i_know_my_greek = recordMap({
 * 	a: (v) => `${v}-alpha`,
 * 	b: (v) => `${v}-beta`,
 * 	c: (v) => `${v}-theta`,
 * 	s: (v) => 9
 * }, now_i_know_my)
 * // assert typeof now_i_know_my_greek extends { a: string, b: string, c: string, s: number }
 * console.debug(now_i_know_my_greek) // { a: "1-alpha", b: "2-beta", c: "theta", s: 9 }
 * ```
*/
export const recordMap = (mapping_funcs, input_data) => {
    const out_data = {};
    for (const k in mapping_funcs)
        out_data[k] = mapping_funcs[k](input_data[k]);
    //for (const [k, fn] of Object.entries(mapping_funcs) as ([keyof R, F[keyof R]])[]) out_data[k] = fn(input_data[k] as any) as typeof out_data[keyof R]
    return out_data;
};
/** similar to {@link recordMap}, but made for variable number of function argument parameters. <br>
 * also see {@link RecordArgsMapper} to get an understanding of what `mapping_funcs` is supposed to look like, and how to type it. <br>
 * @example
 * ```ts
 * type Vec1 = [number]
 * type Vec2 = [number, number]
 * type Vec3 = [number, number, number]
 * const now_i_know_my = { a: [1] as Vec1, b: [2, 2] as Vec2, c: [3, 4, 5] as Vec3, s: ["nein" as string, "mein", "fuhrer"] as const }
 * const now_i_know_my_fuhrer = recordArgsMap({
 * 	a: (v0) => v0 ** 2,
 * 	b: (...vs) => vs[0] + vs[1] ** 2,
 * 	c: (v0, v1, v2) => v0 ** 0.5 + v1 + v2 ** 2,
 * 	s: (arg0, ...args) => [arg0 === "nein" ? 9 : arg0, ...args] as const
 * }, now_i_know_my)
 * // assert typeof now_i_know_my_fuhrer extends { a: number, b: number, c: number, s: readonly [string | 9, "mein", "fuhrer"] }
 * console.debug(now_i_know_my_fuhrer) // { a: 1, b: 6, c: 30.732050807568875, s: [9, "mein", "fuhrer"] }
*/
export const recordArgsMap = (mapping_funcs, input_args) => {
    const out_data = {};
    for (const k in mapping_funcs)
        out_data[k] = mapping_funcs[k](...input_args[k]);
    return out_data;
};
/**
 * @example
 * ```ts
 * const vec3 = [1, 2, "halla"] as const
 * const vecc = sequenceMap<typeof vec3, [unknown, unknown, string], boolean>([
 * 	(v) => v + 4 > 0 ? true : false,
 * 	(v) => v + 3 > 100 ? true : false,
 * 	(s) => s === "halla" ? "hello" : "un-greetful"
 * ], vec3)
 * console.debug(vecc) // [true, false, "hello"]
 * ```
*/
export const sequenceMap = (mapping_funcs, input_data) => {
    const out_data = [];
    for (let i = 0; i < mapping_funcs.length; i++)
        out_data.push(mapping_funcs[i](input_data[i]));
    return out_data;
};
/** TODO */
export const sequenceArgsMap = (mapping_funcs, input_args) => {
    const out_data = [];
    for (let i = 0; i < mapping_funcs.length; i++)
        out_data.push(mapping_funcs[i](...input_args[i]));
    return out_data;
};
