/** utility functions for common object structures and `Object` manipulation
 * @module
*/

import { object_getPrototypeOf } from "./builtin_aliases_deps.ts"
import { ConstructorOf } from "./typedefs.ts"

/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields */
export type Rect = { x: number, y: number, width: number, height: number }

/** represents an `ImageData` with optional color space information */
export interface SimpleImageData extends Omit<ImageData, "colorSpace" | "data"> {
	data: Uint8ClampedArray | Uint8Array
	colorSpace?: PredefinedColorSpace
}

/** get an equivalent rect where all dimensions are positive */
export const positiveRect = (r: Rect): Rect => {
	let { x, y, width, height } = r
	if (width < 0) {
		width *= -1 // width is now positive
		x -= width // x has been moved further to the left
	}
	if (height < 0) {
		height *= -1 // height is now positive
		y -= height // y has been moved further to the top
	}
	return { x, y, width, height }
}

/** get the constructor of a class's instance.
 * @example
 * ```ts
 * class K { constructor(value) { this.value = value } }
 * const a = new K(1)
 * const b = new (constructorOf(a))(2) // equivalent to `const b = new K(2)`
 * ```
*/
export const constructorOf = <T, Args extends any[] = any[]>(class_instance: T): ConstructorOf<T, Args> => object_getPrototypeOf(class_instance).constructor

/** use the constructor of a class's instance to construct a new instance. <br>
 * this is useful for avoiding polution of code with `new` keyword along with some wonky placement of braces to make your code work. <br>
 * @example
 * ```ts
 * class K { constructor(value1, value2) { this.value = value1 + value2 } }
 * const a = new K(1, 1)
 * const b = constructFrom(a, 2, 2) // equivalent to `const b = new K(2, 2)`
 * const c = new (Object.getPrototypeOf(a).constructor)(3, 3) // vanilla way of constructing `const c = new K(3, 3)` using `a`
 * ```
*/
export const constructFrom = <T, Args extends any[] = any[]>(class_instance: T, ...args: Args): T => new (constructorOf(class_instance))(...args)
