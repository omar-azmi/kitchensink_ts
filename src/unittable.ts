/** utility functions for assigning units to values, converting from one unit to another, and creating string representations.
 * 
 * @module
 * @beta
*/

export interface UnitQuantity {
	/** numeric value of the quantity */
	value: number
	/** units of the quantity */
	units: string
	/** string representation generation method. `repr` function has to be a traditional `function` (non-arrow), so that it's boundable*/
	repr(): string
}

export interface Fraction extends UnitQuantity {
	units: "fraction"
	repr: typeof fraction_repr
}

function fraction_repr(this: Fraction) {
	return (this.value * 100).toFixed(1) + "%"
}

export const makeFraction = (value: number): Fraction => ({
	value,
	units: "fraction",
	repr: fraction_repr
})
