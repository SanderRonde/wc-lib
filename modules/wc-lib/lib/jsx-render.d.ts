import { Constructor } from '../classes/types.js';
export interface JSXElementLiteral {
    readonly strings: TemplateStringsArray;
    readonly values: ReadonlyArray<unknown>;
}
/**
 * Converts JSX to a template-literal type representation
 *
 * @template TR - The template result
 * @template A - The type of the attributes
 *
 * @param {string|((attrs?: A) => {strings: TemplateStringsArray;values: any[];})|Constructor<any> & { is: string; }} tag - The tag
 * 	itself. Can either be a string, a class instance that contains an
 *  `is` property that will be used, or a function that returns
 *  a template result
 * @param {{ [key: string]: any; }|null} attrs - The attributes
 * 	of this tag
 * @param {(TR|any[]} children - Child of this template. Either
 * 	a result of this function (so nested JSX templates) or
 * 	something else such as a value.
 *
 * @returns {{ strings: TemplateStringsArray; values: any[]; }} A
 * 	representation of the JSX element in template literal form
 */
export declare function jsxToLiteral<TR, A extends {
    [key: string]: any;
}>(tag: string | ((attrs?: A) => JSXElementLiteral) | (Constructor<any> & {
    is: string;
}), attrs: A | null, ...children: (TR | any)[]): JSXElementLiteral;
//# sourceMappingURL=jsx-render.d.ts.map