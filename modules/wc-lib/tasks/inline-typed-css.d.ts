/// <reference types="node" />
/**
 * Inlines typed CSS in passed string. Walks every
 * expression to change every instance of
 * a `css().....`. (See below for exceptions). Ignores
 * lines with `// typed-css-ignore` in the line above them
 *
 * For example `css<{}>().id['some-id'].and['some-class']`
 * is replaced with `#some-id.some-class`
 * This saves some processing on the user's
 * end when the file is served
 *
 * Replaces all calls but ignores those
 * that have complex non-string and non-number parameters.
 * For example `css().id[import('x').y]` or `css().attrFn(obj.x}`
 * will not be replaced.
 *
 * @param {string} text - The text in which to replace the calls
 *
 * @returns {string} - The text with typed CSS inlined
 */
export declare function inlineTypedCSS(text: string): string;
/**
 * Inlines typed CSS in piped file
 *
 * For example css<{}>().id['some-id'].and['some-class']
 * is replaced with #some-id.some-class
 * This saves some processing on the user's
 * end when the file is served
 */
export declare function inlineTypedCSSPipe(): (file: {
    isNull: () => boolean;
    isStream: () => boolean;
    contents: Buffer;
}) => {
    isNull: () => boolean;
    isStream: () => boolean;
    contents: Buffer;
};
//# sourceMappingURL=inline-typed-css.d.ts.map