import { casingToDashes } from './props.js';
function convertSpecialAttrs(attrs) {
    if (!attrs)
        return attrs;
    const specialAttrs = attrs;
    if (specialAttrs.__listeners || specialAttrs['@']) {
        const specialProps = Object.assign(Object.assign({}, specialAttrs.__listeners), specialAttrs['@']);
        for (const key in specialProps) {
            attrs[`@${key}`] = specialProps[key];
        }
        delete specialAttrs.__listeners;
        delete specialAttrs['@'];
    }
    if (specialAttrs.__component_listeners || specialAttrs['@@']) {
        const specialProps = Object.assign(Object.assign({}, specialAttrs.__component_listeners), specialAttrs['@@']);
        for (const key in specialProps) {
            attrs[`@@${key}`] = specialProps[key];
        }
        delete specialAttrs.__component_listeners;
        delete specialAttrs['@@'];
    }
    if (specialAttrs.__bools || specialAttrs['?']) {
        const specialProps = Object.assign(Object.assign({}, specialAttrs.__bools), specialAttrs['?']);
        for (const key in specialProps) {
            attrs[`?${key}`] = specialProps[key];
        }
        delete specialAttrs.__bools;
        delete specialAttrs['?'];
    }
    if (specialAttrs.__refs || specialAttrs['#']) {
        const specialProps = Object.assign(Object.assign({}, specialAttrs.__refs), specialAttrs['#']);
        for (const key in specialProps) {
            attrs[`#${key}`] = specialProps[key];
        }
        delete specialAttrs.__refs;
        delete specialAttrs['#'];
    }
    return attrs;
}
export const Fragment = Symbol('fragment');
const _Fragment = Fragment;
export class JSXDelayedExecutionCall {
    constructor(tag, attrs, children) {
        this.tag = tag;
        this.attrs = attrs;
        this.children = children;
    }
    collapse(templater) {
        let collapsed = jsxToLiteral(this.tag, this.attrs, ...collapseDeeply(this.children, templater));
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
export function jsx(tag, attrs, ...children) {
    return new JSXDelayedExecutionCall(tag, attrs, children);
}
const _jsx = jsx;
export var html;
(function (html) {
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
    function jsx(tag, attrs, ...children) {
        return _jsx(tag, attrs, ...children);
    }
    html.jsx = jsx;
    /**
     * A JSX fragment
     */
    function Fragment() {
        return _Fragment;
    }
    html.Fragment = Fragment;
    /**
     * A JSX fragment
     */
    function F() {
        return _Fragment;
    }
    html.F = F;
})(html || (html = {}));
/**
 * Checks whether a component with given name is defined in the
 * custom elements registry
 */
function isDefined(name) {
    /* istanbul ignore next */
    if (typeof window === 'undefined' || !window.customElements)
        return true;
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
function containsDelayedExecutions(items, checked = new Set()) {
    return items.some((item) => {
        if (item instanceof JSXDelayedExecutionCall) {
            return true;
        }
        const found = checked.has(item);
        checked.add(item);
        /* istanbul ignore next */
        if (Array.isArray(item) && !found) {
            /* istanbul ignore next */
            return containsDelayedExecutions(item, checked);
        }
        return false;
    });
}
function collapseDeeply(items, templater, checked = new Set()) {
    return items.map((item) => {
        if (item instanceof JSXDelayedExecutionCall) {
            return item.collapse(templater);
        }
        const found = checked.has(item);
        checked.add(item);
        if (Array.isArray(item) && !found) {
            return collapseDeeply(item, templater, checked);
        }
        return item;
    });
}
export function jsxToLiteral(tag, attrs, ...children) {
    var _a;
    if (containsDelayedExecutions(children)) {
        return jsx(tag, attrs, ...children);
    }
    let tagName;
    if (typeof tag === 'string') {
        // Just a regular string
        tagName = tag;
    }
    else if ((typeof tag === 'object' || typeof tag === 'function') &&
        'is' in tag) {
        // A webcomponent
        tagName = tag.is;
        if (!isDefined(tag.is)) {
            /* istanbul ignore next */
            (_a = tag.define) === null || _a === void 0 ? void 0 : _a.call(tag);
        }
    }
    else if (typeof tag === 'function') {
        // Functional component
        /* istanbul ignore next */
        const returnValue = tag(attrs || {});
        if (returnValue !== _Fragment) {
            // Regular functional component return value
            return returnValue;
        }
        // Fragment
        const filteredChildren = children.filter((child) => child !== false);
        const strings = new Array(filteredChildren.length + 1).fill('');
        const stringsArr = strings;
        stringsArr.raw = strings;
        return {
            strings: stringsArr,
            values: filteredChildren,
        };
    }
    else {
        console.warn('Unknown tag value');
        return { strings: [], values: [] };
    }
    const strings = [];
    const values = [];
    let openTagClosed = false;
    const newAttrs = convertSpecialAttrs(attrs);
    const hasAttrs = !!(newAttrs && Object.getOwnPropertyNames(newAttrs).length);
    const filteredChildren = children.filter((child) => child !== false);
    const hasChildren = !!filteredChildren.length;
    if (!hasAttrs && !hasChildren) {
        strings.push(`<${tagName}></${tagName}>`);
        const arr = strings;
        arr.raw = strings;
        return {
            strings: arr,
            values,
        };
    }
    if (hasAttrs) {
        // There are some attributes
        let firstArg = true;
        for (const key in newAttrs) {
            const attrName = casingToDashes(key);
            if (firstArg) {
                strings.push(`<${tagName} ${attrName}="`);
                firstArg = false;
            }
            else {
                strings.push(`" ${attrName}="`);
            }
            values.push(newAttrs[key]);
        }
    }
    else {
        // No attributes, push just the tag
        strings.push(`<${tagName}>`);
        openTagClosed = true;
    }
    if (hasChildren) {
        for (const child of filteredChildren.slice(0, filteredChildren.length - 1)) {
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
    }
    else {
        // The only way for openTagClosed
        // to be true is for hasAttrs to be
        // false. However, if !hasAttrs && !hasChildren
        // the function returns early
        // Push the remaining text
        strings.push(`"></${tagName}>`);
    }
    const arr = strings;
    arr.raw = strings;
    return {
        strings: arr,
        values,
    };
}
//# sourceMappingURL=jsx-render.js.map