# TODO

## pre-version `0.9.0` todo list
- [x] create the "docs/improve-1" branch for changes related to documentation and minification repair of `builtin_aliases_deps.ts`.
- [ ] create the "docs/improve-2" branch for all changes related to documentation repair/upgrade.
- [x] rename the following submodules (and also take care of potential doc link breakdown when using `!module_name`):
  - [x] ~~`builtin_aliases` -> `aliases`~~
    - [x] ended up deleting this submodule
  - [x] `builtin_aliases_deps` -> `alias`
  - [x] `crypto` -> `cryptoman` ? unsure about this one
  - [x] `path` -> `pathman`
- [ ] fix the doc examples so that they do not error when `deno test --doc "./src/"` is ran.
- [ ] populate the doc examples with legitimate test cases using `"jsr:@std/assert"` for assertion.
- [ ] fix the `slice` and `splice` (and maybe there are other methods as well) method issue with your custom subclasses of `Array`, `Map`, and `Set`,
      which result in the creation of a new subclass when these methods are called, instead of creating a classic `Array`, `Map`, or `Set`.
      potential solution involves the creation of a utility function that does `slice` and `splice` on `Array` subclasses without invoking their `slice` or `splice` methods.
- [ ] add your "AWS Signature Version 4" computation algorithm to `cryptoman.ts`.
      for that, you will also have to create aliases for `Crypto.subtle`.
      but the tradeoff it has is that `Crypto.subtle` is only available in "https" (secure) website contexts, and standalone js runtimes (deno, cloudflare workers, node, bun, etc...)
- [ ] add `promiseman` submodule that specializes in promise based utility functions.
- [ ] migrate the following functions and objects to the `timeman`, `aliases_deps`, and `promiseman` submodules, as you see fit:
  - `promiseTimeout`, `debounce`, `debounceAndShare`, `throttle`, `throttleAndTrail`, `THROTTLE_REJECT`, `TIMEOUT`
- [ ] migrate data uri manipilation/parsing features in the `image` submodule to the `pathman` submodule.
- [x] put your DIY deno mascot somewhere in the repo's readme, and make sure that the svg is uploaded to jsr and npm
- [ ] IDEA: make "megaman robot master" like ascii-art mascots for each of your submodule ending with a "man" (i.e. "cryptoman", "pathman", "stringman", etc...), and put them in your module-level comment.
- [x] in "pathman.ts", rename references to "unix" and "unix-style" with "posix". can't believe you swapped posix for unix _facepalm_.
- [x] in "pathman.ts", make all doc tests more readable by using single letter directory names.
- [x] in "binder.ts", give a doc comment to each exported binding function, just so that it'll raise your jsr score.
  - [x] my doc comments were not parsed, unfortunately. I may have to try a different format to ensure that they get parsed.
        possible contenders are:
    - [x] use the following style for each declaration:
    ```ts
    /** binding function for `class_proto.fnName1`. */
    export const binderFnName1 = /*@__PURE__*/ bindMethodFactoryByName(class_proto, "fnName1")
    /** binding function for `class_proto.fnName2`. */
    export const binderFnName2 = /*@__PURE__*/ bindMethodFactoryByName(class_proto, "fnName2")
    ```
    - [x] ~~the removal of the `/*@__PURE__*/` declaration may also be a solution (albeit non-negotiable)~~
    ```ts
    export const
    	/** binding function for `class_proto.fnName1`. */
    	binderFnName1 = bindMethodFactoryByName(class_proto, "fnName1"),
    	/** binding function for `class_proto.fnName2`. */
    	binderFnName2 = bindMethodFactoryByName(class_proto, "fnName2")
    ```
- [x] in "alias.ts" ~~and "builtin_alias.ts"~~, give a doc comment to each exported alias function, just so that it'll raise your jsr score.
- [x] port over your `detectReadableStreamType` function from [`@oazmi/build-tools/deps`](https://github.com/omar-azmi/build_tools_ts) to this library.
- [x] erase the todo list from `/src/deps.ts`
- [x] in `pathman`, make `uri_protocol_and_scheme_mapping` exportable, so that the end user may add additional uri schemes of their liking.
