declare global {
  // https://github.com/denoland/deno/blob/0bfa0cc0276e94f1a308aaad5f925eaacb6e3db2/cli/tsc/dts/lib.es2021.promise.d.ts#L53
  interface PromiseConstructor {
    /**
     * Creates a Promise that can be resolved or rejected using provided functions.
     * @returns An object containing `promise` promise object, `resolve` and `reject` functions.
     */
    withResolvers<T>(): { promise: Promise<T>, resolve: (value: T | PromiseLike<T>) => void, reject: (reason?: any) => void };
  }
}

// https://github.com/tc39/proposal-promise-with-resolvers/blob/3a78801e073e99217dbeb2c43ba7212f3bdc8b83/polyfills.js#L1C1-L9C2
if (Promise.withResolvers === undefined) {
  Promise.withResolvers = () => {
    const out: any = {};
    out.promise = new Promise((resolve_, reject_) => {
      out.resolve = resolve_;
      out.reject = reject_;
    });
    return out;
  };
}
// https://github.com/tc39/proposal-accessible-object-hasownproperty/blob/main/polyfill.js
if (!Object.hasOwn) {
  Object.defineProperty(Object, "hasOwn", {
    value: function (object: any, property: any) {
      if (object == null) {
        throw new TypeError("Cannot convert undefined or null to object");
      }
      return Object.prototype.hasOwnProperty.call(Object(object), property);
    },
    configurable: true,
    enumerable: false,
    writable: true,
  });
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
