// import { } from "./binder.ts"
// import { } from "./builtin_aliases_deps.ts"
/*
const proxyAsSubclass = () => {

}
*/

import { object_assign, object_create, object_getInheritedPropertyKeys, object_getPrototypeOf, object_setPrototypeOf, reflect_construct } from "./builtin_aliases_deps.ts"
import { prototypeOfClass } from "./struct.ts"
import { ConstructorOf } from "./typedefs.ts"

class A {
	id = "A"
	x = "x"
	y = "y"
	z = "z"
	a() { console.log("A.a()"); this.b(); return 1 }
	b() { console.log("A.b()"); this.c(); return 2 }
	c() { console.log("A.c()"); console.log(this.id, this.x, this.y, this.z); return 3 }
}

class B extends A {
	id = "B"
	// a() { super.a(); console.log(this.x, this.y, this.z); return 10 }
	b() { console.log("B.b()"); super.c(); return 20 }
	d() { console.log("B.d()"); console.log(this.id, this.x, this.y, this.z); return 40 }
}

const GET_SUPER_TARGET = Symbol("a method that returns a proxy's original super target")

const subclassInIsolation = <T extends Object, CLS extends ConstructorOf<T>, SUB extends CLS>(subclass: SUB) => {
	// also don't forget getters and setters
	const
		super_target = Symbol(),
		sub_proto = prototypeOfClass(subclass),
		sub_clone = subclass.bind({}),
		super_keys = object_getInheritedPropertyKeys(sub_proto) as (keyof T)[],
		super_proto = object_getPrototypeOf(sub_proto) as T,
		super_constructor = object_getPrototypeOf(subclass) as CLS

	// intercepting the `super(...args)` call in constructor of `subclass`, so that we can assign it as the target symbol property (`super_target`) post-creation
	object_setPrototypeOf(sub_clone, new Proxy(super_constructor, {
		construct(target, argArray, newTarget) {
			const
				new_super_instance = reflect_construct(target, argArray),
				new_this = {
					__proto__: new_super_instance,
					[super_target]: new_super_instance
				}
			return new Proxy(new_this)
		},
	}))


	const
		super_methods_proxy_handler: ProxyHandler<T[any]> = {
			apply(targetMethod, thisArg, argsArray) {
				// this is the part which swaps the proxy receiver (`thisArg instanceof subclass` in this context), with the original target (instance of `CLS` or `super`)
				// this in turn creates an isolation layer between the overloaded methods of `subclass`, and the original methods of the target.
				return Reflect.apply(targetMethod, thisArg[super_target] ?? thisArg, argsArray)
			}
		},
		// this shall become clone of ``subclass.prototype.__proto__` (i.e. prototype of superclass),
		// but it will proxy all method calls so that the `this` instance of the receiver is swapped with the original targeted instance
		proxied_super_proto = {} as typeof super_proto
	// TODO check if the below works in case the above doesn't work for far-inherited methods
	// proxied_super_proto = object_setPrototypeOf({}, object_getPrototypeOf(super_proto)) as typeof super_proto
	for (const key of super_keys) {
		proxied_super_proto[key] = new Proxy(super_proto[key], super_methods_proxy_handler)
	}
	// @ts-ignore: TODO typescript gymnastics
	proxied_super_proto[GET_SUPER_TARGET] = function () { return this[super_target] }
	// const subclass_clone = function (this: SUB, ...args: ConstructorParameters<SUB>) {
	// subclass.bind(this)
	// return new Proxy(subclass.apply(this as any, args), {})
	// }
	// copy static properties and methods
	object_assign(sub_clone, subclass)
	// set the interceptor proxy to instance members, and the getter setters
	sub_clone.prototype = new Proxy(sub_proto, {})
	// set the interceptor proxy to super method calls
	object_setPrototypeOf(sub_clone.prototype, proxied_super_proto)
	return sub_clone
	/*
	return function (obj: T) {
		const sub_proxy = object_create(sub_clone.prototype)
		sub_proxy[super_target] = obj
		return sub_proxy as InstanceType<SUB>
	}
	*/
}

const isolated_B = subclassInIsolation(B)
const a = new A()
const objB = new isolated_B(a)
objB.a()




/*
function cloneFunction(original) {
    // Create a new function by binding the original function to an empty context
    // const clone = original.bind({});
	const clone = Object.defineProperties(
		original.bind({}),
		Object.getOwnPropertyDescriptors(original)
	)
    
    // Copy over all properties
    for (const key in original) {
        if (original.hasOwnProperty(key)) {
			console.log("ownkey:", key)
            clone[key] = original[key]
        }
    }
	// Ensure the prototype is the same
	console.log("clone's original .prototype:", clone.prototype)
	// Object.defineProperty(clone.prototype, "constructor", {
		// value: clone,
		// enumerable: false,
		// writable: true,
		// configurable: true,
	// })
	clone.prototype = Object.create(Object.getPrototypeOf(original.prototype), {
	// Return original constructor to Child
		constructor: {
			value: clone,
			enumerable: false,
			writable: true,
			configurable: true,
		},
	})
    // clone.prototype = Object.create(original.prototype)
	// clone.prototype.constructor = clone
    return clone
}

function Person(name) {
	this.name = name;
	console.log(this.constructor.value)
}

Person.value = 100

Person.prototype.introduce = function() {
  console.log("Hello, my name is " + this.name);
};

const Person2 = cloneFunction(Person)
Person2.value = 200

let otto = new Person("Otto");
otto.introduce(); // Hello, my name is Otto
let seto = new Person2("SETO");
seto.introduce(); // Hello, my name is SETO

console.log(Object.getPrototypeOf(otto) === Person.prototype, Object.getPrototypeOf(otto) === Person2.prototype)
console.log(Object.getPrototypeOf(seto) === Person.prototype, Object.getPrototypeOf(seto) === Person2.prototype)
*/