import { Constructor, JSXIntrinsicProps } from '../classes/types.js';
import { Fragment as _Fragment, Templater } from './template-fn.js';
import { casingToDashes } from './props.js';
import { ClassNamesArg } from './shared.js';

type Listeners = {
    [key: string]: (this: any, event: Event) => any;
};

type Bools = {
    [key: string]: boolean;
};

type Refs = {
    [key: string]: any;
};

function convertSpecialAttrs(
    attrs: {
        [key: string]: any;
    } | null
) {
    if (!attrs) return attrs;

    const specialAttrs: {
        [key: string]: any;
    } & Partial<{
        __listeners: Listeners;
        '@': Listeners;
        __component_listeners: Listeners;
        '@@': Listeners;
        __bools: Bools;
        '?': Bools;
        __refs: Refs;
        '#': Refs;
    }> = attrs;

    if (specialAttrs.__listeners || specialAttrs['@']) {
        const specialProps: Listeners = {
            ...specialAttrs.__listeners,
            ...specialAttrs['@'],
        };
        for (const key in specialProps) {
            attrs[`@${key}`] = specialProps[key];
        }
        delete specialAttrs.__listeners;
        delete specialAttrs['@'];
    }
    if (specialAttrs.__component_listeners || specialAttrs['@@']) {
        const specialProps: Listeners = {
            ...specialAttrs.__component_listeners,
            ...specialAttrs['@@'],
        };
        for (const key in specialProps) {
            attrs[`@@${key}`] = specialProps[key];
        }
        delete specialAttrs.__component_listeners;
        delete specialAttrs['@@'];
    }
    if (specialAttrs.__bools || specialAttrs['?']) {
        const specialProps: Bools = {
            ...specialAttrs.__bools,
            ...specialAttrs['?'],
        };
        for (const key in specialProps) {
            attrs[`?${key}`] = specialProps[key];
        }
        delete specialAttrs.__bools;
        delete specialAttrs['?'];
    }
    if (specialAttrs.__refs || specialAttrs['#']) {
        const specialProps: Bools = {
            ...specialAttrs.__refs,
            ...specialAttrs['#'],
        };
        for (const key in specialProps) {
            attrs[`#${key}`] = specialProps[key];
        }
        delete specialAttrs.__refs;
        delete specialAttrs['#'];
    }
    return attrs;
}

export interface JSXElementLiteral {
    readonly strings: TemplateStringsArray;
    readonly values: ReadonlyArray<unknown>;
}

export class JSXDelayedExecutionCall {
    constructor(
        public tag:
            | string
            | ((attrs?: any) => JSXElementLiteral | JSXDelayedExecutionCall)
            | (() => typeof _Fragment)
            | (Constructor<any> & {
                  is: string;
              }),
        public attrs: any | null,
        public children: any[]
    ) {}

    collapse(templater: Templater<any>): any {
        let collapsed = jsxToLiteral(
            this.tag,
            this.attrs,
            ...this.children.map((child): JSXElementLiteral | any => {
                if (child instanceof JSXDelayedExecutionCall) {
                    return child.collapse(templater);
                }
                return child;
            })
        );
        if (collapsed instanceof JSXDelayedExecutionCall) {
            while (collapsed instanceof JSXDelayedExecutionCall) {
                collapsed = collapsed.collapse(templater);
            }
            return collapsed;
        }
        const { strings, values } = collapsed;
        return templater(strings, ...values);
    }
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
export function jsx<
    TR,
    A extends {
        [key: string]: any;
    }
>(
    tag:
        | string
        | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall)
        | (() => typeof _Fragment)
        | (Constructor<any> & {
              is: string;
          }),
    attrs: A | null,
    ...children: (TR | JSXDelayedExecutionCall | any)[]
): JSXDelayedExecutionCall {
    return new JSXDelayedExecutionCall(tag, attrs, children);
}
const _jsx = jsx;
export namespace html {
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
    export function jsx<
        TR,
        A extends {
            [key: string]: any;
        }
    >(
        tag:
            | string
            | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall)
            | (() => typeof _Fragment)
            | (Constructor<any> & {
                  is: string;
              }),
        attrs: A | null,
        ...children: (TR | JSXDelayedExecutionCall | any)[]
    ): JSXDelayedExecutionCall {
        return _jsx(tag, attrs, ...children);
    }

    /**
     * A JSX fragment
     */
    export function Fragment() {
        return _Fragment;
    }

    /**
     * A JSX fragment
     */
    export function F() {
        return _Fragment;
    }
}

/**
 * Checks whether a component with given name is defined in the
 * custom elements registry
 */
function isDefined(name: string) {
    /* istanbul ignore next */
    if (typeof window === 'undefined') return true;
    if (window.customElements.get(name)) {
        return true;
    }
    return false;
}

/**
 * Check whether given array contains delayed execution calls
 * deeply
 *
 * @param {any[]} items - The items to check
 *
 * @returns {boolean} Whether it contains any delayed execution
 *  calls
 */
