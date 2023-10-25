
/** use:
 * - `"/"` for localhost (default if unspecified in `Deno.args`)
 * - `"/kitchensink_ts/"` for github pages
*/
const site_root = Deno.args[0] ?? "/"
const out_dir = "./docs/"

import { ensureFile } from "https://deno.land/std@0.204.0/fs/mod.ts"
import { join as pathJoin } from "https://deno.land/std@0.204.0/path/mod.ts"
import { Application as typedocApp } from "npm:typedoc"
import { TemporaryFiles, createNPMFiles, getDenoJson, mainEntrypoint, subEntrypoints } from "./build_tools.ts"

interface CustomCSS_Artifacts extends TemporaryFiles {
	files: ["custom.css"]
}

const createCustomCssFiles = async (base_dir: string = "./", content: string): Promise<CustomCSS_Artifacts> => {
	const file_path = pathJoin(base_dir, "custom.css")
	await ensureFile(file_path)
	await Deno.writeTextFileSync(file_path, content)
	return {
		dir: base_dir,
		files: ["custom.css"],
		cleanup: async () => {
			await Deno.remove(file_path, { recursive: true })
		}
	}
}

const npm_file_artifacts = await createNPMFiles("./")
const { repository } = await getDenoJson()
const custom_css_artifacts = await createCustomCssFiles("./temp/", `
table { border-collapse: collapse; }
th { background-color: rgba(128, 128, 128, 0.50); }
th, td { border: 0.1em solid rgba(0, 0, 0, 0.75); padding: 0.1em; }
`)
const typedoc_app = await typedocApp.bootstrapWithPlugins({
	entryPoints: [mainEntrypoint, ...subEntrypoints],
	out: out_dir,
	readme: "./src/readme.md",
	sidebarLinks: {
		"github": repository.url.replace("git+", "").replace(".git", ""),
		"readme": site_root,
	},
	skipErrorChecking: true,
	githubPages: true,
	includeVersion: true,
	sort: ["source-order", "required-first", "kind"],
	customCss: custom_css_artifacts.files[0]
})

const typedoc_project = await typedoc_app.convert()
if (typedoc_project) {
	await typedoc_app.generateDocs(typedoc_project, out_dir)
}

await npm_file_artifacts.cleanup()
await custom_css_artifacts.cleanup()
