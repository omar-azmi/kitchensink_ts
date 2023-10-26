/** some build specific utility functions */
import { ensureDir } from "https://deno.land/std@0.204.0/fs/mod.ts"
import { join as pathJoin } from "https://deno.land/std@0.204.0/path/mod.ts"
import { BuildOptions, PackageJson } from "https://deno.land/x/dnt@0.38.1/mod.ts"

export const mainEntrypoint: string = "./src/mod.ts"
export const subEntrypoints: string[] = [
	"./src/array2d.ts",
	"./src/binder.ts",
	"./src/browser.ts",
	"./src/builtin_aliases_deps.ts",
	"./src/builtin_aliases.ts",
	"./src/collections.ts",
	"./src/crypto.ts",
	"./src/devdebug.ts",
	"./src/dotkeypath.ts",
	"./src/eightpack.ts",
	"./src/eightpack_varint.ts",
	"./src/formattable.ts",
	"./src/image.ts",
	"./src/lambda.ts",
	"./src/lambdacalc.ts",
	"./src/mapper.ts",
	"./src/numericarray.ts",
	"./src/numericmethods.ts",
	"./src/stringman.ts",
	"./src/struct.ts",
	"./src/typedbuffer.ts",
	"./src/typedefs.ts",
]

export interface LeftoverArtifacts {
	cleanup: () => Promise<void>
}

export interface TemporaryFiles extends LeftoverArtifacts {
	dir: string
	files: string[]
}

interface NPM_Artifacts extends TemporaryFiles {
	files: ["package.json", "tsconfig.json"]
}

let deno_json: { [key: string]: any }
export const getDenoJson = async (base_dir: string = "./") => {
	deno_json ??= JSON.parse(await Deno.readTextFile(pathJoin(base_dir, "./deno.json")))
	return deno_json
}

export const createPackageJson = async (deno_json_dir: string = "./", overrides: Partial<PackageJson> = {}): Promise<PackageJson> => {
	const { name, version, description, author, license, repository, bugs, devDependencies } = await getDenoJson(deno_json_dir)
	return {
		name: name ?? "",
		version: version ?? "0.0.0",
		description, author, license, repository, bugs, devDependencies,
		...overrides
	}
}

export const createTSConfigJson = async (deno_json_dir: string = "./", overrides: Partial<{ compilerOptions: BuildOptions["compilerOptions"] }> = {}): Promise<{ "$schema": string, compilerOptions: BuildOptions["compilerOptions"] }> => {
	const { compilerOptions } = await getDenoJson(deno_json_dir)
	// remove "deno.ns" from compiler options, as it breaks `dnt` (I think)
	compilerOptions.lib = (compilerOptions.lib as string[]).filter((v) => v.toLowerCase() !== "deno.ns")
	Object.assign(compilerOptions,
		{
			target: "ESNext",
			forceConsistentCasingInFileNames: true,
			skipLibCheck: true,
			moduleResolution: "nodenext",
		},
		overrides.compilerOptions,
	)
	delete overrides.compilerOptions
	return {
		"$schema": "https://json.schemastore.org/tsconfig",
		...overrides,
		compilerOptions,
	}
}

export const createNPMFiles = async (
	deno_json_dir: string = "./",
	npm_base_dir: string = "./",
	package_json_overrides: Partial<PackageJson> = {},
	tsconfig_json_overrides: any = {}
): Promise<NPM_Artifacts> => {
	const
		package_json_path = pathJoin(npm_base_dir, "package.json"),
		tsconfig_json_path = pathJoin(npm_base_dir, "tsconfig.json")

	await ensureDir(npm_base_dir)
	await Promise.all([
		createPackageJson(deno_json_dir, package_json_overrides)
			.then((package_json_output) => Deno.writeTextFile(
				pathJoin(npm_base_dir, "package.json"),
				JSON.stringify(package_json_output)
			)),
		createTSConfigJson(deno_json_dir, tsconfig_json_overrides)
			.then((tsconfig_json_output) => Deno.writeTextFile(
				pathJoin(npm_base_dir, "tsconfig.json"),
				JSON.stringify(tsconfig_json_output)
			)),
	])

	return {
		dir: npm_base_dir,
		files: ["package.json", "tsconfig.json"],
		cleanup: async () => {
			await Promise.all([
				Deno.remove(package_json_path, { recursive: true }),
				Deno.remove(tsconfig_json_path, { recursive: true }),
			])
		}
	}
}
