import { Constructor } from '../classes/types.js';
/**
 * Converts JSX to a template-literal type representation
 *
 * @template TR - The template result
 *
 * @param {string|Constructor<any> & { is: string; }} tag - The tag
 * 	itself. Can either be a string or a class that can be constructed
 * @param {{ [key: string]: any; }|null} attrs - The attributes
 * 	of this tag
 * @param {(TR|any[]} children - Child of this template. Either
 * 	a result of this function (so nested JSX templates) or
 * 	something else such as a value.
 *
 * @returns {{ strings: TemplateStringsArray; values: any[]; }} A
 * 	representation of the JSX element in template literal form
 */
export declare function jsxToLiteral<TR>(tag: string | (Constructor<any> & {
    is: string;
}), attrs: {
    [key: string]: any;
} | null, ...children: (TR | any)[]): {
    strings: TemplateStringsArray;
    values: any[];
};
//# sourceMappingURL=jsx-render.d.ts.map