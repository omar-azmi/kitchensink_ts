/** utility functions for handling images along with canvas tools
 * @module
*/

import { number_isInteger, promise_resolve } from "./builtin_aliases.ts"
import { Rect, SimpleImageData, positiveRect } from "./struct.ts"
import { concatTyped, sliceSkipTypedSubarray } from "./typedbuffer.ts"
import { Optional } from "./typedefs.ts"

export type AnyImageSource = string | Uint8Array | Uint8ClampedArray | ArrayBuffer | Array<number> | ImageBitmapSource
export type ImageMIMEType = `image/${"gif" | "jpeg" | "jpg" | "png" | "svg+xml" | "webp"}`
export type Base64ImageHeader = `data:${ImageMIMEType};base64,`
export type Base64ImageString = `${Base64ImageHeader}${string}`
export type ImageBlob = Blob & { type: ImageMIMEType }
declare global {
	interface OffscreenCanvas {
		/** see [MDN docs](https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/convertToBlob)
		 * @deprecated "lib.dom" now defines `convertToBlob` correctly
		*/
		// convertToBlob: (options?: Partial<{ type: ImageMIMEType, quality: number }>) => Promise<ImageBlob>
	}
}

let bg_canvas: OffscreenCanvas
let bg_ctx: OffscreenCanvasRenderingContext2D

export const getBGCanvas = (init_width?: number, init_height?: number) => {
	bg_canvas ??= new OffscreenCanvas(init_width ?? 10, init_height ?? 10)
	return bg_canvas
}

