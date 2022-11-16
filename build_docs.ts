import { emptyDirSync } from "https://deno.land/std/fs/mod.ts"
import { doc, DocOptions } from "https://deno.land/x/deno_doc/mod.ts"

emptyDirSync("./docs/")
const docs_json = await doc("file:/" + Deno.realPathSync("./src/mod.ts"))
Deno.writeFileSync("./docs/docs.json", new TextEncoder().encode(JSON.stringify(docs_json)))
