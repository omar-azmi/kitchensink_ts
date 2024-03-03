# Kitchensink
A messy modular collection of personal utility functions that I use all the time. <br>
Written in `Typescript` with `TypeDoc` documents generator, highly minifiable when bundled, and has no external dependencies. <br>

A wise billionaire once said: *whenever you encounter a ~~`(...func) => {tion}`~~ that's called more than twice, you should* **"let that sink in"** - Musk le Elon abu Twitter et al...

To get started for `node/npm` shadow repo clone jutsu the `npm` branch in your existing project directory:
```cmd
pnpm add -D github:omar-azmi/kitchensink_ts#npm
```

And now, import whatever the heck you like:
```ts
// import { antigravity } from "python@3.12"
import { setDotPath } from "jsr:@azmi/kitchensink/dotkeypath"
import { pack } from "jsr:@azmi/kitchensink/eightpack"
import { downloadBuffer } from "jsr:@azmi/kitchensink/browser"
// or why not use a single import?
// import { setDotPath, pack, downloadBuffer } from "kitchensink"

const statement = { I: { am: { very: { stupidly: undefined } } } }
let bin_str = ""
setDotPath(statement, "I.am.very.stupidly", "defined")
if (statement.I.am.very.stupidly === "defined") bin_str += "kermit da leap of faith no jutsu"
downloadBuffer(pack("str", bin_str), "i am very smart.txt", "text/plain")
alert("plz download the virus text file")
```

The module and submodule docs are available at [github-pages](https://omar-azmi.github.io/kitchensink_ts/) <br>
for you to figure out the REST api yuaSerufu. <br>
once your tradesecret&#x2122; functions are registered, stage the action transformation sequence, duel in the ancient egyptian era of merge conflicts, and finally Kermit neck rope - said Dumbledwarf **calmly**, knowing very well that MangoSoft was scheming to Copilot his consciousness into the copypasta realm of ~~shadow~~ purple. <br>

Non-mandatory example
```ts
/** TODO */
```
