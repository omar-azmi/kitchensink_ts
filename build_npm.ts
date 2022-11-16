import { emptyDirSync } from "https://deno.land/std/fs/mod.ts"
import { build } from "https://deno.land/x/dnt/mod.ts"
import { PackageJsonObject } from "https://deno.land/x/dnt@0.31.0/lib/types.ts"

const deno_package = JSON.parse(Deno.readTextFileSync("./deno.json"))
const npm_package_partial: PackageJsonObject = { name: "", version: "0.0.0" }
{
	const { name, version, description, author, license, repository, bugs } = deno_package
	Object.assign(npm_package_partial, { name, version, description, author, license, repository, bugs })
}

emptyDirSync("./npm/")
Deno.mkdirSync("./npm/esm/", { recursive: true })
Deno.mkdirSync("./npm/script/")

Deno.copyFileSync("./readme.md", "./npm/readme.md")

await build({
	entryPoints: ["./src/mod.ts"],
	outDir: "./npm/",
	shims: { deno: false },
	packageManager: deno_package.node_packageManager,
	package: {
		...npm_package_partial
	},
	compilerOptions: deno_package.compilerOptions
})
