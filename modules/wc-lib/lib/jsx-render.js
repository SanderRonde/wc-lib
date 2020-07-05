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
export function jsxToLiteral(tag, attrs, ...children) {
    let tagName;
    if (typeof tag === 'string') {
        tagName = tag;
    }
    else if ((typeof tag === 'object' || typeof tag === 'function') &&
        'is' in tag) {
        tagName = tag.is;
    }
    else if (typeof tag === 'function') {
        /* istanbul ignore next */
        return tag(attrs || {});
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