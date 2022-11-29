/** utility functions for development debugging. <br>
 * all development debug functions are assigned to global scope upon any import; <br>
 * because it's easier to access it that way, and also makes it accessible through the console.
 * @module
*/

import { downloadBuffer } from "./browser.ts"
import { hexStringOfArray, hexStringToArray } from "./stringman.ts"

/** access your global dump array. dump anything into it using {@link dump} */
export const dumps: any[] = []

/** dump data from anywhere into the globally scoped {@link dumps} array variable */
export const dump = (...data: any[]) => dumps.push(...data)

export const perf_table: { testName: string, executionTime: number }[] = []

export const perf = (testname: string, timeoffset: number, callback: Function, ...args: any[]) => {
	// five repetitions are conducted, but only the final test's performance time is noted in order to discard any performance losses from "cold-booting" the test function
	let t0 = 0, t1 = 0, ret = []
	for (let i = 0; i < 5; i++) {
		t0 = performance.now()
		ret.push(callback(...args))
		t1 = performance.now()
	}
	perf_table.push({ testName: testname, executionTime: (t1 - t0) - (timeoffset ?? 0) })
	let k = Math.floor(Math.random() * 5)
	return ret[k]
}

export const printPerfTable = () => console.table(perf_table, ["testName", "executionTime"])

interface SchemaNode<T extends any, TypeName extends string> {
	encode: (value: T) => Uint8Array
	decode: (buffer: Uint8Array, offset: number, ...args: any[]) => [value: T, bytesize: number]
	value?: T
}

/** parse files based on a specific schema `S`
 * TODO clean this up. re-purpose it correctly. create interface for the required `encode` and `decode` functions required by the parser
*/
export class FileParser<S extends SchemaNode<any, string>> {
	/** the html input element that provides a gateway for user file selection */
	readonly loader_input: HTMLInputElement = document.createElement("input")
	readonly downloader_link: HTMLAnchorElement = document.createElement("a")
	readonly file_reader = new FileReader()
	/** schema to be used for encoding and decoding */
	readonly schema: S
	/** a list of decoded files. you can delete the entries here to save up memory */
	loaded_data: NonNullable<S["value"]>[] = []

	/**
	 * @param schema which schema class to base the decoding and encoding on
	 * @param attach_to where do you wish to attach the `loader_input` html element? if `undefined`, it will not get attached to the DOM. default = document.body
	*/
	constructor(schema: S, attach_to: HTMLElement | undefined = document.body) {
		this.schema = schema
		this.loader_input.type = "file"
		this.loader_input.innerHTML = "load file"
		this.loader_input.onchange = () => {
			const
				files = this.loader_input.files!,
				len = files.length
			for (let i = 0; i < len; i++) this.parseFile(files[i]).then(data => this.loaded_data.push(data))
		}
		this.downloader_link.innerHTML = "download file"
		if (attach_to instanceof HTMLElement) {
			attach_to.appendChild(this.loader_input)
			attach_to.appendChild(this.downloader_link)
		}
	}

	/** parse and decode the provided file */
	parseFile(file: File) {
		return new Promise<NonNullable<S["value"]>>((resolve, reject) => {
			this.file_reader.readAsArrayBuffer(file)
			this.file_reader.onload = () => resolve(this.parseBuffer(this.file_reader.result as ArrayBuffer))
			this.file_reader.onerror = () => reject(this.file_reader.error)
		})
	}

	/** parse and decode the provided buffer */
	parseBuffer(buf: ArrayBuffer): NonNullable<S["value"]> {
		console.time("parse time")
		const
			bin = new Uint8Array(buf),
			[value, bytesize] = this.schema.decode(bin, 0)
		console.timeEnd("parse time")
		console.log("loaded data: ", value)
		return value
	}

	/** clear the loaded data to free memory */
	clearLoadedData(): void {
		while (this.loaded_data.length > 0) this.loaded_data.pop()
	}

	/** encode the provided javascript object into a `Uint8Array` bytes array using `this.schema.encode` */
	encodeObject(value: NonNullable<S["value"]>): Uint8Array {
		return this.schema.encode(value)
	}

	/** download the provided javascript object as a binary blob, by encoding it based on `this.schema.encode` */
	downloadObject(value: NonNullable<S["value"]>, filename: string = "") {
		const blob = new Blob([this.encodeObject(value)], { type: "application/octet-stream" })
		const url = URL.createObjectURL(blob)
		this.downloader_link.setAttribute("href", url)
		this.downloader_link.setAttribute("download", filename)
		this.downloader_link.click() // start downloading
	}
}

Object.assign(globalThis, { dumps, dump, perf, perf_table, printPerfTable, hexStringOfArray, hexStringToArray, FileParser, downloadBuffer })
