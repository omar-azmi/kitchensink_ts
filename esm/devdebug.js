/** utility functions for development debugging. <br>
 * all development debug functions are assigned to global scope upon any import; <br>
 * because it's easier to access it that way, and also makes it accessible through the console.
 * @module
*/
import * as dntShim from "./_dnt.shims.js";
import { downloadBuffer } from "./browser.js";
import { hexStringOfArray, hexStringToArray } from "./stringman.js";
/** access your global dump array. dump anything into it using {@link dump} */
export const dumps = [];
/** dump data from anywhere into the globally scoped {@link dumps} array variable */
export const dump = (...data) => dumps.push(...data);
/** parse files based on a specific schema `S`
 * TODO clean this up. re-purpose it correctly. create interface for the required `encode` and `decode` functions required by the parser
*/
export class FileParser {
    /**
     * @param schema which schema class to base the decoding and encoding on
     * @param attach_to where do you wish to attach the `loader_input` html element? if `undefined`, it will not get attached to the DOM. default = document.body
    */
    constructor(schema, attach_to = document.body) {
        /** the html input element that provides a gateway for user file selection */
        Object.defineProperty(this, "loader_input", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.createElement("input")
        });
        Object.defineProperty(this, "downloader_link", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: document.createElement("a")
        });
        Object.defineProperty(this, "file_reader", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new FileReader()
        });
        /** schema to be used for encoding and decoding */
        Object.defineProperty(this, "schema", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        /** a list of decoded files. you can delete the entries here to save up memory */
        Object.defineProperty(this, "loaded_data", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: []
        });
        this.schema = schema;
        this.loader_input.type = "file";
        this.loader_input.innerHTML = "load file";
        this.loader_input.onchange = () => {
            const files = this.loader_input.files, len = files.length;
            for (let i = 0; i < len; i++)
                this.parseFile(files[i]).then(data => this.loaded_data.push(data));
        };
        this.downloader_link.innerHTML = "download file";
        if (attach_to instanceof HTMLElement) {
            attach_to.appendChild(this.loader_input);
            attach_to.appendChild(this.downloader_link);
        }
    }
    /** parse and decode the provided file */
    parseFile(file) {
        return new Promise((resolve, reject) => {
            this.file_reader.readAsArrayBuffer(file);
            this.file_reader.onload = () => resolve(this.parseBuffer(this.file_reader.result));
            this.file_reader.onerror = () => reject(this.file_reader.error);
        });
    }
    /** parse and decode the provided buffer */
    parseBuffer(buf) {
        console.time("parse time");
        const bin = new Uint8Array(buf), [value, bytesize] = this.schema.decode(bin, 0);
        console.timeEnd("parse time");
        console.log("loaded data: ", value);
        return value;
    }
    /** clear the loaded data to free memory */
    clearLoadedData() {
        while (this.loaded_data.length > 0)
            this.loaded_data.pop();
    }
    /** encode the provided javascript object into a `Uint8Array` bytes array using `this.schema.encode` */
    encodeObject(value) {
        return this.schema.encode(value);
    }
    /** download the provided javascript object as a binary blob, by encoding it based on `this.schema.encode` */
    downloadObject(value, filename = "") {
        const blob = new Blob([this.encodeObject(value)], { type: "application/octet-stream" });
        const url = URL.createObjectURL(blob);
        this.downloader_link.setAttribute("href", url);
        this.downloader_link.setAttribute("download", filename);
        this.downloader_link.click(); // start downloading
    }
}
Object.assign(dntShim.dntGlobalThis, { dumps, dump, hexStringOfArray, hexStringToArray, FileParser, downloadBuffer });