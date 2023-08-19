/** a sugar-free, fat-free, and low-calorie clone of the popular reactivity library [SolidJS](https://github.com/solidjs/solid). <br>
 * for under a 100 javascript lines, you get:
 * - a few core reactivity functions: {@link createSignal}, {@link createMemo}, and {@link createEffect}
 * - a few core utility functions: {@link batch}, {@link untrack}, and {@link reliesOn} (similar to `on(...)` in solid-js) <br>
 * but in exchange, you sacrifice: DOM manipulation, scheduler, asynchronicity (promises), infinite loop checks, shortest update path, and much more. <br>
 * but hey, cheer up. cuz youz gonna loze sum wei8 ma8! <br>
 * TODO add documentation to you bloody functions you lazy dork. also explain the intent of your various types. yadi yada
 * @module
*/
import "./_dnt.polyfills.js";
let active_computation = undefined;
let computation_id_counter = 0;
const default_equality = ((v1, v2) => (v1 === v2));
const falsey_equality = ((v1, v2) => false);
export class Signal {
    constructor(value, equals) {
        Object.defineProperty(this, "value", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: value
        });
        Object.defineProperty(this, "observers", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Map()
        });
        Object.defineProperty(this, "equals", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "getValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (active_computation) {
                    this.observers.set(active_computation.id, active_computation.computation);
                }
                return this.value;
            }
        });
        Object.defineProperty(this, "setValue", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (value) => {
                value = typeof value === "function" ? value(this.value) : value;
                if (this.equals(this.value, value)) {
                    return;
                }
                this.value = value;
                for (const fn of this.observers.values()) {
                    fn();
                }
            }
        });
        this.equals = equals === false ? falsey_equality : (equals ?? default_equality);
    }
}
class ComputationScope {
    constructor(computation, cleanup, id = computation_id_counter++) {
        Object.defineProperty(this, "computation", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: computation
        });
        Object.defineProperty(this, "cleanup", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: cleanup
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "run", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (this.cleanup) {
                    this.cleanup();
                }
                active_computation = this;
                this.computation();
                active_computation = undefined;
            }
        });
        Object.defineProperty(this, "dispose", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: () => {
                if (this.cleanup) {
                    this.cleanup();
                }
            }
        });
        this.run();
    }
}
export const createSignal = (initial_value, options) => {
    const signal = new Signal(initial_value, options?.equals);
    return [signal.getValue, signal.setValue];
}, createMemo = (fn, options) => {
    const [getValue, setValue] = createSignal(undefined, options);
    new ComputationScope(() => setValue(fn()));
    return getValue;
}, createEffect = (fn) => {
    let cleanup;
    new ComputationScope(() => (cleanup = fn()), () => { if (cleanup) {
        cleanup();
    } });
};
export const batch = (fn) => {
    const prev_active_computation = active_computation;
    active_computation = undefined;
    fn();
    active_computation = prev_active_computation;
}, untrack = (fn) => {
    const prev_active_computation = active_computation;
    active_computation = undefined;
    const result = fn();
    active_computation = prev_active_computation;
    return result;
}, dependsOn = (dependancies, fn) => {
    for (const dep of dependancies) {
        dep();
    }
    return untrack(fn);
}, reliesOn = (dependancies, fn) => {
    return () => { dependsOn(dependancies, fn); };
};
