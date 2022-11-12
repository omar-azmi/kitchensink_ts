import { Application, TSConfigReader } from "typedoc"

let [ argv, exec_path, host_root_path ] = process.argv
host_root_path = host_root_path || "/"

/** use:
 * - `"/"` for localhost (default if unspecified in argv)
 * - `"/kitchensink-ts/"` for github pages
*/
const site_root = host_root_path

async function main() {
	const docs = new Application()
	docs.options.addReader(new TSConfigReader())
	docs.bootstrap({
		entryPoints: [
			"./src/browser.ts",
			"./src/crypto.ts",
			"./src/devdebug.ts",
			"./src/eightpack.ts",
			"./src/image.ts",
			"./src/numericarray.ts",
			"./src/struct.ts",
			"./src/typedbuffer.ts",
			"./src/typedefs.ts",
		],
		readme: "./readme.md",
		out: "./docs/",
		skipErrorChecking: true,
		githubPages: true,
		includeVersion: true,
		titleLink: site_root,
		sidebarLinks: {
			"readme": site_root,
			//"index": site_root + "modules/index.html",
			//"utility": site_root + "modules/utility.html",
		},
		sort: [ "source-order", "required-first", "kind", ],
	})

	const project = docs.convert()
	if (project) {
		// Project may not have converted correctly
		const outputDir = "./docs/"
		// Rendered docs
		await docs.generateDocs(project, outputDir)
	}
}

main().catch(console.error)
