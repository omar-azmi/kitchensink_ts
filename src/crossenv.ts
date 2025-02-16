/** a submodule for cross-runtime environment utility functions.
 * 
 * the functions in this submodule do not place a "hard" dependency on the runtime environments.
 * instead, the various runtime-globals are defined as "soft" objects/symbols which may or may not exist.
 * as a result, some of the functions (such as {@link getRuntime}) are very weakly/generically typed,
 * and their results are not narrowed based on your input arguments.
 * the advantage of such is that this submodule will not choke your LSP.
 * not to mention that you'll probably be aware of what runtime you're working with anyway,
 * so you can always use the `as` assertions to confine the return value to a certain runtime's feature.
 * 
 * for most functions in here, you will need to provide the {@link RUNTIME} enum that you are querying for.
 * 
 * to identify your script's current {@link RUNTIME} environment, you'd want to use the {@link identifyCurrentRuntime} function.
 * 
 * TODO: additional features to add in the future:
 * - [ ] filesystem read/writing.
 *       for web/extension runtimes, it will use the browser's FileAccess API (and prompt the user to select the folder),
 *       and couple it with `window.navigator.storage.getDirectory()` for default access.
 *       for workers, we may use `self.navigator.storage.getDirectory()` instead.
 * - [ ] persistent key-value storage: such as `localStorage` or `sessionStorage` or `chrome.storage.sync` or kv-storage of `window.navigator.storage.persist()`.
 * - [ ] system environment variables.
 * - [ ] shell/commandline/terminal command execution.
 * - [ ] (breaking change) consider using a class based approach to calling these functions as methods,
 *       where the currently selected runtime will be known by the class instance,
 *       so that the user will not have to pass down which runtime they are querying for all the time.
 * 
 * @module
*/

import { DEBUG } from "./deps.ts"
import { pathToPosixPath } from "./pathman.ts"
import { isComplex, isObject } from "./struct.ts"


/** javascript runtime enums. */
export const enum RUNTIME {
	/** deno runtime.
	 * 
	 * since deno also supports `process` for node compatibility, you will want to check for deno runtime before checking for node runtime.
	*/
	DENO,

	/** bunjs runtime.
	 * 
	 * since bun also supports `process` for node compatibility, you will want to check for bun runtime before checking for node runtime.
	*/
	BUN,

	/** nodejs runtime. */
	NODE,

	/** chrome-extension runtime.
	 * 
	 * since the `window` context is also available in chrome extensions, it is better to check for this runtime before checking for client-web-page runtime.
	*/
	CHROMIUM,

	/** firefox (or any non-chromium) extension runtime.
	 * 
	 * since the `window` context is also available in chrome extensions, it is better to check for this runtime before checking for client-web-page runtime.
	*/
	EXTENSION,

	/** web-browser runtime. */
	WEB,

	/** worker-script runtime. */
	WORKER,
}

const global_this_object = globalThis as any

/** a map/record of runtime validation functions that determine if the current javascript environment matches a specific runtime.
 * 
 * each key represents a runtime type defined by the {@link RUNTIME} enum,
 * and each value is a function that returns a boolean indicating whether your current environment
 * satisfies the global-object requirements of the given {@link RUNTIME}.
 * 
 * @example
 * ```ts ignore
 * if (currentRuntimeValidationFnMap[RUNTIME.NODE]()) {
 * 	// execute nodejs-specific logic
 * 	console.log("current nodejs working directory is:", process.cwd())
 * }
 * if (currentRuntimeValidationFnMap[RUNTIME.DENO]()) {
 * 	// execute deno-specific logic
 * 	console.log("current deno working directory is:", Deno.cwd())
 * }
 * if (currentRuntimeValidationFnMap[RUNTIME.WEB]()) {
 * 	// execute web-specific logic
 * 	console.log("current webpage's url is:", globalThis.location?.href)
 * }
 * ```
*/
export const currentRuntimeValidationFnMap: Record<RUNTIME, (() => boolean)> = {
	[RUNTIME.DENO]: () => ((global_this_object.Deno?.version) ? true : false),
	[RUNTIME.BUN]: () => ((global_this_object.Bun?.version) ? true : false),
	[RUNTIME.NODE]: () => ((global_this_object.process?.versions) ? true : false),
	[RUNTIME.CHROMIUM]: () => ((global_this_object.chrome?.runtime) ? true : false),
	[RUNTIME.EXTENSION]: () => ((global_this_object.browser?.runtime) ? true : false),
	[RUNTIME.WEB]: () => ((global_this_object.window?.document) ? true : false),
	[RUNTIME.WORKER]: () => ((
		isObject(global_this_object.self)
		&& isComplex(global_this_object.WorkerGlobalScope)
		&& global_this_object.self instanceof global_this_object.WorkerGlobalScope
	) ? true : false),
}

const ordered_runtime_checklist: Array<RUNTIME> = [
	RUNTIME.DENO, RUNTIME.BUN, RUNTIME.NODE, RUNTIME.CHROMIUM,
	RUNTIME.EXTENSION, RUNTIME.WEB, RUNTIME.WORKER,
]

