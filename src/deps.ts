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
//   - [ ] `builtin_aliases` -> `builtin`
//   - [ ] `builtin_aliases_deps` -> `builtin_deps`
//   - [ ] `crypto` -> `cryptoman` ? unsure about this one
//   - [ ] `path` -> `pathman`
// - [ ] fix the doc examples so that they do not error when `deno test --doc "./src/"` is ran.
// - [ ] populate the doc examples with legitimate test cases using `"jsr:@std/assert"` for assertion.
// - [ ] fix the `slice` and `splice` (and maybe there are other methods as well) method issue with your custom subclasses of `Array`, `Map`, and `Set`,
//       which result in the creation of a new subclass when these methods are called, instead of creating a classic `Array`, `Map`, or `Set`.
//       potential solution involves the creation of a utility function that does `slice` and `splice` on `Array` subclasses without invoking their `slice` or `splice` methods.
// - [ ] add your "AWS Signature Version 4" computation algorithm to `cryptoman.ts`.
//       for that, you will also have to create aliases for `Crypto.subtle`.
//       but the tradeoff it has is that `Crypto.subtle` is only available in "https" (secure) website contexts, and standalone js runtimes (deno, cloudflare workers, node, bun, etc...)
