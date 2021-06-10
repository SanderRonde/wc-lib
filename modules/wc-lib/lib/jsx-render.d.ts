import { Constructor, JSXIntrinsicProps } from '../classes/types.js';
import { Templater } from './template-fn.js';
import { ClassNamesArg } from './shared.js';
export declare const Fragment: unique symbol;
declare const _Fragment: symbol;
export interface JSXElementLiteral {
    readonly strings: TemplateStringsArray;
    readonly values: ReadonlyArray<unknown>;
}
export declare class JSXDelayedExecutionCall {
    tag: string | ((attrs?: any) => JSXElementLiteral | JSXDelayedExecutionCall) | (() => typeof _Fragment) | (Constructor<any> & {
        is: string;
    });
    attrs: any | null;
    children: any[];
    constructor(tag: string | ((attrs?: any) => JSXElementLiteral | JSXDelayedExecutionCall) | (() => typeof _Fragment) | (Constructor<any> & {
        is: string;
    }), attrs: any | null, children: any[]);
    collapse(templater: Templater<any>): any;
}
/**
 * Converts JSX to a template-literal type representation
 *
 * @template TR - The template result
 * @template A - The type of the attributes
 *
 * @param {string|((attrs?: A) => JSXDelayedExecutionCall|{strings: TemplateStringsArray;values: any[];})|Constructor<any> & { is: string; }} tag - The tag
 * 	itself. Can either be a string, a class instance that contains an
 *  `is` property that will be used, or a function that returns
 *  a template result
 * @param {{ [key: string]: any; }|null} attrs - The attributes
 * 	of this tag
 * @param {(TR|any[]} children - Child of this template. Either
 * 	a result of this function (so nested JSX templates) or
 * 	something else such as a value.
 *
 * @returns {JSXDelayedExecutionCall} A	representation of the JSX element
 */
export declare function jsx<TR, A extends {
    [key: string]: any;
}>(tag: string | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall) | (() => typeof _Fragment) | (Constructor<any> & {
    is: string;
}), attrs: A | null, ...children: (TR | JSXDelayedExecutionCall | any)[]): JSXDelayedExecutionCall;
export declare namespace html {
    /**
     * Converts JSX to a template-literal type representation
     *
     * @template TR - The template result
     * @template A - The type of the attributes
     *
     * @param {string|((attrs?: A) => JSXDelayedExecutionCall|{strings: TemplateStringsArray;values: any[];})|Constructor<any> & { is: string; }} tag - The tag
     * 	itself. Can either be a string, a class instance that contains an
     *  `is` property that will be used, or a function that returns
     *  a template result
     * @param {{ [key: string]: any; }|null} attrs - The attributes
     * 	of this tag
     * @param {(TR|any[]} children - Child of this template. Either
     * 	a result of this function (so nested JSX templates) or
     * 	something else such as a value.
     *
     * @returns {JSXDelayedExecutionCall} A	representation of the JSX element
     */
    function jsx<TR, A extends {
        [key: string]: any;
    }>(tag: string | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall) | (() => typeof _Fragment) | (Constructor<any> & {
        is: string;
    }), attrs: A | null, ...children: (TR | JSXDelayedExecutionCall | any)[]): JSXDelayedExecutionCall;
    /**
     * A JSX fragment
     */
    function Fragment(): symbol;
    /**
     * A JSX fragment
     */
    function F(): symbol;
}
/**
 * Converts JSX to a template-literal type representation
 *
 * @template TR - The template result
 * @template A - The type of the attributes
 *
 * @param {string|((attrs?: A) => JSXDelayedExecutionCall|{strings: TemplateStringsArray;values: any[];})|Constructor<any> & { is: string; }} tag - The tag
 * 	itself. Can either be a string, a class instance that contains an
 *  `is` property that will be used, or a function that returns
 *  a template result
 * @param {{ [key: string]: any; }|null} attrs - The attributes
 * 	of this tag
 * @param {(TR|any[]} children - Child of this template. Either
 * 	a result of this function (so nested JSX templates) or
 * 	something else such as a value.
 *
 * @returns {JSXDelayedExecutionCall|{ strings: TemplateStringsArray; values: any[]; }} A
 * 	representation of the JSX element in template literal form
 */
export declare function jsxToLiteral<TR, A extends {
    [key: string]: any;
}>(tag: string | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall) | (() => typeof _Fragment) | (Constructor<any> & {
    is: string;
}), attrs: A | null, ...children: (TR | JSXDelayedExecutionCall | any)[]): JSXDelayedExecutionCall | JSXElementLiteral;
export declare function jsxToLiteral<TR, A extends {
    [key: string]: any;
}>(tag: string | ((attrs?: A) => JSXElementLiteral) | (() => typeof _Fragment) | (Constructor<any> & {
    is: string;
}), attrs: A | null, ...children: (TR | any)[]): JSXElementLiteral;
/**
 * A base JSX IntrinsicElements and ElementAttributesProperty.
 * These can be used to quickly get JSX up and running without
 * needing to use react's whole intrinsic elements set
 *
 * Example usage:
 * ```ts
 import { JSXBase } from 'wc-lib'
  
  declare global {
    namespace JSX {
       type IntrinsicElements = JSXBase.IntrinsicElements;
       type ElementAttributesProperty = JSXBase.ElementAttributesProperty;
    }
  }
  ```
 */
export declare namespace JSXBase {
    type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Omit<Partial<HTMLElementTagNameMap[K]>, 'style'> & {
            class?: ClassNamesArg;
            style?: Partial<CSSStyleDeclaration> | string;
        } & JSXIntrinsicProps;
    } & {
        [K in keyof Omit<SVGElementTagNameMap, 'a'>]: Omit<Partial<SVGElementTagNameMap[K]>, 'style'> & {
            class?: ClassNamesArg;
            style?: Partial<CSSStyleDeclaration> | string;
        } & JSXIntrinsicProps;
    };
    interface ElementAttributesProperty {
        jsxProps: 'jsxProps';
    }
}
export {};
//# sourceMappingURL=jsx-render.d.ts.map