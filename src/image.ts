/** utility functions for handling images along with canvas tools
 * @module
*/

import { positiveRect, Rect } from "./struct.js"

let multipurpose_canvas: HTMLCanvasElement
let multipurpose_ctx: CanvasRenderingContext2D
const init_multipurpose_canvas = () => {
	multipurpose_canvas = document.createElement("canvas")
	multipurpose_ctx = multipurpose_canvas.getContext("2d")!
}

/** extract the {@link ImageData} from an image source (of type {@link CanvasImageSource}), with optional cropping. <br>
 * due to the fact that this function utilizes a `canvas`, it is important to note that the output `ImageData` is sometimes lossy in nature,
 * because gpu-accelarated web-browsers *approximate* the colors, and also due to rounding errors from/to internal float-valued colors and output
 * integer-valued colors. <br>
 * but generally speaking, the `ImageData` can be lossless if all of the following are satisfied:
 * - disable gpu-acceleration of your web-browser, through the `flags` page
 * - your `img` source has either no alpha-channel, or 100% visible alpha-channel throughout (ie non-transparent image)
 * - you have pre-multiplied alpha disabled (this part can be achieved by this library, but I havn't looked into it yet)
 * @param img an image source can be an `HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`, etc..
 * @param crop_rect dimension of the cropping rectangle. leave as `undefined` if you wish not to crop, or only provide a partial {@link Rect}
*/
export const constructImageData = (img: CanvasImageSource | HTMLImageElement, crop_rect?: Partial<Rect>): ImageData => {
	const { width, height, x, y } = positiveRect({ x: 0, y: 0, width: Number(img.width), height: Number(img.height), ...crop_rect })
	if (!multipurpose_ctx) init_multipurpose_canvas()
	multipurpose_canvas.width = width
	multipurpose_canvas.height = height
	multipurpose_ctx.clearRect(0, 0, width, height)
	multipurpose_ctx.drawImage(img, -x, -y)
	return multipurpose_ctx.getImageData(0, 0, width, height)
}

/** get a grayscale intensity bitmap of multi-channel `pixel_buf` image buffer, with optional alpha that negates intensity if zero <br>
 * @param pixels_buf flattened pixel bytes
 * @param channels number of color channels (ie: bytes per pixel). for instance, you'd use `4` for RGBA, `3` for RGB, `1` for L, `2` for AL, etc...
 * @param alpha_channel specify which channel is the alpha channel, or leave it as `undefined` to dictate lack of thereof. for instance, you'd use `3` for RGB**A**, `0` for **A**L, and `undefined` for RGB
 * @param alpha_bias if alpha is present, you can specify the minimum alpha value required for the pixel to be visible. anything less will make the pixel dull
*/
export const intensityBitmap = (pixels_buf: Uint8Array | Uint8ClampedArray, channels: number, alpha_channel: number | undefined, alpha_bias: number = 1): Uint8Array => {
	const
		pixel_len = pixels_buf.length / channels,
		alpha_visibility = new Uint8ClampedArray(pixel_len).fill(1),
		intensity = new Uint8ClampedArray(pixel_len)
	if (alpha_channel !== undefined) {
		for (let i = 0; i < pixel_len; i++) alpha_visibility[i] = pixels_buf[i * channels + alpha_channel] < alpha_bias ? 0 : 1
		pixels_buf = pixels_buf.filter((v, i) => (i % channels) === alpha_channel ? false : true) // remove alpha channel bytes from `pixel_buf` and redefine it
		channels-- // because alpha channel has been discarded
	}
	// channel by channel, sum each channel's value to intensity
	for (let ch = 0; ch < channels; ch++) for (let i = 0; i < pixel_len; i++) intensity[i] += pixels_buf[i * channels + ch]
	// finally, if necessary, multiply each `intensity` pixel by its `alpha_visibility`
	if (alpha_channel !== undefined) for (let i = 0; i < pixel_len; i++) intensity[i] *= alpha_visibility[i]
	return new Uint8Array(intensity.buffer)
}

export const randomRGBA = (alpha?: undefined | number) => {
	console.error("not implemented")
}
