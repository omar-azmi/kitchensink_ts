/** utility functions for common object structures and `Object` manipulation
 * @module
*/

import { bind_set_has } from "./binder.ts"
import { object_defineProperty, object_getOwnPropertyDescriptor, object_getPrototypeOf, object_getterPropertyKeys, reflect_get, reflect_set } from "./builtin_aliases_deps.ts"
import { ConstructorOf, PrototypeOf } from "./typedefs.ts"

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
export const constructorOf = /*@__PURE__*/ <T, Args extends any[] = any[]>(class_instance: T): ConstructorOf<T, Args> => object_getPrototypeOf(class_instance).constructor

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
export const constructFrom = /*@__PURE__*/ <T, Args extends any[] = any[]>(class_instance: T, ...args: Args): T => new (constructorOf(class_instance))(...args)

/** get the prototype object of a class. <br>
 * this is useful when you want to access bound-methods of an instance of a class, such as the ones declared as: `class X { methodOfProto(){ } }`. <br>
 * these bound methods are not available via destructure of an instance, because they then lose their `this` context. <br>
 * the only functions that can be destructured without losing their `this` context are the ones declared via assignment: `class X { fn = () => { }, fn2 = function(){ } }` <br>
 * @example
 * ```ts
 * const array_proto = prototypeOfClass(Array<number>)
 * let arr = [1, 2, 3, 4, 5]
 * array_proto.push(arr, 6)
 * console.log(arr) // [1, 2, 3, 4, 5, 6]
 * const push_to_arr = array_proto.push.bind(arr) // more performant than `push_to_arr = (value) => (arr.push(value))`, and also has lower memory footprint
 * push_to_arr(7, 8, 9)
 * console.log(arr) // [1, 2, 3, 4, 5, 6, 7, 8, 9]
 * ```
*/
export const prototypeOfClass = /*@__PURE__*/ <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>): PrototypeOf<typeof cls> => (cls.prototype)

export type PrimitiveObject = string | number | bigint | boolean | symbol | undefined

export type ComplexObject = object | Function

export const isComplex = (obj: any): obj is ComplexObject => {
	const obj_type = typeof obj
	return obj_type === "object" || obj_type === "function"
}

export const isPrimitive = (obj: any): obj is PrimitiveObject => {
	return !isComplex(obj)
}

export const isFunction = (obj: any): obj is Function => {
	return typeof obj === "function"
}

type TypeofProperty = "data" | "function" | "getset" | undefined

export const typeofProperty = <T extends Object>(obj: T, prop: PropertyKey): TypeofProperty => {

}

