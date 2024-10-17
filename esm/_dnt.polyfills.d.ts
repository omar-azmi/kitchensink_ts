declare global {
    interface PromiseConstructor {
        /**
         * Creates a Promise that can be resolved or rejected using provided functions.
         * @returns An object containing `promise` promise object, `resolve` and `reject` functions.
         */
        withResolvers<T>(): {
            promise: Promise<T>;
            resolve: (value: T | PromiseLike<T>) => void;
            reject: (reason?: any) => void;
        };
    }
}
declare global {
    interface Object {
        /**
         * Determines whether an object has a property with the specified name.
         * @param o An object.
         * @param v A property name.
         */
        hasOwn(o: object, v: PropertyKey): boolean;
    }
}
export {};
//# sourceMappingURL=_dnt.polyfills.d.ts.map