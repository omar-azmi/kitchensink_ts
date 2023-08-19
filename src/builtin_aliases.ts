/** aliases for built-in functions. <br>
 * using aliases of nested functions makes your script more minifiable. <br>
 * for instance, `Math.min(...nums)` is probably not minifiable by many bundlers,
 * however, `import {math_min} from "kitchensink_ts/builtin_aliases.ts"; math_min(...nums)` is minifiable by most bundlers. <br>
 * 
 * nothing here is re-exported by `./mod.ts`. you will have to import this file directly to use any alias.
 * @module
*/

export * from "./builtin_aliases_deps.ts"

export const {
	// numeric comparison functions
	min: math_min,
	max: math_max,
	sign: math_sign,
	abs: math_abs,
	// numeric rounding functions
	round: math_round,
	ceil: math_ceil,
	floor: math_floor,
	trunc: math_trunc,
	fround: math_fround,
	// triginometric functions
	sin: math_sin,
	cos: math_cos,
	tan: math_tan,
	asin: math_asin,
	acos: math_acos,
	atan: math_atan,
	sinh: math_sinh,
	cosh: math_cosh,
	tanh: math_tanh,
	asinh: math_asinh,
	acosh: math_acosh,
	atanh: math_atanh,
	atan2: math_atan2,
	// math functions
	cbrt: math_cbrt,
	clz32: math_clz32,
	exp: math_exp,
	expm1: math_expm1,
	hypot: math_hypot,
	imul: math_imul,
	log: math_log,
	log10: math_log10,
	log1p: math_log1p,
	log2: math_log2,
	pow: math_pow,
	sqrt: math_sqrt,
	// random function
	random: math_random,
	// math constants
	E: math_E,
	LN10: math_LN10,
	LN2: math_LN2,
	LOG10E: math_LOG10E,
	LOG2E: math_LOG2E,
	PI: math_PI,
	SQRT1_2: math_SQRT1_2,
	SQRT2: math_SQRT2,
} = Math

export const {
	EPSILON: number_EPSILON,
	MAX_SAFE_INTEGER: number_MAX_SAFE_INTEGER,
	//MAX_VALUE: number_MAX_VALUE,
	MIN_SAFE_INTEGER: number_MIN_SAFE_INTEGER,
	MIN_VALUE: number_MIN_VALUE,
	//NEGATIVE_INFINITY: number_NEGATIVE_INFINITY,
	NaN: number_NaN,
	//POSITIVE_INFINITY: number_POSITIVE_INFINITY,
	isFinite: number_isFinite,
	//isInteger: number_isInteger,
	isNaN: number_isNaN,
	isSafeInteger: number_isSafeInteger,
	parseFloat: number_parseFloat,
	parseInt: number_parseInt,
} = Number

export const {
	asIntN: bigint_asIntN,
	asUintN: bigint_asUintN,
} = BigInt

export const {
	//fromCharCode: string_fromCharCode,
	fromCodePoint: string_fromCodePoint,
	raw: string_raw,
} = String

export const {
	parse: json_parse,
	stringify: json_stringify,
} = JSON

export const {
	all: promise_all,
	allSettled: promise_allSettled,
	any: promise_any,
	race: promise_race,
	reject: promise_reject,
	//resolve: promise_resolve,
} = Promise

export const {
	error: response_error,
	json: response_json,
	redirect: response_redirect,
} = Response

export const {
	from: array_from,
	isArray: array_isArray,
	of: array_of,
} = Array

export const {
	assign: object_assign,
	create: object_create,
	defineProperties: object_defineProperties,
	defineProperty: object_defineProperty,
	entries: object_entries,
	freeze: object_freeze,
	fromEntries: object_fromEntries,
	getOwnPropertyDescriptor: object_getOwnPropertyDescriptor,
	getOwnPropertyDescriptors: object_getOwnPropertyDescriptors,
	getOwnPropertyNames: object_getOwnPropertyNames,
	getOwnPropertySymbols: object_getOwnPropertySymbols,
	getPrototypeOf: object_getPrototypeOf,
	hasOwn: object_hasOwn,
	is: object_is,
	isExtensible: object_isExtensible,
	isFrozen: object_isFrozen,
	isSealed: object_isSealed,
	keys: object_keys,
	preventExtensions: object_preventExtensions,
	seal: object_seal,
	setPrototypeOf: object_setPrototypeOf,
	values: object_values,
} = Object
