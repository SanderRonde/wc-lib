/// <reference types="node" />
/**
 * Inlines I18N calls in passed string. Walks every
 * expression to change every instance of
 * `this.__(..., ...)`. (See below for exceptions). Ignores
 * lines with `// inline-i18n-ignore` in the line above them.
 * If `lang` is passed, inlines for that specific language.
 * If not passed, will return an object with the keys
 * being the languages in `langFile` and the values the
 * text replaced with that language. Ignores
 * lines with `// inline-i18n-ignore` in the line above them.
 *
 * For example `this.__('name')` will be replaced
 * with whatever `getMessage('name')` returns.
 * This saves some processing on the user's
 * end when the file is served in addition to
 * allow bundling of languages.
 *
 * Replaces all calls but ignores those
 * that have complex non-string and non-number parameters.
 * For example `this.__(this.x())` will be ignored
 * will not be replaced.
 *
 * @template LF - The language file
 *
 * @param {string} text - The text in which to replace the calls
 * @param {(langFile: LF[keyof LF], key: string, values: any[]) => string)} getMessage -
 * 	A function that is called to get the message with given key
 * @param {LF} langFile - The language file itself
 * @param {keyof LF} [lang] - The language for which to inline the
 * 	calls. If omitted, inlines all languages instead and returns
 * 	an object with the keys being the languages and the values
 * 	the language-replaced texts.
 *
 * @returns {string|{[key: string]: string}} - The text with I18N inlined if lang is passed
 * 	and if it wasn't, an object with the keys being the languages
 * 	and the values the language-replaced texts
 */
export declare function inlineI18N<LF extends {
    [key: string]: any;
}>(text: string, getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string, langFile: LF): {
    [key: string]: string;
};
export declare function inlineI18N<LF extends {
    [key: string]: any;
}>(text: string, getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string, langFile: LF, lang: keyof LF): string;
/**
 * Inlines I18N in piped file
 *
 * For example `this.__('name')` will be replaced
 * with whatever `getMessage('name')` returns.
 * This saves some processing on the user's
 * end when the file is served in addition to
 * allow bundling of languages. Ignores
 * lines with `// inline-i18n-ignore` in the line above them.
 * If `lang` is passed, inlines for that specific language.
 * If not passed, will return an object with the keys
 * being the languages in `langFile` and the values the
 * text replaced with that language.
 *
 * @template LF - The language file
 *
 * @param {(langFile: LF[keyof LF], key: string, values: any[]) => string)} getMessage -
 * 	A function that is called to get the message with given key
 * @param {LF} langFile - The language file itself
 * @param {keyof LF} lang - The language for which to inline the
 * 	calls.
 */
export declare function inlineI18NPipe<LF extends {
    [key: string]: any;
}>(getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string, langFile: LF, lang: keyof LF): (file: {
    isNull: () => boolean;
    isStream: () => boolean;
    contents: Buffer;
}) => {
    isNull: () => boolean;
    isStream: () => boolean;
    contents: Buffer;
};
//# sourceMappingURL=inline-i18n.d.ts.map