function containsDelayedExecutions(items: any[]): boolean {
    return items.some((item) => {
        if (item instanceof JSXDelayedExecutionCall) {
            return true;
        }
        if (Array.isArray(item)) {
            return containsDelayedExecutions(item);
        }
        return false;
    });
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
export function jsxToLiteral<
    TR,
    A extends {
        [key: string]: any;
    }
>(
    tag:
        | string
        | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall)
        | (() => typeof _Fragment)
        | (Constructor<any> & {
              is: string;
          }),
    attrs: A | null,
    ...children: (TR | JSXDelayedExecutionCall | any)[]
): JSXDelayedExecutionCall | JSXElementLiteral;
export function jsxToLiteral<
    TR,
    A extends {
        [key: string]: any;
    }
>(
    tag:
        | string
        | ((attrs?: A) => JSXElementLiteral)
        | (() => typeof _Fragment)
        | (Constructor<any> & {
              is: string;
          }),
    attrs: A | null,
    ...children: (TR | any)[]
): JSXElementLiteral;
export function jsxToLiteral<
    TR,
    A extends {
        [key: string]: any;
    }
>(
    tag:
        | string
        | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall)
        | (() => typeof _Fragment)
        | (Constructor<any> & {
              is: string;
              define?(isDevelopment?: boolean, isRoot?: boolean): void;
          }),
    attrs: A | null,
    ...children: (TR | JSXDelayedExecutionCall | any)[]
): JSXElementLiteral | JSXDelayedExecutionCall {
    if (containsDelayedExecutions(children)) {
        return jsx(tag, attrs, ...children);
    }

    let tagName: string;
    if (typeof tag === 'string') {
        // Just a regular string
        tagName = tag;
    } else if (
        (typeof tag === 'object' || typeof tag === 'function') &&
        'is' in tag
    ) {
        // A webcomponent
        tagName = tag.is;

        if (!isDefined(tag.is)) {
            /* istanbul ignore next */
            tag.define?.();
        }
    } else if (typeof tag === 'function') {
        // Functional component

        /* istanbul ignore next */
        const returnValue = (tag as
            | ((attrs?: A) => JSXElementLiteral | JSXDelayedExecutionCall)
            | (() => typeof _Fragment))(attrs || ({} as A));
        if (returnValue !== _Fragment) {
            // Regular functional component return value
            return returnValue;
        }

        // Fragment
        const filteredChildren = children.filter((child) => child !== false);
        const strings = new Array(filteredChildren.length + 1).fill('');
        const stringsArr: Partial<TemplateStringsArray> = strings;
        (stringsArr as any).raw = strings;
        return {
            strings: stringsArr as TemplateStringsArray,
            values: filteredChildren,
        };
    } else {
        console.warn('Unknown tag value');
        return { strings: [] as any, values: [] };
    }
    const strings: string[] = [];
    const values: any[] = [];

    let openTagClosed: boolean = false;

    const newAttrs = convertSpecialAttrs(attrs);
    const hasAttrs = !!(
        newAttrs && Object.getOwnPropertyNames(newAttrs).length
    );
    const filteredChildren = children.filter((child) => child !== false);
    const hasChildren = !!filteredChildren.length;

    if (!hasAttrs && !hasChildren) {
        strings.push(`<${tagName}></${tagName}>`);
        const arr: Partial<TemplateStringsArray> = strings;
        (arr as any).raw = strings;
        return {
            strings: arr as TemplateStringsArray,
            values,
        };
    }

    if (hasAttrs) {
        // There are some attributes
        let firstArg: boolean = true;
        for (const key in newAttrs) {
            const attrName = casingToDashes(key);
            if (firstArg) {
                strings.push(`<${tagName} ${attrName}="`);
                firstArg = false;
            } else {
                strings.push(`" ${attrName}="`);
            }
            values.push(newAttrs[key]);
        }
    } else {
        // No attributes, push just the tag
        strings.push(`<${tagName}>`);
        openTagClosed = true;
    }

    if (hasChildren) {
        for (const child of filteredChildren.slice(
            0,
            filteredChildren.length - 1
        )) {
            if (!openTagClosed) {
                strings.push(`">`);
                openTagClosed = true;
            }
            strings.push('');
            values.push(child);
        }

        values.push(filteredChildren[filteredChildren.length - 1]);
        if (!openTagClosed) {
            strings.push(`">`);
            openTagClosed = true;
        }
        strings.push(`</${tagName}>`);
    } else {
        // The only way for openTagClosed
        // to be true is for hasAttrs to be
        // false. However, if !hasAttrs && !hasChildren
        // the function returns early

        // Push the remaining text
        strings.push(`"></${tagName}>`);
    }

    const arr: Partial<TemplateStringsArray> = strings;
    (arr as any).raw = strings;
    return {
        strings: arr as TemplateStringsArray,
        values,
    };
}

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
export namespace JSXBase {
    export type IntrinsicElements = {
        [K in keyof HTMLElementTagNameMap]: Omit<
            Partial<HTMLElementTagNameMap[K]>,
            'style'
        > & {
            class?: ClassNamesArg;
            style?: Partial<CSSStyleDeclaration> | string;
        } & JSXIntrinsicProps;
    } &
        {
            [K in keyof Omit<SVGElementTagNameMap, 'a'>]: Omit<
                Partial<SVGElementTagNameMap[K]>,
                'style'
            > & {
                class?: ClassNamesArg;
                style?: Partial<CSSStyleDeclaration> | string;
            } & JSXIntrinsicProps;
        };

    export interface ElementAttributesProperty {
        jsxProps: 'jsxProps';
    }
}