/** identifies the current javascript runtime environment as a {@link RUNTIME} enum.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * 
 * assertEquals(identifyCurrentRuntime(), RUNTIME.DENO)
 * ```
*/
export const identifyCurrentRuntime = (): RUNTIME => {
	for (const runtime of ordered_runtime_checklist) {
		if (currentRuntimeValidationFnMap[runtime]()) { return runtime }
	}
	throw new Error(DEBUG.ERROR ? `failed to detect current javascript runtime!\nplease report this issue to "https://github.com/omar-azmi/kitchensink_ts/issues", along with information on your runtime environment.` : "")
}

/** get the global-runtime-object of the given javascript environment {@link RUNTIME} enum.
 * 
 * > [!note]
 * > if you acquire the global-runtime-object of an environment that is not supported by your actual current environment,
 * > then the returned value will be `undefined`.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * import process from "node:process"
 * 
 * assertEquals(getRuntime(RUNTIME.DENO), Deno)
 * assertEquals(getRuntime(RUNTIME.NODE), process)
 * assertEquals(getRuntime(identifyCurrentRuntime()), Deno)
 * ```
*/
export const getRuntime = (runtime_enum: RUNTIME): any => {
	switch (runtime_enum) {
		case RUNTIME.DENO: return global_this_object.Deno
		case RUNTIME.BUN: return global_this_object.Bun
		case RUNTIME.NODE: return global_this_object.process
		case RUNTIME.CHROMIUM: return global_this_object.chrome
		case RUNTIME.EXTENSION: return global_this_object.browser
		case RUNTIME.WEB: return global_this_object.window
		case RUNTIME.WORKER: return global_this_object.self
		default: throw new Error(DEBUG.ERROR ? `an invalid runtime enum was provided: "${runtime_enum}".` : "")
	}
}

/** retrieves the current working directory or URL based on the specified {@link RUNTIME} enum.
 * 
 * > [!note]
 * > - the returned directory path may or may not end in a trailing slash.
 * >   this is intentional, as it is possible for the path to actually point towards a file.
 * >   (such as in the case of `chrome.runtime.getURL("")`)
 * > - however, the returned path will always use posix separators (only forward slashes, no windows backslashes).
 * > - if you try to query the working directory of a runtime enum that your current environment does not support,
 * >   then an error will be thrown, because you'll be accessing an `undefined` object.
 * 
 * depending on the provided `runtime_enum`, the current working directory is defined as the following:
 * - for `DENO`, `BUN`, and `NODE`: the result will be that of the runtime's `cwd()` method.
 * - for `CHROMIUM` and `EXTENSION`: the result will be the url string obtained from `runtime.getURL("")`.
 * - for `WEB` and `WORKER`: a url string will be returned that will vary based on the `current_path` flag (`true` by default):
 *   - if `current_path == false`: `location.origin` will be returned (i.e. the root of your webpage, which is your domain-name + subdomain-name).
 *   - if `current_path == true`: the directory path of `location.href` will be returned.
 * 
 * @param runtime_enum the runtime enum indicating which runtime's working-directory/url-path to retrieve.
 * @param current_path a boolean flag that, when true, returns the full `href` url of the runtime, rather than the root `origin`. defaults to `true`.
 * @returns a posix string path of the working-directory/url-path of the specified runtime.
 * @throws an error is thrown if the runtime associated with the provided enum is undefined, or if an invalid enum is provided.
 * 
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * import process from "node:process" // this works in deno 2.0
 * 
 * assertEquals(getRuntimeCwd(RUNTIME.DENO), getRuntimeCwd(RUNTIME.NODE))
 * assertEquals(getRuntimeCwd(RUNTIME.DENO), Deno.cwd().replaceAll(/\\\\?/g, "/"))
 * assertEquals(getRuntimeCwd(RUNTIME.NODE), process.cwd().replaceAll(/\\\\?/g, "/"))
 * ```
*/
export const getRuntimeCwd = (runtime_enum: RUNTIME, current_path: boolean = true): string => {
	const runtime = getRuntime(runtime_enum)
	if (!runtime) { throw new Error(DEBUG.ERROR ? `the requested runtime associated with the enum "${runtime_enum}" is undefined (i.e. you're running on a different runtime from the provided enum).` : "") }
	switch (runtime_enum) {
		case RUNTIME.DENO:
		case RUNTIME.BUN:
		case RUNTIME.NODE:
			return pathToPosixPath(runtime.cwd())
		case RUNTIME.CHROMIUM:
		case RUNTIME.EXTENSION:
			return runtime.runtime.getURL("")
		case RUNTIME.WEB:
		case RUNTIME.WORKER:
			return new URL("./", current_path ? runtime.location.href : runtime.location.origin).href
		// the code below is unreachable, because `runtime` woudn'wouldn't be defined unless a valid `runtime_enum` was passed to `getRuntime` anyway.
		// default:
		// throw new Error(DEBUG.ERROR ? `an invalid runtime enum was provided: "${runtime_enum}".` : "")
	}
}
