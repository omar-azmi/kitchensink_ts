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
 * - [x] filesystem read/writing on system runtimes (deno, bun, and node).
 * - [ ] filesystem read/writing on web/extension runtimes will use the browser's FileAccess API (and prompt the user to select the folder)
 * - [ ] filesystem read/writing on web/extension runtimes will use `window.navigator.storage.getDirectory()`.
 *       and for web workers, we may use `self.navigator.storage.getDirectory()` instead.
 * - [ ] persistent key-value storage: such as `localStorage` or `sessionStorage` or `chrome.storage.sync` or kv-storage of `window.navigator.storage.persist()`.
 *       copy these from your github-aid browser extension project.
 * - [x] system environment variables.
 * - [ ] shell/commandline/terminal command execution.
 * - [ ] (breaking change) consider using a class based approach to calling these functions as methods,
 *       where the currently selected runtime will be known by the class instance,
 *       so that the user will not have to pass down which runtime they are querying for all the time.
 * - [ ] (RISKY) add a `setEnvVariable` function.
 *       but it may corrupt the user's variables if they're not careful, so I don't want to implement it unless I find myself needing it.
 *
 * @module
*/
import "./_dnt.polyfills.js";
import * as dntShim from "./_dnt.shims.js";
import { array_isEmpty, promise_outside } from "./alias.js";
import { DEBUG } from "./deps.js";
import { pathToPosixPath } from "./pathman.js";
import { isComplex, isObject } from "./struct.js";
/** javascript runtime enums. */
export var RUNTIME;
(function (RUNTIME) {
    /** deno runtime.
     *
     * since deno also supports `process` for node compatibility, you will want to check for deno runtime before checking for node runtime.
    */
    RUNTIME[RUNTIME["DENO"] = 0] = "DENO";
    /** bunjs runtime.
     *
     * since bun also supports `process` for node compatibility, you will want to check for bun runtime before checking for node runtime.
    */
    RUNTIME[RUNTIME["BUN"] = 1] = "BUN";
    /** nodejs runtime. */
    RUNTIME[RUNTIME["NODE"] = 2] = "NODE";
    /** chrome-extension runtime.
     *
     * since the `window` context is also available in chrome extensions, it is better to check for this runtime before checking for client-web-page runtime.
    */
    RUNTIME[RUNTIME["CHROMIUM"] = 3] = "CHROMIUM";
    /** firefox (or any non-chromium) extension runtime.
     *
     * since the `window` context is also available in chrome extensions, it is better to check for this runtime before checking for client-web-page runtime.
    */
    RUNTIME[RUNTIME["EXTENSION"] = 4] = "EXTENSION";
    /** web-browser runtime. */
    RUNTIME[RUNTIME["WEB"] = 5] = "WEB";
    /** worker-script runtime. */
    RUNTIME[RUNTIME["WORKER"] = 6] = "WORKER";
})(RUNTIME || (RUNTIME = {}));
const global_this_object = dntShim.dntGlobalThis;
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
export const currentRuntimeValidationFnMap = {
    [RUNTIME.DENO]: () => ((global_this_object.Deno?.version) ? true : false),
    [RUNTIME.BUN]: () => ((global_this_object.Bun?.version) ? true : false),
    [RUNTIME.NODE]: () => ((global_this_object.process?.versions) ? true : false),
    [RUNTIME.CHROMIUM]: () => ((global_this_object.chrome?.runtime) ? true : false),
    [RUNTIME.EXTENSION]: () => ((global_this_object.browser?.runtime) ? true : false),
    [RUNTIME.WEB]: () => ((global_this_object.window?.document) ? true : false),
    [RUNTIME.WORKER]: () => ((isObject(global_this_object.self)
        && isComplex(global_this_object.WorkerGlobalScope)
        && global_this_object.self instanceof global_this_object.WorkerGlobalScope) ? true : false),
};
const ordered_runtime_checklist = [
    RUNTIME.DENO, RUNTIME.BUN, RUNTIME.NODE, RUNTIME.CHROMIUM,
    RUNTIME.EXTENSION, RUNTIME.WEB, RUNTIME.WORKER,
];
/** identifies the current javascript runtime environment as a {@link RUNTIME} enum.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * assertEquals(identifyCurrentRuntime(), RUNTIME.DENO)
 * ```
*/
export const identifyCurrentRuntime = () => {
    for (const runtime of ordered_runtime_checklist) {
        if (currentRuntimeValidationFnMap[runtime]()) {
            return runtime;
        }
    }
    throw new Error(DEBUG.ERROR ? `failed to detect current javascript runtime!\nplease report this issue to "https://github.com/omar-azmi/kitchensink_ts/issues", along with information on your runtime environment.` : "");
};
/** get the global-runtime-object of the given javascript environment {@link RUNTIME} enum.
 *
 * > [!note]
 * > if you acquire the global-runtime-object of an environment that is not supported by your actual current environment,
 * > then the returned value will be `undefined`.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 * import process from "node:process" // this works in deno 2.0
 *
 * assertEquals(getRuntime(RUNTIME.DENO), Deno)
 * assertEquals(getRuntime(RUNTIME.NODE), process)
 * assertEquals(getRuntime(identifyCurrentRuntime()), Deno)
 * ```
*/
export const getRuntime = (runtime_enum) => {
    switch (runtime_enum) {
        case RUNTIME.DENO: return global_this_object.Deno;
        case RUNTIME.BUN: return global_this_object.Bun;
        case RUNTIME.NODE: return global_this_object.process;
        case RUNTIME.CHROMIUM: return global_this_object.chrome;
        case RUNTIME.EXTENSION: return global_this_object.browser;
        case RUNTIME.WEB: return global_this_object.window;
        case RUNTIME.WORKER: return global_this_object.self;
        default: throw new Error(DEBUG.ERROR ? `an invalid runtime enum was provided: "${runtime_enum}".` : "");
    }
};
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
export const getRuntimeCwd = (runtime_enum, current_path = true) => {
    const runtime = getRuntime(runtime_enum);
    if (!runtime) {
        throw new Error(DEBUG.ERROR ? `the requested runtime associated with the enum "${runtime_enum}" is undefined (i.e. you're running on a different runtime from the provided enum).` : "");
    }
    switch (runtime_enum) {
        case RUNTIME.DENO:
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return pathToPosixPath(runtime.cwd());
        case RUNTIME.CHROMIUM:
        case RUNTIME.EXTENSION:
            return runtime.runtime.getURL("");
        case RUNTIME.WEB:
        case RUNTIME.WORKER:
            return new URL("./", current_path ? runtime.location.href : runtime.location.origin).href;
        // the code below is unreachable, because `runtime` woudn'wouldn't be defined unless a valid `runtime_enum` was passed to `getRuntime` anyway.
        // default:
        // throw new Error(DEBUG.ERROR ? `an invalid runtime enum was provided: "${runtime_enum}".` : "")
    }
};
/** retrieves the value of an environment variable on system runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * otherwise an error gets thrown on all other environments, since they do not support environment variables.
 *
 * > [!tip]
 * > - environment variables are case-insensitive.
 * > - you will probably want to normalize path variables to posix path via {@link pathToPosixPath}.
 * > - if `env_var = ""` (an empty string) then `undefined` will always be returned on system-runtime environments.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for querying the environment variable.
 * @param env_var the name of the environment variable to fetch.
 * @returns the environment variable's value.
 * @throws for js-workers, extensions, and web environments, an error gets thrown, as environment variables are not available.
 *
 * @example
 * ```ts
 * import { assertEquals } from "jsr:@std/assert"
 *
 * const my_path_env_var = getEnvVariable(identifyCurrentRuntime(), "path")!
 *
 * assertEquals(typeof my_path_env_var, "string")
 * assertEquals(my_path_env_var.length > 0, true)
 * ```
*/
export const getEnvVariable = (runtime_enum, env_var) => {
    const runtime = getRuntime(runtime_enum);
    if (!runtime) {
        throw new Error(DEBUG.ERROR ? `the requested runtime associated with the enum "${runtime_enum}" is undefined (i.e. you're running on a different runtime from the provided enum).` : "");
    }
    if (!env_var) {
        return;
    }
    switch (runtime_enum) {
        case RUNTIME.DENO:
            return runtime.env.get(env_var);
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return runtime.env[env_var];
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support environment variables` : "");
    }
};
const defaultExecShellCommandConfig = {
    args: []
};
/** execute a shell/terminal command on system runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * otherwise an error gets thrown on all other environments, since they do not support shell command execution.
 *
 * > [!note]
 * > we don't use `Deno.Command` for deno here, because it does not default to your os's native preferred terminal,
 * > and instead you will need to provide one yourself (such as "bash", "cmd", "shell", etc...).
 * > which is why we use `node:child_process` for all three runtimes.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for querying the environment variable.
 * @param command the shell command to execute.
 * @param config optional configuration to apply onto the shell child-process.
 * @returns a promise that is resolved when the child process that executed the command has closed.
 *
 * @example
 * ```ts
 * import { assertEquals, assertStringIncludes } from "jsr:@std/assert"
 *
 * {
 * 	const { stdout, stderr } = await execShellCommand(identifyCurrentRuntime(), "echo Hello World!")
 * 	assertStringIncludes(stdout, "Hello World!")
 * 	assertEquals(stderr, "")
 * }
 *
 * {
 * 	const { stdout, stderr } = await execShellCommand(identifyCurrentRuntime(), "echo", { args: ["Hello", "World!"] })
 * 	assertStringIncludes(stdout, "Hello World!")
 * 	assertEquals(stderr, "")
 * }
 * ```
*/
export const execShellCommand = async (runtime_enum, command, config = {}) => {
    const { args, cwd, signal } = { ...defaultExecShellCommandConfig, ...config }, args_are_empty = array_isEmpty(args), runtime = getRuntime(runtime_enum);
    if (!runtime) {
        throw new Error(DEBUG.ERROR ? `the requested runtime associated with the enum "${runtime_enum}" is undefined (i.e. you're running on a different runtime from the provided enum).` : "");
    }
    if (!command && args_are_empty) {
        return { stdout: "", stderr: "" };
    }
    switch (runtime_enum) {
        case RUNTIME.DENO:
        case RUNTIME.BUN:
        case RUNTIME.NODE: {
            const { exec } = await get_node_child_process(), full_command = args_are_empty ? command : `${command} ${args.join(" ")}`, [promise, resolve, reject] = promise_outside();
            exec(full_command, { cwd: cwd, signal }, (error, stdout, stderr) => {
                if (error) {
                    reject(error.message);
                }
                resolve({ stdout, stderr });
            });
            return promise;
        }
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support shell commands` : "");
    }
};
const defaultWriteFileConfig = {
    append: false,
    create: true,
    mode: undefined,
};
const defaultReadFileConfig = {};
/** writes text data to a file on supported runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * for unsupported runtimes, an error is thrown.
 *
 * TODO: in the future, I would like to create a unified cross-runtime filesystem class under `./crossfs.ts`,
 *   which would support read and write operations, along with memory (internal state) of the current working directory,
 *   in addition to a path resolver method that will rely on `./pathman.ts`'s `resolvePathFactory` function.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for writing onto the filesystem.
 * @param file_path the destination file path.
 * @param text the string content to write.
 * @param config provide optional configuration on how the writing should be performed.
 * @throws an error is thrown if an unsupported runtime uses this function,
 *   or if `config.create` is `false`, and no pre-existing file resides at the specified `file_path`.
*/
export const writeTextFile = async (runtime_enum, file_path, text, config = {}) => {
    const { append, create, mode, signal } = { ...defaultWriteFileConfig, ...config }, node_config = { encoding: "utf8", append, create, mode, signal }, deno_config = { append, create, mode, signal }, runtime = getRuntime(runtime_enum);
    switch (runtime_enum) {
        case RUNTIME.DENO:
            return runtime.writeTextFile(file_path, text, deno_config);
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return node_writeFile(file_path, text, node_config);
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support filesystem writing operations` : "");
    }
};
/** writes binary/buffer data to a file on supported runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * for unsupported runtimes, an error is thrown.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for writing onto the filesystem.
 * @param file_path the destination file path.
 * @param data the byte/buffer data to write to the file.
 * @param config provide optional configuration on how the writing should be performed.
 * @throws an error is thrown if an unsupported runtime uses this function,
 *   or if `config.create` is `false`, and no pre-existing file resides at the specified `file_path`.
*/
export const writeFile = async (runtime_enum, file_path, data, config = {}) => {
    const { append, create, mode, signal } = { ...defaultWriteFileConfig, ...config }, { buffer, byteLength, byteOffset } = data, bytes = data instanceof Uint8Array ? data : new Uint8Array(buffer, byteOffset, byteLength), node_config = { encoding: "binary", append, create, mode, signal }, deno_config = { append, create, mode, signal }, runtime = getRuntime(runtime_enum);
    switch (runtime_enum) {
        case RUNTIME.DENO:
            return runtime.writeTextFile(file_path, bytes, deno_config);
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return node_writeFile(file_path, bytes, node_config);
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support filesystem writing operations` : "");
    }
};
let node_fs, node_child_process;
const import_node_fs = async () => { return import("node:fs/promises"); }, get_node_fs = async () => { return (node_fs ??= await import_node_fs()); }, import_node_child_process = async () => { return import("node:child_process"); }, get_node_child_process = async () => { return (node_child_process ??= await import_node_child_process()); };
const node_writeFile = async (file_path, data, config = {}) => {
    const fs = await get_node_fs(), { append, create, mode, signal, encoding } = { ...defaultWriteFileConfig, ...config }, fs_config = { encoding: encoding, mode, signal };
    // if we are permitted to write on top of existing files, then only a single call to `fs.writeFile` suffices.
    if (create) {
        return fs.writeFile(file_path, data, { ...fs_config, flag: (append ? "a" : "w") });
    }
    // if we must assert the pre-existence of the file, then the process is a little more involved.
    const file = await fs.open(file_path, "r+", mode);
    if (!append) {
        await file.truncate(0);
    }
    await file.appendFile(data, fs_config);
    return file.close();
};
/** reads and returns text data from a file on supported runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * for unsupported runtimes, an error is thrown.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for reading the filesystem.
 * @param file_path the source file path to read from.
 * @param config provide optional configuration on how the reading should be performed.
 * @throws an error is thrown if an unsupported runtime uses this function.
 *
 * @example
 * ```ts
 * import { assertStringIncludes } from "jsr:@std/assert"
 *
 * const my_deno_json = await readTextFile(identifyCurrentRuntime(), new URL(import.meta.resolve("../deno.json")))
 * assertStringIncludes(my_deno_json, `"name": "@oazmi/kitchensink"`)
 * ```
*/
export const readTextFile = async (runtime_enum, file_path, config = {}) => {
    const { signal } = { ...defaultReadFileConfig, ...config }, node_config = { encoding: "utf8", signal }, deno_config = { signal }, runtime = getRuntime(runtime_enum);
    switch (runtime_enum) {
        case RUNTIME.DENO:
            return runtime.readTextFile(file_path, deno_config);
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return (await get_node_fs()).readFile(file_path, node_config);
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support filesystem reading operations` : "");
    }
};
/** reads and returns binary data from a file on supported runtimes (i.e. {@link RUNTIME.DENO}, {@link RUNTIME.BUN}, or {@link RUNTIME.NODE}).
 * for unsupported runtimes, an error is thrown.
 *
 * @param runtime_enum the runtime enum indicating which runtime should be used for reading the filesystem.
 * @param file_path the source file path to read from.
 * @param config provide optional configuration on how the reading should be performed.
 * @throws an error is thrown if an unsupported runtime uses this function.
 *
 * @example
 * ```ts
 * import { assertInstanceOf, assertStringIncludes } from "jsr:@std/assert"
 *
 * const my_deno_json_bytes = await readFile(identifyCurrentRuntime(), new URL(import.meta.resolve("../deno.json")))
 * assertInstanceOf(my_deno_json_bytes, Uint8Array)
 *
 * const my_deno_json = (new TextDecoder()).decode(my_deno_json_bytes)
 * assertStringIncludes(my_deno_json, `"name": "@oazmi/kitchensink"`)
 * ```
*/
export const readFile = async (runtime_enum, file_path, config = {}) => {
    const { signal } = { ...defaultReadFileConfig, ...config }, node_and_deno_config = { signal }, runtime = getRuntime(runtime_enum);
    switch (runtime_enum) {
        case RUNTIME.DENO:
            return runtime.readFile(file_path, node_and_deno_config);
        case RUNTIME.BUN:
        case RUNTIME.NODE:
            return new Uint8Array((await (await get_node_fs()).readFile(file_path, node_and_deno_config)).buffer);
        default:
            throw new Error(DEBUG.ERROR ? `your non-system runtime environment enum ("${runtime_enum}") does not support filesystem reading operations` : "");
    }
};
