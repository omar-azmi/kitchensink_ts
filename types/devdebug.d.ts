import { TypedArray } from "./typedefs.js";
/** access your global dump array. dump anything into it using {@link dump} */
export declare const dumps: any[];
/** dump data from anywhere into the globally scoped {@link dumps} array variable */
export declare const dump: (...data: any[]) => number;
/** customize the hex-string visualization made by {@link hexStringOf} using these options */
export interface hexStringOf_Options {
    /** separator character string between bytes. <br> **defaults to** `", "` */
    sep: string;
    /** what string to prefix every hex-string byte with? <br> **defaults to** `"0x"` */
    prefix: string;
    /** what string to add to the end of every hex-string byte? <br> **defaults to** `""` (an empty string) */
    postfix: string;
    /** do you want to include a trailing {@link sep} after the final byte? <br>
     * example output when true: `"[0x01, 0x02, 0x03,]"`, <br>
     * example output when false: `"[0x01, 0x02, 0x03]"`. <br>
     * **defaults to** `false`
    */
    trailing_sep: boolean;
    /** the left bracket string. <br> **defaults to** `"["` */
    bra: string;
    /** the right bracket string. <br> **defaults to** `"]"` */
    ket: string;
    /** do we want upper case letters for the hex-string? <br> **defaults to** `true` */
    toUpperCase: boolean;
    /** provide an alernate number base to encode the numbers into. see {@link Number.toString} for more details. <br>
     * use `16` for a hex-string, or `2` for binary-string, accepted values must be between `2` and `36` <br>
     * **defaults to** `16`
    */
    radix: number;
}
/** convert an array of numbers to hex-string, for the sake of easing representation, or for visual purposes. <br>
 * it's also moderately customizable via `options` using the {@link hexStringOf_Options} interface. <br>
*/
export declare const hexStringOf: (arr: number[] | TypedArray, options: Partial<hexStringOf_Options>) => string;
interface SchemaNode<T extends any, TypeName extends string> {
    encode: (value: T) => Uint8Array;
    decode: (buffer: Uint8Array, offset: number, ...args: any[]) => [value: T, bytesize: number];
    value?: T;
}
/** parse files based on a specific schema `S`
 * TODO clean this up. re-purpose it correctly. create interface for the required `encode` and `decode` functions required by the parser
*/
export declare class FileParser<S extends SchemaNode<any, string>> {
    /** the html input element that provides a gateway for user file selection */
    readonly loader_input: HTMLInputElement;
    readonly downloader_link: HTMLAnchorElement;
    readonly file_reader: FileReader;
    /** schema to be used for encoding and decoding */
    readonly schema: S;
    /** a list of decoded files. you can delete the entries here to save up memory */
    loaded_data: NonNullable<S["value"]>[];
    /**
     * @param schema which schema class to base the decoding and encoding on
     * @param attach_to where do you wish to attach the `loader_input` html element? if `undefined`, it will not get attached to the DOM. default = document.body
    */
    constructor(schema: S, attach_to?: HTMLElement | undefined);
    /** parse and decode the provided file */
    parseFile(file: File): Promise<NonNullable<S["value"]>>;
    /** parse and decode the provided buffer */
    parseBuffer(buf: ArrayBuffer): NonNullable<S["value"]>;
    /** clear the loaded data to free memory */
    clearLoadedData(): void;
    /** encode the provided javascript object into a `Uint8Array` bytes array using `this.schema.encode` */
    encodeObject(value: NonNullable<S["value"]>): Uint8Array;
    /** download the provided javascript object as a binary blob, by encoding it based on `this.schema.encode` */
    downloadObject(value: NonNullable<S["value"]>, filename?: string): void;
}
export {};
