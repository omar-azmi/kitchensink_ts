/** utility functions for common object structures
 * @module
*/
/** represents a 2d rectangle. compatible with {@link DOMRect}, without its inherited annoying readonly fields */
import "./_dnt.polyfills.js";
/** get an equivalent rect where all dimensions are positive */
export const positiveRect = (r) => {
    let { x, y, width, height } = r;
    if (width < 0) {
        width *= -1; // width is now positive
        x -= width; // x has been moved further to the left
    }
    if (height < 0) {
        height *= -1; // height is now positive
        y -= height; // y has been moved further to the top
    }
    return { x, y, width, height };
};
