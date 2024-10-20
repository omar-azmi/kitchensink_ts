/** no external library dependencies. as it should be. */

/** flags used for minifying (or eliminating) debugging logs and asserts, when an intelligent bundler, such as `esbuild`, is used. */
export const enum DEBUG {
	LOG = 0,
	ASSERT = 0,
	ERROR = 0,
	PRODUCTION = 1,
	MINIFY = 1,
}

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
// - [x] put your DIY deno mascot somewhere in the repo's readme, and make sure that the svg is uploaded to jsr and npm
// - [ ] IDEA: make "megaman robot master" like ascii-art mascots for each of your submodule ending with a "man" (i.e. "cryptoman", "pathman", "stringman", etc...), and put them in your module-level comment.
// - [x] in "pathman.ts", rename references to "unix" and "unix-style" with "posix". can't believe you swapped posix for unix *facepalm*.
// - [x] in "pathman.ts", make all doc tests more readable by using single letter directory names.
