/**
 * Functions related to color manipulation in the CSS
 */
export declare namespace Color {
    /**
     * An interface representing a color by
     * containing its `r`, `g`, `b` and
     * `a` properties
     */
    interface RGBAColorRepresentation {
        r: number;
        g: number;
        b: number;
        a: number;
    }
    /**
     * An interface representing a color by
     * containing its `r`, `g`, `b` and (optionally)
     * `a` properties
     */
    interface RGBColorRepresentation {
        r: number;
        g: number;
        b: number;
        a?: number;
    }
    /**
     * Returns the color representation of a string, converting it from
     * an RGB, hex or regular string to an object with the r, g, b and a properties.
     * Returns black (aka { r: 0, g: 0, b: 0, a: 100 }) if something went wrong parsing
     * the color.
     *
     * @param {string} color - The color of which to get the representation
     *
     * @returns {RGBAColorRepresentation} - A representation of this color
     * in object-form.
     */
    function getColorRepresentation(color: string): RGBAColorRepresentation;
    /**
     * Turns a color that is in color representation back into
     * a css-usable rgb(r, g, b, a) string.
     * If an RGBColorRepresentation is passed, alpha is set to 100.
     *
     * @param {RGBAColorRepresentation|RGBColorRepresentation} color - A color representation
     *
     * @returns {string} - The color in rgb(r, g, b, a) format.
     */
    function toStringColor(color: RGBAColorRepresentation | RGBColorRepresentation): string;
    /**
     * Changes the opacity of a given color to the specified number (between 0 and 100).
     * Overrides the opacity instead of multiplying them.
     * So if the passed color has opacity 50 and 25 is passed,
     * the new opacity is 0.25 instead of 0.25*0.50
     *
     * @param {string} color - The color to change
     * @param {number} alpha - The new alpha value. A number between 0 and 100
     * 	where 0 means fully opaque and 100 means fully shown
     *
     * @returns {string} The new color
     */
    function changeOpacity(color: string, alpha: number): string;
    /**
     * Returns true if the color is dark, where a dark color has
     * r, g and b values lower than 100 after multiplying them with
     * the alpha value. Exact formula:
     *
     * `r * (a/100) < 100 && g * (a/100) < 100 && b * (a/100) < 100`
     *
     * @param {string} color - The color to check
     *
     * @returns {boolean} Whether this is a dark color
     */
    function isDark(color: string): boolean;
    /**
     * Converts a string in color RGB color representation format to
     * one in RGBA color representation after specifying its alpha value
     *
     * @param {RGBColorRepresentation} color - The color to change
     * @param {number} [alpha] An optional alpha value. Is set to 100 by default
     *
     * @returns {RGBAColorRepresentation} The color in RGBA color representation
     */
    function RGBToRGBA(color: RGBColorRepresentation, alpha?: number): RGBAColorRepresentation;
    /**
     * Merges two colors by adding their individual `r`, `g`,
     * `b` and `a` properties. This can be used to give an existing
     * color a tint of some other color. When `subtract` is set to true,
     * subtracts the second color instead, allowing for darkening
     *
     * @param {string|RGBColorRepresentation|RGBAColorRepresentation} color1 - The first (base) color
     * @param {string|RGBColorRepresentation|RGBAColorRepresentation} color2 - The second color which is
     * 	added or (if `subtract` is true) subtracted from the first color
     * @param {boolean} [subtract] - Whether to subtract the second color
     * instead of adding it (false by default)
     *
     * @returns {string} The new (merged) color
     */
    function mergeColors(color1: string | RGBColorRepresentation | RGBAColorRepresentation, color2: string | RGBColorRepresentation | RGBAColorRepresentation, subtract?: boolean): string;
}
//# sourceMappingURL=color.d.ts.map