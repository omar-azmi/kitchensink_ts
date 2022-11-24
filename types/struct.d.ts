/** utility functions for common object structures
 * @module
*/
/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields */
export type Rect = {
    x: number;
    y: number;
    width: number;
    height: number;
};
/** get an equivalent rect where all dimensions are positive */
export declare const positiveRect: (r: Rect) => Rect;