export const monkeyPatchPrototypeOfClass = <T, Args extends any[] = any[]>(cls: ConstructorOf<T, Args>, key: keyof T, value: T[typeof key]): void => {
	object_defineProperty(prototypeOfClass(cls), key, { value })
}
/*
export const proxyMethodsFactory = <
	T extends Object,
	METHODS extends Record<
		PropertyKey,
		(this: METHODS, target: T, prop: PropertyKey, receiver: T & METHODS, ...args: any[]) => any
	>
>(methods_dict: METHODS) => {
	const
		proxied_getter_setter_props = new Set(object_getterPropertyKeys(methods_dict)),
		proxied_getter_setter_props_has = bind_set_has(proxied_getter_setter_props),
		handler: ProxyHandler<T & METHODS> = {
			get(target, prop, receiver) {
				const
					prop_is_not_in_target = prop in methods_dict,
					value = prop_is_not_in_target ?
						reflect_get(methods_dict, prop, receiver) :
						reflect_get(target, prop),
					prop_is_getter = prop_is_not_in_target ?
						proxied_getter_setter_props_has(prop) :
						"get" in (object_getOwnPropertyDescriptor(target, prop) ?? {})
				return prop_is_getter || !isFunction(value) ?
					value :
					prop_is_not_in_target ?
						value.bind(methods_dict, target, prop, receiver) :
						value.bind(target)
			},
			set(target, prop, new_value, receiver) {
				return true
			}
		}

	return <S extends T>(target: S) => ({
		__proto__: new Proxy<S & METHODS>(target as S & METHODS, handler),
	})
}

export const subclassAsAProxy = <T, SUB extends T>(subclass_prototype: SUB) => {
	const
		sub_methods = new Map()
		proxied_getter_setter_props = new Set(object_getterPropertyKeys(subclass_prototype)),
		proxied_getter_setter_props_has = bind_set_has(proxied_getter_setter_props),

}



/*

export const subclassAsAProxyFactory = <T extends Object, SUBCLASS extends ConstructorOf<T>>(subclass: SUBCLASS): (<S extends T>(target: S) => (S & InstanceType<SUBCLASS>)) => {
	const
		// the prototype of the subclass contains all of the methods overloaded by the subclass
		subclass_proto = prototypeOfClass(subclass),
		subclass_methods = new Set<keyof typeof subclass_proto>(object_getOwnPropertyKeys(subclass_proto)),
		subclass_methods_has = bind_set_has(subclass_methods),
		// these are the inherited method keys of the subclass's prototype, uptill the methods of `Object.prototype` (exclusive)
		// inherited_keys = new Set<keyof typeof subclass_proto>(object_getInheritedPropertyKeys(subclass_proto)),
		// inherited_keys_has = bind_set_has(inherited_keys)
		// all method keys should be bound to the `target` after `Reflect.get` is called to get the unbound prototype method
		handler: ProxyHandler<T> = {
			get(target, prop, receiver) {
				const value = reflect_get(subclass_methods_has(prop) ? subclass_proto : target, prop, receiver)
				return isFunction(value) ? value.bind(target) : value
			}
		}
	return <S extends T>(target: S) => new Proxy(target, handler) as any
}

export const proxySubclassMethods = <T extends Object, SUBCLASS extends ConstructorOf<T>>(target: T, subclass: SUBCLASS): T & InstanceType<SUBCLASS> => {
	const
		// the prototype of the subclass contains all of the methods overloaded by the subclass
		subclass_proto = prototypeOfClass(subclass),
		subclass_methods = new Set<keyof typeof subclass_proto>(object_getOwnPropertyKeys(subclass_proto)),
		subclass_methods_has = bind_set_has(subclass_methods)


	return new Proxy(target, {
		get(target, prop, receiver) {
			if (subclass_methods_has(prop as keyof typeof subclass_proto)) {
				return reflect_get(subclass_proto, prop, receiver).bind(target)
			}
			return reflect_get(target, prop, target).bind(target)
		},
		set(target, prop, new_value, receiver) {
			if (subclass_methods_has(prop as keyof typeof subclass_proto)) {
				return reflect_set(subclass_proto, prop, target)
			}
			return reflect_set(target, prop, new_value, receiver)
		},
	}) as any
}

class Map2 extends Map {
	get(key) {
		console.log("you've got a key in me:", key)
		return super.get(key)
	}

	mimber = "okboomer"

	get nyaa() { return "harro nyaa" }
	set nyaa(new_val) { console.log("sugoii setting", new_val) }
}

const a = new Map([["1", "1"], ["a", "b"]])
const b = proxySubclassMethods(a, Map2)
b.get("1")
b.set("2", "2")
console.log(b.mimber)
b.mimber = "DIE BOOMER"
console.log(b.mimber, a.mimber)
console.log(b.nyaa)
b.nyaa = "DIE NYAA.SI"
console.log(b.nyaa, a.nyaa)

Reflect.construct(Map, [[[1, 1]]],)


export const proxyAsSubclass = <T extends Object, SUBCLASS extends ConstructorOf<T>>(target: T, subclass: SUBCLASS): InstanceType<SUBCLASS> => {
	const
		// the prototype of the subclass contains all of the methods overloaded by the subclass
		subclass_proto = prototypeOfClass(subclass),
		subclass_methods = new Map<keyof typeof subclass_proto, (typeof subclass_proto)[keyof typeof subclass_proto]>(),
		subclass_methods_get = bind_map_get(subclass_methods),
		subclass_methods_set = bind_map_set(subclass_methods),
		subclass_methods_has = bind_map_has(subclass_methods)
	object_getOwnPropertyKeys(subclass_proto).forEach((prop) => {
		subclass_methods_set(prop, subclass_proto[prop])
	})
	// subclass_methods.delete("constructor") // we don't really need to do this right? after all, it might be useful for someone to retrieve `subclass` by using the proxied object's "constructor" property
	// create a new proxy for the target object
	const proxied_target = new Proxy(target, {
		get(target, prop, receiver) {
			// if the property exists in the subclass prototype, use that
			if ()

				if (prop in subclass_proto) {
					return Reflect.get(subclass_proto, prop, receiver)
				}

			// Otherwise, use the property from the target object
			return Reflect.get(target, prop, receiver)
		},
		set(target, prop, value) {
			// If the property exists in the subclass prototype, set that
			if (prop in subclass_proto) {
				return Reflect.set(subclass_proto, prop, value)
			}

			// Otherwise, set the property on the target object
			return Reflect.set(target, prop, value)
		},
		apply(target: T, thisArg: T, args) {
			// if the method exists in the subclass prototype, use that by applying it onto target
			reflect_apply(subclass_proto, target, args)
		}
	})

	// Set the prototype of the proxy to be the prototype of the subclass
	Object.setPrototypeOf(proxied_target, subclass_proto)

	return proxied_target as InstanceType<SUBCLASS>
}

/*

const a = new Map()
class Map2 extends Map {
	get(key) {
		console.log("you've got a key in me:", key)
		return super.get(key)
	}

	mimber = "okboomer"

	get nyaa() { return "harro nyaa" }
	set nyaa(new_val) { console.log("sugoii setting", new_val); return true }
}

const b = new Map2([[1,1], ["a", "b"]])
Object.getOwnPropertyNames(Object.getPrototypeOf(b))
a.set("k", "keke")
console.log(b.nyaa)
console.log(b.nyaa = 44)
console.log(b.mimber)
console.log(Object.getPrototypeOf(b).mimber)
Object.getOwnPropertyNames(Object.getPrototypeOf(b))

const c = new Proxy(b, {
	get(t, p, r) {
		console.log("c-get:", p)
		return Reflect.get(t, p, r)
	},
	set(t, p, v, r) {
		console.log("c-set:", p, v)
		return Reflect.set(t, p, v, r)
	}
})

console.log(b.get("a"))
console.log(c.get("get"))
console.log(c.get("a"))

*/