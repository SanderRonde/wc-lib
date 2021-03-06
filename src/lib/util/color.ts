/**
 * Functions related to color manipulation in the CSS
 */
export namespace Color {
    /**
     * An interface representing a color by
     * containing its `r`, `g`, `b` and
     * `a` properties
     */
    export interface RGBAColorRepresentation {
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
    export interface RGBColorRepresentation {
        r: number;
        g: number;
        b: number;
        a?: number;
    }

    const HEX_REGEX = /#([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})/;
    const HEX_ALPHA_REGEX = /#([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})([a-fA-F\d]{2})/;
    const RGB_REGEX = /rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\s*\)/;
    const RGBA_REGEX = /rgba\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d\.)?(\d+)\s*\)/;
    const BLACK: RGBAColorRepresentation = {
        r: 0,
        g: 0,
        b: 0,
        a: 100,
    };

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
    export function getColorRepresentation(
        color: string
    ): RGBAColorRepresentation {
        if (color.startsWith('#') && HEX_ALPHA_REGEX.exec(color)) {
            const match = HEX_ALPHA_REGEX.exec(color);

            const [, a, r, g, b] = match!;
            return {
                r: parseInt(r, 16),
                g: parseInt(g, 16),
                b: parseInt(b, 16),
                a: parseInt(a, 16) / 2.56,
            };
        } else if (color.startsWith('#')) {
            const match = HEX_REGEX.exec(color);
            if (!match) return BLACK;

            const [, r, g, b] = match;
            return {
                r: parseInt(r, 16),
                g: parseInt(g, 16),
                b: parseInt(b, 16),
                a: 100,
            };
        } else if (color.startsWith('rgba')) {
            const match = RGBA_REGEX.exec(color);
            if (!match) return BLACK;

            const [, r, g, b, preDot, postDot] = match;
            return {
                r: parseInt(r, 10),
                g: parseInt(g, 10),
                b: parseInt(b, 10),
                a: preDot ? parseInt(postDot, 10) : parseInt(postDot, 10) * 100,
            };
        } else if (color.startsWith('rgb')) {
            const match = RGB_REGEX.exec(color);
            if (!match) return BLACK;

            const [, r, g, b] = match;
            return {
                r: parseInt(r, 10),
                g: parseInt(g, 10),
                b: parseInt(b, 10),
                a: 100,
            };
        }
        const mapped = colorNameToHex(color);
        if (mapped.startsWith('#')) {
            return getColorRepresentation(mapped);
        }
        return BLACK;
    }

    /**
     * Turns a color that is in color representation back into
     * a css-usable rgb(r, g, b, a) string.
     * If an RGBColorRepresentation is passed, alpha is set to 100.
     *
     * @param {RGBAColorRepresentation|RGBColorRepresentation} color - A color representation
     *
     * @returns {string} - The color in rgb(r, g, b, a) format.
     */
    export function toStringColor(
        color: RGBAColorRepresentation | RGBColorRepresentation
    ): string {
        return `rgba(${color.r}, ${color.g}, ${color.b}, ${(() => {
            if (typeof color.a === 'number') {
                if (color.a === 100) {
                    return '1';
                } else if (color.a < 10) {
                    return `0.0${color.a}`;
                } else {
                    return `0.${color.a}`;
                }
            }
            return '1';
        })()})`;
    }

    const COLOR_NAME_MAP = {
        aliceblue: '#f0f8ff',
        antiquewhite: '#faebd7',
        aqua: '#00ffff',
        aquamarine: '#7fffd4',
        azure: '#f0ffff',
        beige: '#f5f5dc',
        bisque: '#ffe4c4',
        black: '#000000',
        blanchedalmond: '#ffebcd',
        blue: '#0000ff',
        blueviolet: '#8a2be2',
        brown: '#a52a2a',
        burlywood: '#deb887',
        cadetblue: '#5f9ea0',
        chartreuse: '#7fff00',
        chocolate: '#d2691e',
        coral: '#ff7f50',
        cornflowerblue: '#6495ed',
        cornsilk: '#fff8dc',
        crimson: '#dc143c',
        cyan: '#00ffff',
        darkblue: '#00008b',
        darkcyan: '#008b8b',
        darkgoldenrod: '#b8860b',
        darkgray: '#a9a9a9',
        darkgreen: '#006400',
        darkgrey: '#a9a9a9',
        darkkhaki: '#bdb76b',
        darkmagenta: '#8b008b',
        darkolivegreen: '#556b2f',
        darkorange: '#ff8c00',
        darkorchid: '#9932cc',
        darkred: '#8b0000',
        darksalmon: '#e9967a',
        darkseagreen: '#8fbc8f',
        darkslateblue: '#483d8b',
        darkslategray: '#2f4f4f',
        darkslategrey: '#2f4f4f',
        darkturquoise: '#00ced1',
        darkviolet: '#9400d3',
        deeppink: '#ff1493',
        deepskyblue: '#00bfff',
        dimgray: '#696969',
        dimgrey: '#696969',
        dodgerblue: '#1e90ff',
        firebrick: '#b22222',
        floralwhite: '#fffaf0',
        forestgreen: '#228b22',
        fuchsia: '#ff00ff',
        gainsboro: '#dcdcdc',
        ghostwhite: '#f8f8ff',
        gold: '#ffd700',
        goldenrod: '#daa520',
        gray: '#808080',
        green: '#008000',
        greenyellow: '#adff2f',
        grey: '#808080',
        honeydew: '#f0fff0',
        hotpink: '#ff69b4',
        indianred: '#cd5c5c',
        indigo: '#4b0082',
        ivory: '#fffff0',
        khaki: '#f0e68c',
        lavender: '#e6e6fa',
        lavenderblush: '#fff0f5',
        lawngreen: '#7cfc00',
        lemonchiffon: '#fffacd',
        lightblue: '#add8e6',
        lightcoral: '#f08080',
        lightcyan: '#e0ffff',
        lightgoldenrodyellow: '#fafad2',
        lightgray: '#d3d3d3',
        lightgreen: '#90ee90',
        lightgrey: '#d3d3d3',
        lightpink: '#ffb6c1',
        lightsalmon: '#ffa07a',
        lightseagreen: '#20b2aa',
        lightskyblue: '#87cefa',
        lightslategray: '#778899',
        lightslategrey: '#778899',
        lightsteelblue: '#b0c4de',
        lightyellow: '#ffffe0',
        lime: '#00ff00',
        limegreen: '#32cd32',
        linen: '#faf0e6',
        magenta: '#ff00ff',
        maroon: '#800000',
        mediumaquamarine: '#66cdaa',
        mediumblue: '#0000cd',
        mediumorchid: '#ba55d3',
        mediumpurple: '#9370db',
        mediumseagreen: '#3cb371',
        mediumslateblue: '#7b68ee',
        mediumspringgreen: '#00fa9a',
        mediumturquoise: '#48d1cc',
        mediumvioletred: '#c71585',
        midnightblue: '#191970',
        mintcream: '#f5fffa',
        mistyrose: '#ffe4e1',
        moccasin: '#ffe4b5',
        navajowhite: '#ffdead',
        navy: '#000080',
        oldlace: '#fdf5e6',
        olive: '#808000',
        olivedrab: '#6b8e23',
        orange: '#ffa500',
        orangered: '#ff4500',
        orchid: '#da70d6',
        palegoldenrod: '#eee8aa',
        palegreen: '#98fb98',
        paleturquoise: '#afeeee',
        palevioletred: '#db7093',
        papayawhip: '#ffefd5',
        peachpuff: '#ffdab9',
        peru: '#cd853f',
        pink: '#ffc0cb',
        plum: '#dda0dd',
        powderblue: '#b0e0e6',
        purple: '#800080',
        rebeccapurple: '#663399',
        red: '#ff0000',
        rosybrown: '#bc8f8f',
        royalblue: '#4169e1',
        saddlebrown: '#8b4513',
        salmon: '#fa8072',
        sandybrown: '#f4a460',
        seagreen: '#2e8b57',
        seashell: '#fff5ee',
        sienna: '#a0522d',
        silver: '#c0c0c0',
        skyblue: '#87ceeb',
        slateblue: '#6a5acd',
        slategray: '#708090',
        slategrey: '#708090',
        snow: '#fffafa',
        springgreen: '#00ff7f',
        steelblue: '#4682b4',
        tan: '#d2b48c',
        teal: '#008080',
        thistle: '#d8bfd8',
        tomato: '#ff6347',
        turquoise: '#40e0d0',
        violet: '#ee82ee',
        wheat: '#f5deb3',
        white: '#ffffff',
        whitesmoke: '#f5f5f5',
        yellow: '#ffff00',
        yellowgreen: '#9acd32',
    };
    function colorNameToHex(name: string): string {
        if (name in COLOR_NAME_MAP) {
            return COLOR_NAME_MAP[name as keyof typeof COLOR_NAME_MAP];
        }
        return name;
    }

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
    export function changeOpacity(color: string, alpha: number): string {
        const colorRepr = getColorRepresentation(color);
        return toStringColor({ ...colorRepr, a: alpha });
    }

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
    export function isDark(color: string): boolean {
        const { r, g, b, a } = getColorRepresentation(color);
        const normalizedAlpha = a / 100;
        return (
            r * normalizedAlpha < 100 &&
            g * normalizedAlpha < 100 &&
            b * normalizedAlpha < 100
        );
    }

    /**
     * Converts a string in color RGB color representation format to
     * one in RGBA color representation after specifying its alpha value
     *
     * @param {RGBColorRepresentation} color - The color to change
     * @param {number} [alpha] An optional alpha value. Is set to 100 by default
     *
     * @returns {RGBAColorRepresentation} The color in RGBA color representation
     */
    export function RGBToRGBA(
        color: RGBColorRepresentation,
        alpha: number = 100
    ): RGBAColorRepresentation {
        return { ...color, a: alpha };
    }

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
    export function mergeColors(
        color1: string | RGBColorRepresentation | RGBAColorRepresentation,
        color2: string | RGBColorRepresentation | RGBAColorRepresentation,
        subtract: boolean = false
    ): string {
        if (typeof color1 === 'string') {
            color1 = getColorRepresentation(color1);
        } else if (typeof color1.a !== 'number') {
            color1 = RGBToRGBA(color1);
        }
        if (typeof color2 === 'string') {
            color2 = getColorRepresentation(color2);
        } else if (typeof color2.a !== 'number') {
            color2 = RGBToRGBA(color2);
        }

        if (subtract) {
            color2.r *= -1;
            color2.g *= -1;
            color2.b *= -1;
            (color2 as RGBAColorRepresentation).a *= -1;
        }

        return toStringColor({
            r: Math.max(Math.min(color1.r + color2.r, 255), 0),
            g: Math.max(Math.min(color1.g + color2.g, 255), 0),
            b: Math.max(Math.min(color1.b + color2.b, 255), 0),
            a: Math.max(
                Math.min(
                    (color1 as RGBAColorRepresentation).a +
                        (color2 as RGBAColorRepresentation).a,
                    100
                ),
                0
            ),
        });
    }
}
