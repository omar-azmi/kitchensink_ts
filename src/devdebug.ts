/** utility functions for development debugging.
 * 
 * all development debug functions are assigned to global scope upon any import.
 * this is because it is easier to access it that way, and also makes it accessible through the console.
 * 
 * nothing here is re-exported by {@link "mod"}. you will have to import this file directly to use any alias.
 * 
 * @module
*/
import "./_dnt.polyfills.js";

import * as dntShim from "./_dnt.shims.js";


import { console_log, console_table, math_random, object_assign, performance_now } from "./alias.js"
import { downloadBuffer } from "./browser.js"
import { getBgCanvas } from "./image.js"
import { hexStringOfArray, hexStringToArray } from "./stringman.js"


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
	let k = Math.floor(math_random() * 5)
	return ret[k]
}

export const printPerfTable = () => console_table(perf_table, ["testName", "executionTime"])

export interface DebugWindowCanvasControls {
	canvas: HTMLCanvasElement
	ctx: CanvasRenderingContext2D
	resize: (width?: number, height?: number) => void
	redraw: () => void
	play: (fps?: number) => number
	pause: () => void
}

/** preview the offscreen canvas obtainable via {@link getBgCanvas}, on a separate popup debug window.
 * 
 * alternatively, you can provide your own canvas source to preview on a separate popup debug window.
 * 
 * @param source_canvas a canvas source. defaults to {@link getBgCanvas} from the {@link image} module if none is provided
 * @param fps number of times the popup canvas will be updated in a second
 * @returns a popup window object with the ability to control the canvas through the {@link DebugWindowCanvasControls} interface
*/
export const popupCanvas = (source_canvas?: CanvasImageSource, fps?: number): Window & DebugWindowCanvasControls => {
	const
		bg_canvas = source_canvas as (Exclude<CanvasImageSource, VideoFrame>) ?? getBgCanvas(),
		debug_window = globalThis.open("", "canvas_debug", "popup=true")!,
		canvas = debug_window.document.createElement("canvas"),
		ctx = canvas.getContext("2d", { desynchronized: true })!
	let play_id: number | undefined = undefined
	const
		resize = (width: number = bg_canvas.width as number, height: number = bg_canvas.height as number) => {
			canvas.width = width
			canvas.height = height
		},
		redraw = () => ctx.drawImage(bg_canvas, 0, 0),
		play = (fps: number = 30) => {
			if (play_id === undefined) {
				play_id = setInterval(requestAnimationFrame, 1000 / fps, () => {
					resize()
					redraw()
				})
			}
			return play_id
		},
		pause = () => {
			clearInterval(play_id)
			play_id = undefined
		}
	debug_window.document.body.appendChild(canvas)
	canvas.setAttribute("style", "outline: solid 5px;")
	canvas.animate({
		outlineColor: ["red", "green", "blue", "red"]
	}, {
		duration: 1000,
		iterations: Infinity
	})
	play(fps)
	return object_assign(debug_window, { canvas, ctx, resize, redraw, play, pause })
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
			for (let i = 0; i < len; i++) {
				this.parseFile(files[i]).then(data => this.loaded_data.push(data))
			}
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
		const
			bin = new Uint8Array(buf),
			t0 = performance_now(),
			[value, bytesize] = this.schema.decode(bin, 0),
			t1 = performance_now()
		console_log("parse time: ", t1 - t0, "ms")
		console_log("loaded data: ", value)
		return value
	}

	/** clear the loaded data to free memory */
	clearLoadedData(): void {
		while (this.loaded_data.length > 0) { this.loaded_data.pop() }
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

object_assign(dntShim.dntGlobalThis, { dumps, dump, perf, perf_table, printPerfTable, hexStringOfArray, hexStringToArray, FileParser, downloadBuffer })
