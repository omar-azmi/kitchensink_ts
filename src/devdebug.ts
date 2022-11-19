/** utility functions for development debugging. <br>
 * all development debug functions are assigned to global scope upon any import; <br>
 * because it's easier to access it that way, and also makes it accessible through the console.
 * @module
*/
import * as dntShim from "./_dnt.shims.js";


import { downloadBuffer } from "./browser.js"
import { TypedArray } from "./typedefs.js"

/** access your global dump array. dump anything into it using {@link dump} */
export const dumps: any[] = []

/** dump data from anywhere into the globally scoped {@link dumps} array variable */
export const dump = (...data: any[]) => dumps.push(...data)

/** customize the hex-string visualization made by {@link hexStringOf} using these options */
export interface hexStringOf_Options {
	/** separator character string between bytes. <br> **defaults to** `", "` */
	sep: string
	/** what string to prefix every hex-string byte with? <br> **defaults to** `"0x"` */
	prefix: string
	/** what string to add to the end of every hex-string byte? <br> **defaults to** `""` (an empty string) */
	postfix: string
	/** do you want to include a trailing {@link sep} after the final byte? <br>
	 * example output when true: `"[0x01, 0x02, 0x03,]"`, <br>
	 * example output when false: `"[0x01, 0x02, 0x03]"`. <br>
	 * **defaults to** `false`
	*/
	trailing_sep: boolean
	/** the left bracket string. <br> **defaults to** `"["` */
	bra: string
	/** the right bracket string. <br> **defaults to** `"]"` */
	ket: string
	/** do we want upper case letters for the hex-string? <br> **defaults to** `true` */
	toUpperCase: boolean
	/** provide an alernate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
	 * use `16` for a hex-string, or `2` for binary-string, accepted values must be between `2` and `36` <br>
	 * **defaults to** `16`
	*/
	radix: number
}

const default_options_hexStringOf: hexStringOf_Options = {
	sep: ", ",
	prefix: "0x",
	postfix: "",
	trailing_sep: false,
	bra: "[",
	ket: "]",
	toUpperCase: true,
	radix: 16,
}

/** convert an array of numbers to hex-string, for the sake of easing representation, or for visual purposes. <br>
 * it's also moderately customizable via `options` using the {@link hexStringOf_Options} interface. <br>
*/
export const hexStringOf = (arr: number[] | TypedArray, options: Partial<hexStringOf_Options>) => {
	const
		{ sep, prefix, postfix, trailing_sep, bra, ket, toUpperCase, radix, } = { ...default_options_hexStringOf, ...options },
		num_arr: number[] = (arr as TypedArray).buffer ? Array.from(arr as TypedArray) : arr as number[],
		str = num_arr.map(v => {
			let s = v.toString(radix)
			s = s.length === 2 ? s : "0" + s
			if (toUpperCase) return s.toUpperCase()
			return s
		}).reduce((str, s) => str + prefix + s + postfix + sep, "")
	return bra + str.substring(0, str.length - (trailing_sep ? 0 : sep.length)) + ket
}


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

Object.assign(dntShim.dntGlobalThis, { dumps, dump, hexStringOf, FileParser, downloadBuffer })
