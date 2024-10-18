/** no external library dependencies. as it should be. */
/** flags used for minifying (or eliminating) debugging logs and asserts, when an intelligent bundler, such as `esbuild`, is used. */
export var DEBUG;
(function (DEBUG) {
    DEBUG[DEBUG["LOG"] = 0] = "LOG";
    DEBUG[DEBUG["ASSERT"] = 0] = "ASSERT";
    DEBUG[DEBUG["ERROR"] = 0] = "ERROR";
    DEBUG[DEBUG["PRODUCTION"] = 1] = "PRODUCTION";
    DEBUG[DEBUG["MINIFY"] = 1] = "MINIFY";
})(DEBUG || (DEBUG = {}));
// TODO: before releasing version `0.9.0`, take care of the following:
// - [ ] rename the following submodules (and also take care of potential doc link breakdown when using `!module_name`):
//   - [ ] `builtin_aliases` -> `aliases`
//   - [ ] `builtin_aliases_deps` -> `aliases_deps`
//   - [x] `crypto` -> `cryptoman` ? unsure about this one
//   - [x] `path` -> `pathman`
// - [ ] fix the doc examples so that they do not error when `deno test --doc "./src/"` is ran.
// - [ ] populate the doc examples with legitimate test cases using `"jsr:@std/assert"` for assertion.
// - [ ] fix the `slice` and `splice` (and maybe there are other methods as well) method issue with your custom subclasses of `Array`, `Map`, and `Set`,
//       which result in the creation of a new subclass when these methods are called, instead of creating a classic `Array`, `Map`, or `Set`.
//       potential solution involves the creation of a utility function that does `slice` and `splice` on `Array` subclasses without invoking their `slice` or `splice` methods.
// - [ ] add your "AWS Signature Version 4" computation algorithm to `cryptoman.ts`.
//       for that, you will also have to create aliases for `Crypto.subtle`.
//       but the tradeoff it has is that `Crypto.subtle` is only available in "https" (secure) website contexts, and standalone js runtimes (deno, cloudflare workers, node, bun, etc...)
// - [ ] add `promiseman` submodule that specializes in promise based utility functions.
// - [ ] migrate the following functions and objects to the `timeman`, `aliases_deps`, and `promiseman` submodules, as you see fit:
//   - `promiseTimeout`, `debounce`, `debounceAndShare`, `throttle`, `throttleAndTrail`, `THROTTLE_REJECT`, `TIMEOUT`
// - [ ] migrate data uri manipilation/parsing features in the `image` submodule to the `pathman` submodule.
