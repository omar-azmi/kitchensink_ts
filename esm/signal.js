/** a sugar-free, fat-free, and low-calorie clone of the popular reactivity library [SolidJS](https://github.com/solidjs/solid). <br>
 * for under a 100 javascript lines, you get:
 * - a few core reactivity functions: {@link createSignal}, {@link createMemo}, and {@link createEffect}
 * - a few core utility functions: {@link batch}, {@link untrack}, and {@link reliesOn} (similar to `on(...)` in solid-js) <br>
 * but in exchange, you sacrifice: DOM manipulation, scheduler, asynchronicity (promises), infinite loop checks, shortest update path, and much more. <br>
 * but hey, cheer up. cuz youz gonna loze sum wei8 ma8! <br>
 * TODO add usage examples
 * @module
*/
/** type definition for a computation function. */
import "./_dnt.polyfills.js";
let active_computation = undefined;
let computation_id_counter = 0;
const default_equality = ((v1, v2) => (v1 === v2));
const falsey_equality = ((v1, v2) => false);
/** a reactive signal that holds a value and updates its dependant observers when the value changes. */
export class Signal {
    /** create a new `Signal` instance.
     * @param value initial value of the signal.
     * @param equals optional equality check function for value comparison.
    */
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
        /** get the current value of the signal, and also become a dependant observer of this signal.
         * @returns the current value.
        */
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
        /** set the value of the signal, and if the new value is not equal to the old value, notify the dependant observers to rerun.
         * @param value new value or updater function.
        */
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
/** represents a computation scope for managing reactive computations. */
class ComputationScope {
    /** create a new computation scope.
     * @param computation the computation function to run.
     * @param cleanup optional cleanup function to execute after the computation.
     * @param id optional computation ID.
    */
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
        /** run the computation within this scope. */
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
        /** dispose of the computation scope. */
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
/** create a reactive signal with an initial value.
 * @param initial_value initial value of the signal.
 * @param options options for signal creation. see {@link CreateSignalOptions}.
 * @returns an accessor and setter pair for the signal.
*/
export const createSignal = (initial_value, options) => {
    const signal = new Signal(initial_value, options?.equals);
    return [signal.getValue, signal.setValue];
};
/** create a reactive memo using a memoization function.
 * @param fn memoization function. see {@link MemoFn}.
 * @param options options for memo creation.
 * @returns an accessor for the memoized value.
*/
export const createMemo = (fn, options) => {
    const [getValue, setValue] = createSignal(undefined, options);
    new ComputationScope(() => setValue(fn()));
    return getValue;
};
/** create a reactive effect using an effect function.
 * @param fn effect function to run. {@link see EffectFn}.
*/
export const createEffect = (fn) => {
    let cleanup;
    new ComputationScope(() => (cleanup = fn()), () => { if (cleanup) {
        cleanup();
    } });
};
/** batch multiple computations together for efficient execution.
 * @param fn computation function containing multiple reactive operations.
*/
export const batch = (fn) => {
    const prev_active_computation = active_computation;
    active_computation = undefined;
    fn();
    active_computation = prev_active_computation;
};
/** temporarily disable tracking of reactive dependencies within a function.
 * @param fn function containing reactive dependencies.
 * @returns the result of the function.
*/
export const untrack = (fn) => {
    const prev_active_computation = active_computation;
    active_computation = undefined;
    const result = fn();
    active_computation = prev_active_computation;
    return result;
};
/** evaluate a function with explicit reactive dependencies.
 * @param dependencies list of reactive dependencies to consider.
 * @param fn function containing reactive logic with a return value.
 * @returns the result of the {@link fn} function.
*/
export const dependsOn = (dependancies, fn) => {
    return () => {
        for (const dep of dependancies) {
            dep();
        }
        return untrack(fn);
    };
};
/** create an effect that explicitly depends on specified reactive dependencies.
 * @param dependencies list of reactive dependencies to consider for the effect.
 * @param fn function containing reactive logic for the effect.
 * @returns an effect function that tracks the specified dependency signals.
*/
export const reliesOn = (dependancies, fn) => {
    return () => {
        for (const dep of dependancies) {
            dep();
        }
        untrack(fn);
    };
};