export const getBGCtx = (init_width?: number, init_height?: number) => {
	if (bg_ctx === undefined) {
		bg_ctx = getBGCanvas(init_width, init_height).getContext("2d", { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D
		bg_ctx.imageSmoothingEnabled = false
	}
	return bg_ctx
}

/** check of the provided string is a base64 string, by simply observing if it starts with `"data:image/"` */
export const isBase64Image = (str?: string): str is Base64ImageString => str === undefined ? false : str.startsWith("data:image/")

/** get the header of a base64 image <br>
 * @example
 * ```ts
 * const img_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD..."
 * const img_header = getBase64ImageHeader(img_uri) // == "data:image/png;base64,"
 * ```
*/
export const getBase64ImageHeader = (str: Base64ImageString): Base64ImageHeader => str.slice(0, str.indexOf(";base64,") + 8) as Base64ImageHeader

/** get the mime type of a base64 image <br>
 * @example
 * ```ts
 * const img_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD..."
 * const img_mime = getBase64ImageMIMEType(img_uri) // == "image/png"
 * ```
*/
export const getBase64ImageMIMEType = (str: Base64ImageString): ImageMIMEType => str.slice(5, str.indexOf(";base64,")) as ImageMIMEType

/** get the body data portion of a base64 image <br>
 * @example
 * ```ts
 * const img_uri = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAD..."
 * const img_body = getBase64ImageBody(img_uri) // == "iVBORw0KGgoAAAANSUhEUgAAD..."
 * ```
*/
export const getBase64ImageBody = (str: Base64ImageString): string => str.substring(str.indexOf(";base64,") + 8)

/** load an image as a `Blob`, with the choosen optional `type` encoding (default is "image/png"). <br>
 * possible image sources are:
 * - data uri for base64 encoded image `string`
 * - http uri path `string`
 * - file uri path `string`
 * - buffer of RGBA pixel byte data as `Uint8Array`, `Uint8ClampedArray`, `ArrayBuffer`, or `Array<number>`
 * - `ImageBitmapSource`, which includes:
 *   - `Blob`
 *   - `ImageData`
 *   - `HTMLCanvasElement` or `OffscreenCanvas`
 *   - `HTMLImageElement` or `SVGImageElement` or `HTMLVideoElement`
 *   - `ImageBitmap`
 * 
 * @param img_src anything image representation that can be constructed into an `ImageBitmap` using {@link constructImageBitmapSource}
 * @param width when using `Uint8Array`, `Uint8ClampedArray`, `ArrayBuffer`, or `Array<number>` as `img_src`, you must necessarily provide the width of the image
 * @param crop_rect specify a cropping rectangle
 * @param bitmap_options these are {@link ImageBitmapOptions} that can be used for optionally cropping the `img_src`, changing its colorSpace, etc...
 * @param blob_options specify `type`: {@link ImageMIMEType} and `quality`: number to encode your output Blob into
 * note that when using `Uint8Array`, `Uint8ClampedArray`, `ArrayBuffer`, or `Array<number>`, your should provide a `width` as the second argument to this function <br>
 * you can also provide an optional image element as the third argument to load the given img_src onto, otherwise a new one will be made
*/
export const constructImageBlob = async (img_src: AnyImageSource, width?: number, crop_rect?: Rect, bitmap_options?: ImageBitmapOptions, blob_options?: Parameters<OffscreenCanvas["convertToBlob"]>[0]): Promise<ImageBlob> => {
	if (crop_rect) crop_rect = positiveRect(crop_rect)
	const
		bitmap_src = await constructImageBitmapSource(img_src, width),
		bitmap = crop_rect ?
			await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) :
			await createImageBitmap(bitmap_src, bitmap_options),
		canvas = getBGCanvas(),
		ctx = getBGCtx()
	canvas.width = bitmap.width
	canvas.height = bitmap.height
	ctx.globalCompositeOperation = "copy"
	ctx.resetTransform()
	ctx.drawImage(bitmap, 0, 0)
	return canvas.convertToBlob(blob_options) as Promise<ImageBlob>
}

/** extract the {@link ImageData} from an image source (of type {@link CanvasImageSource}), with optional cropping. <br>
 * due to the fact that this function utilizes a `canvas`, it is important to note that the output `ImageData` is sometimes lossy in nature,
 * because gpu-accelarated web-browsers *approximate* the colors, and also due to rounding errors from/to internal float-valued colors and output
 * integer-valued colors. <br>
 * but generally speaking, the `ImageData` can be lossless if all of the following are satisfied:
 * - disable gpu-acceleration of your web-browser, through the `flags` page
 * - your `img_src` has either no alpha-channel, or 100% visible alpha-channel throughout (ie non-transparent image)
 * - you have pre-multiplied alpha disabled (this part can be achieved by this library, but I haven't looked into it yet)
 * also check out [script](https://github.com/backspaces/agentscript/blob/master/src/RGBADataSet.js#L27) for using webgl for reading and writing bitmap pixels without losing color accuracy due to alpha premultiplication
 * @param img_src an image source can be an `HTMLImageElement`, `HTMLCanvasElement`, `ImageBitmap`, etc..
 * @param crop_rect dimension of the cropping rectangle. leave as `undefined` if you wish not to crop, or only provide a partial {@link Rect}
*/
export const constructImageData = async (img_src: AnyImageSource, width?: number, crop_rect?: Rect, bitmap_options?: ImageBitmapOptions, image_data_options?: ImageDataSettings): Promise<ImageData> => {
	if (crop_rect) crop_rect = positiveRect(crop_rect)
	const
		bitmap_src = await constructImageBitmapSource(img_src, width),
		bitmap = crop_rect ?
			await createImageBitmap(bitmap_src, crop_rect.x, crop_rect.y, crop_rect.width, crop_rect.height, bitmap_options) :
			await createImageBitmap(bitmap_src, bitmap_options),
		canvas = getBGCanvas(),
		ctx = getBGCtx()
	canvas.width = bitmap.width
	canvas.height = bitmap.height
	ctx.globalCompositeOperation = "copy"
	ctx.resetTransform()
	ctx.drawImage(bitmap, 0, 0)
	return ctx.getImageData(0, 0, bitmap.width, bitmap.height, image_data_options)
}

export const constructImageBitmapSource = (img_src: AnyImageSource, width?: number): Promise<ImageBitmapSource> => {
	if (typeof img_src === "string") {
		const new_img_element: HTMLImageElement = new Image()
		new_img_element.src = img_src
		return new_img_element
			.decode()
			.then(() => new_img_element)
	} else if (img_src instanceof Uint8ClampedArray) {
		return promise_resolve(new ImageData(img_src, width!))
	} else if (ArrayBuffer.isView(img_src)) {
		return constructImageBitmapSource(new Uint8ClampedArray(img_src.buffer), width)
	} else if (img_src instanceof ArrayBuffer) {
		return constructImageBitmapSource(new Uint8ClampedArray(img_src), width)
	} else if (img_src instanceof Array) {
		return constructImageBitmapSource(Uint8ClampedArray.from(img_src), width)
	}
	return promise_resolve(img_src as Exclude<typeof img_src, string | ArrayBufferView | ArrayBuffer | Array<number>>)
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

type PaddingCondition = {
	1: (v: number) => number
	2: (l: number, a: number) => number
	3: (r: number, g: number, b: number) => number
	4: (r: number, g: number, b: number, a: number) => number
}

/** get the bounding box {@link Rect} of an image, based on an accumulative `padding_condition` function that should return
 * `0.0` for padding/whitespace/empty pixels, and positive numbers (usually `1.0`) for non-padding/important pixels. <br>
 * if the summation of `padding_condition` applied onto a particular row, or column of pixels is less than
 * `minimum_non_padding_value`, then that entire row/column will be counted as an empty padding space. <br>
 * else if the summation of `padding_condition` is greater than `minimum_non_padding_value`, then that specific
 * row/column will be counted as one of the bounding box's sides. <br>
 * take a look at {@link trimImagePadding} to get an understanding of a potential use case. <br>
 * you do not need to specify the number of channels in your `img_data`, because it will be calculated automatically
 * via `img_data.width`, `img_data.height`, and `img_data.data.length` <br>
 * ### a note on performance
 * almost all performance depends purely on the complexity of your `padding_condition` <br>
 * if the equations in `padding_condition` use square-roots, exponents, if conditions, then expect a major performance drop <br>
 * if your equations consist only of `+, -, *, /`, then the performance will be much faster. <br>
 * I've benchmarked this function, and defining `rowAt`, `colAt`, and `nonPaddingValue` outside of this function, instead of
 * inlining them makes no difference. <br>
 * also, substituting `padding_condition` in `nonPaddingValue` with the actual arithmetic function via inlining (and thus
 * avoiding constant function calls) makes no difference, thanks to JIT doing the inlining on its own in V8. <br>
 * finally, the `colAt` inline function is suprisingly super fast (close to `rowAt`). and so, bounding top and bottom
 * is not at all visibly quicker than bounding left and right.
*/
export const getBoundingBox = <Channels extends (1 | 2 | 3 | 4) = 4>(
	img_data: SimpleImageData,
	padding_condition: PaddingCondition[Channels],
	minimum_non_padding_value: number = 1
): Rect => {
	const
		{ width, height, data } = img_data,
		channels = data.length / (width * height) as Channels,
		rowAt = (y: number) => data.subarray((y * width) * channels, (y * width + width) * channels),
		colAt = (x: number) => {
			const col = new Uint8Array(height * channels)
			for (let y = 0; y < height; y++)
				for (let ch = 0; ch < channels; ch++)
					col[y * channels + ch] = data[(y * width + x) * channels + ch]
			return col
		},
		nonPaddingValue = (data_row_or_col: typeof data) => {
			let non_padding_value = 0
			for (let px = 0, len = data_row_or_col.length; px < len; px += channels)
				non_padding_value += padding_condition(data_row_or_col[px + 0], data_row_or_col[px + 1], data_row_or_col[px + 2], data_row_or_col[px + 3])
			return non_padding_value
		}
	console.assert(number_isInteger(channels))
	let [top, left, bottom, right] = [0, 0, height, width]
	// find top bounding row
	for (; top < height; top++) if (nonPaddingValue(rowAt(top)) >= minimum_non_padding_value) break
	// find bottom bounding row
	for (; bottom >= top; bottom--) if (nonPaddingValue(rowAt(bottom)) >= minimum_non_padding_value) break
	// find left bounding column
	for (; left < width; left++) if (nonPaddingValue(colAt(left)) >= minimum_non_padding_value) break
	// find right bounding column
	for (; right >= left; right--) if (nonPaddingValue(colAt(right)) >= minimum_non_padding_value) break
	return {
		x: left,
		y: top,
		width: right - left,
		height: bottom - top,
	}
}

/** crop an {@link ImageData} or arbitrary channel {@link SimpleImageData} with the provided `crop_rect` <br>
 * the orignal `img_data` is not mutated, and the returned cropped image data contains data that has been copied over.
*/
export const cropImageData = <Channels extends (1 | 2 | 3 | 4) = 4>(img_data: SimpleImageData, crop_rect: Partial<Rect>) => {
	const
		{ width, height, data } = img_data,
		channels = data.length / (width * height) as Channels,
		crop = positiveRect({ x: 0, y: 0, width, height, ...crop_rect }),
		[top, left, bottom, right] = [crop.y, crop.x, crop.y + crop.height, crop.x + crop.width]
	console.assert(number_isInteger(channels))
	// trim padding from top, left, bottom, and right
	const
		row_slice_len = crop.width * channels,
		skip_len = ((width - right) + (left - 0)) * channels,
		trim_start = (top * width + left) * channels,
		trim_end = ((bottom - 1) * width + right) * channels,
		cropped_data_rows = sliceSkipTypedSubarray(data, row_slice_len, skip_len, trim_start, trim_end),
		cropped_data = concatTyped(...cropped_data_rows),
		cropped_img_data: SimpleImageData = channels === 4 ?
			new ImageData(cropped_data as Uint8ClampedArray, crop.width, crop.height) :
			{
				width: crop.width,
				height: crop.height,
				data: cropped_data,
				colorSpace: img_data.colorSpace ?? "srgb"
			}
	return cropped_img_data
}

/** trim the padding of an image based on sum of pixel conditioning of each border's rows and columns <br>
 * @example
 * for example, to trim the whitespace border pixels of an "RGBA" image, irrespective of the alpha,
 * and a minimum requirement of at least three non-near-white pixels in each border row and column,
 * you would design your `padding_condition` as such:
 * ```ts
 * // distance between pixel's rgb and the white color `(255, 255, 255,)`, should be less than `10 * Math.sqrt(3)` for the pixel to be considered near-white
 * white_padding = (r: number, g: number, b: number, a: number) => (3 * 255**2) - (r**2 + g**2 + b**2) < (3 * 5**2) ? 0.0 : 1.0
 * trimmed_img_data = trimImagePadding(img_data, white_padding, 3.0)
 * ```
*/
export const trimImagePadding = <Channels extends (1 | 2 | 3 | 4)>(
	img_data: SimpleImageData,
	padding_condition: PaddingCondition[Channels],
	minimum_non_padding_value: number = 1
): SimpleImageData => cropImageData<Channels>(
	img_data,
	getBoundingBox<Channels>(img_data, padding_condition, minimum_non_padding_value)
)

export interface ImageCoordSpace extends Rect {
	channels: (1 | 2 | 3 | 4)
}

/** get a function that maps index-coordinates of image0-coordinate-space to the index-coordinates of image1-coordinate-space <br>
 * note that if you're mapping lots of indexes using `Array.map`, it would be 40-times faster to use the {@link lambdacalc.vectorize1} function instead <br>
 * @param `coords0` object defining the first ImageCoordSpace
 * @param `coords1` object defining the second ImageCoordSpace 
 * @returns `(i0: number & coord0) => i1 as number & coord1` a function that takes in an integer index from coordinate space coords0 and converts it so that it's relative to coordinate space coords1
 * @example
 * ```ts
 * // suppose you have an RGBA image data buffer of `width = 100`, `height = 50`, `channels = 4` <br>
 * // and you have an array of 6 pixel indexes: `idx0 = [1040, 1044, 1048, 1140, 1144, 1148]` <br>
 * // and you want to convert these indexes to that of an LA image data buffer of `width = 10`, `height = 10`, `channels = 2`, `x = 5`, `y = 10`
 * // then:
 * const
 * 	coords0 = {x: 0, y: 0, width: 100, height: 50, channels: 4},
 * 	coords1 = {x: 5, y: 10, width: 10, height: 10, channels: 2},
 * 	coords0_to_coords1 = coordinateTransformer(coords0, coords1),
 * 	idx0 = [4040, 4044, 4048, 4440, 4444, 4448],
 * 	idx1 = idx0.map(coords0_to_coords1) // [10, 12, 14, 30, 32, 34]
 * ```
 * 
 * @derivation
/** the equation for `mask_intervals` can be easily derived as follows:
 * - `p0 = px of data`, `y0 = y-coords of pixel in data`, `x0 = x-coords of pixel in data`, `w0 = width of data`, `c0 = channels of data`
 * - `p1 = px of mask`, `y1 = y-coords of pixel in mask`, `x1 = x-coords of pixel in mask`, `w1 = width of mask`, `c1 = channels of mask`
 * - `y = y-coords of mask's rect`, `x = x-coords of mask's rect`
 * ```ts
 * let
 * 		p0 = (x0 + y0 * w0) * c0,
 * 		x0 = (p0 / c0) % w0,
 * 		y0 = trunc(p0 / (c0 * w0)),
 * 		p1 = (x1 + y1 * w1) * c1,
 * 		x1 = (p1 / c1) % w1,
 * 		y1 = trunc(p1 / (c1 * w1)),
 * 		x  = x0 - x1,
 * 		y  = y0 - y1
 * so {
 * -> p1 / c1 = x1 + y1 * w1
 * -> p1 / c1 = (x0 - x) + (y0 - y) * w1
 * -> p1 / c1 = (((p0 / c0) % w0) - x) + (((p0 / c0) / w0 | 0) - y) * w1
 * -> p1 = c1 * ((((p0 / c0) % w0) - x) + (((p0 / c0) / w0 | 0) - y) * w1)
 * }
 * ```
*/
export const coordinateTransformer = (
	coords0: Optional<ImageCoordSpace, "height" | "x" | "y">,
	coords1: Optional<ImageCoordSpace, "height" | "x" | "y">
): ((i0: number) => number) => {
	const
		{ x: x0, y: y0, width: w0, channels: c0 } = coords0,
		{ x: x1, y: y1, width: w1, channels: c1 } = coords1,
		x = (x1 ?? 0) - (x0 ?? 0),
		y = (y1 ?? 0) - (y0 ?? 0)
	return (i0: number) => c1 * ((((i0 / c0) % w0) - x) + (((i0 / c0) / w0 | 0) - y) * w1)
}

export const randomRGBA = (alpha?: undefined | number) => {
	console.error("not implemented")
}
