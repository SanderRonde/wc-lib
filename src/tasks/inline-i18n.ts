import * as through2 from 'through2';
import { AST } from './get-ast.js';
import * as ts from 'typescript';

function isI18NExpression(node: ts.Node): node is ts.CallExpression {
    if (!ts.isCallExpression(node)) return false;
    if (ts.isPropertyAccessExpression(node.expression)) {
        if (
            node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
            ts.isIdentifier(node.expression.name) &&
            node.expression.name.text === '__'
        ) {
            return true;
        }
    }
    if (ts.isElementAccessExpression(node.expression)) {
        if (
            node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
            ts.isStringLiteral(node.expression.argumentExpression) &&
            node.expression.argumentExpression.text === '__'
        ) {
            return true;
        }
    }
    return false;
}

function decodeI18NExpression<LF>(
    node: ts.CallExpression,
    getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string,
    langFile: LF,
    lang: keyof LF
): {
    lastNode: ts.Node;
    str: string;
} | null {
    if (AST.isIgnored(node, 'inline-i18n-ignore')) return null;

    const args = node.arguments.map((arg) => {
        const stringLiteral = AST.resolveStringLiteral(arg);
        if (stringLiteral !== null) return stringLiteral;

        if (isI18NExpression(arg)) {
            const decoded = decodeI18NExpression(
                arg,
                getMessage,
                langFile,
                lang
            );
            if (decoded) {
                return decoded.str;
            }
        }
        return null;
    });
    if (args.some((a) => a === null)) return null;
    const [firstArg, ...values] = args as (string | number)[];
    if (typeof firstArg === 'number') return null;

    try {
        return {
            lastNode: node,
            str: getMessage(langFile[lang], firstArg, values),
        };
    } catch (e) {
        return null;
    }
}

function mapToObj<V>(
    map: Map<string, V>
): {
    [key: string]: V;
} {
    const obj: {
        [key: string]: V;
    } = {};
    for (const [key, val] of map.entries()) {
        obj[key] = val;
    }
    return obj;
}

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
export function inlineI18N<LF extends { [key: string]: any }>(
    text: string,
    getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string,
    langFile: LF
): { [key: string]: string };
export function inlineI18N<LF extends { [key: string]: any }>(
    text: string,
    getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string,
    langFile: LF,
    lang: keyof LF
): string;
export function inlineI18N<LF extends { [key: string]: any }>(
    text: string,
    getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string,
    langFile: LF,
    lang?: keyof LF
): string | { [key: string]: string } {
    const ast = AST.getAST(text);

    // istanbul ignore next
    if (!ast) {
        // istanbul ignore next
        throw new Error('Failed to create AST');
    }

    const results = new Map(
        (lang ? [lang] : Object.getOwnPropertyNames(langFile)).map((lang) => {
            const replacements: AST.Replacement[] = [];
            ast.forEachChild((child) =>
                AST.find({
                    node: child,
                    replacements,
                    isExpr(node) {
                        return isI18NExpression(node);
                    },
                    decodeExpr(node) {
                        return decodeI18NExpression(
                            node as any,
                            getMessage,
                            langFile,
                            lang
                        );
                    },
                    findExpr(node) {
                        if (isI18NExpression(node)) return node;
                        return null;
                    },
                })
            );
            return [lang, AST.applyReplacements(text, replacements)];
        })
    );

    if (lang) {
        return results.get(lang)!;
    }
    return mapToObj(results as any) as {
        [key: string]: string;
    };
}

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
export function inlineI18NPipe<LF extends { [key: string]: any }>(
    getMessage: (langFile: LF[keyof LF], key: string, values: any[]) => string,
    langFile: LF,
    lang: keyof LF
) {
    return through2.obj(
        (
            file:
                | {
                      isNull: () => boolean;
                      isStream: () => boolean;
                      isBuffer: () => boolean;
                      contents: Buffer;
                  }
                | Buffer,
            _,
            cb
        ) => {
            // The else case is tested by gulp
            /* istanbul ignore else */
            if (Buffer.isBuffer(file)) {
                file = Buffer.from(
                    inlineI18N(file.toString(), getMessage, langFile, lang)
                );
            } else if (file.isBuffer()) {
                file.contents = Buffer.from(
                    inlineI18N(
                        file.contents.toString(),
                        getMessage,
                        langFile,
                        lang
                    )
                );
            }

            cb(null, file);
        }
    );
}
