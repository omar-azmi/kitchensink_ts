/** utility functions for handling images along with canvas tools
 * @module
*/
import { Rect } from "./struct.js";
/** extract the {@link ImageData} from an image source (of type {@link CanvasImageSource}), with optional cropping
 * @param img an image source can be an `HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`, etc..
 * @param crop_rect dimension of the cropping rectangle. leave as `undefined` if you wish not to crop, or only provide a partial {@link Rect}
*/
export declare const constructImageData: (img: CanvasImageSource | HTMLImageElement, crop_rect?: Partial<Rect>) => ImageData;
/** get a grayscale intensity bitmap of multi-channel `pixel_buf` image buffer, with optional alpha that negates intensity if zero <br>
 * @param pixels_buf flattened pixel bytes
 * @param channels number of color channels (ie: bytes per pixel). for instance, you'd use `4` for RGBA, `3` for RGB, `1` for L, `2` for AL, etc...
 * @param alpha_channel specify which channel is the alpha channel, or leave it as `undefined` to dictate lack of thereof. for instance, you'd use `3` for RGB**A**, `0` for **A**L, and `undefined` for RGB
 * @param alpha_bias if alpha is present, you can specify the minimum alpha value required for the pixel to be visible. anything less will make the pixel dull
*/
export declare const intensityBitmap: (pixels_buf: Uint8Array | Uint8ClampedArray, channels: number, alpha_channel: number | undefined, alpha_bias?: number) => Uint8Array;
export declare const randomRGBA: (alpha?: undefined | number) => void;
