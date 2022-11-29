/** access your global dump array. dump anything into it using {@link dump} */
export declare const dumps: any[];
/** dump data from anywhere into the globally scoped {@link dumps} array variable */
export declare const dump: (...data: any[]) => number;
export declare const perf_table: {
    testName: string;
    executionTime: number;
}[];
export declare const perf: (testname: string, timeoffset: number, callback: Function, ...args: any[]) => any;
export declare const printPerfTable: () => void;
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
