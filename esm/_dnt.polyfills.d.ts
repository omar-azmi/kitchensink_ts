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
    interface ArrayConstructor {
        fromAsync<T>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T | Promise<T>> | ArrayLike<T | Promise<T>>): Promise<T[]>;
        fromAsync<T, U>(iterableOrArrayLike: AsyncIterable<T> | Iterable<T> | ArrayLike<T>, mapFn: (value: Awaited<T>) => U, thisArg?: any): Promise<Awaited<U>[]>;
    }
}
export {};
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