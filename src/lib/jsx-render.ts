import { Constructor, JSXIntrinsicProps } from '../classes/types.js';
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
export function jsxToLiteral<
    TR,
    A extends {
        [key: string]: any;
    }
>(
    tag:
        | string
        | ((attrs?: A) => JSXElementLiteral)
        | (Constructor<any> & {
              is: string;
          }),
    attrs: A | null,
    ...children: (TR | any)[]
): JSXElementLiteral {
    let tagName: string;
    if (typeof tag === 'string') {
        tagName = tag;
    } else if (
        (typeof tag === 'object' || typeof tag === 'function') &&
        'is' in tag
    ) {
        tagName = tag.is;
    } else if (typeof tag === 'function') {
        return (tag as (attrs?: A) => JSXElementLiteral)(attrs!);
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
