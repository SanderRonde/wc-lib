import { AST } from "./get-ast.js";
import * as ts from 'typescript';
function isI18NExpression(node) {
    if (!ts.isCallExpression(node))
        return false;
    if (ts.isPropertyAccessExpression(node.expression)) {
        if (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
            ts.isIdentifier(node.expression.name) &&
            node.expression.name.text === '__') {
            return true;
        }
    }
    if (ts.isElementAccessExpression(node.expression)) {
        if (node.expression.expression.kind === ts.SyntaxKind.ThisKeyword &&
            ts.isStringLiteral(node.expression.argumentExpression) &&
            node.expression.argumentExpression.text === '__') {
            return true;
        }
    }
    return false;
}
function decodeI18NExpression(node, getMessage, langFile, lang) {
    if (AST.isIgnored(node, 'inline-i18n-ignore'))
        return null;
    const args = node.arguments.map((arg) => {
        const stringLiteral = AST.resolveStringLiteral(arg);
        if (stringLiteral !== null)
            return stringLiteral;
        if (isI18NExpression(arg)) {
            const decoded = decodeI18NExpression(arg, getMessage, langFile, lang);
            if (decoded) {
                return decoded.str;
            }
        }
        return null;
    });
    if (args.some(a => a === null))
        return null;
    const [firstArg, ...values] = args;
    if (typeof firstArg === 'number')
        return null;
    try {
        return {
            lastNode: node,
            str: getMessage(langFile[lang], firstArg, values)
        };
    }
    catch (e) {
        return null;
    }
}
function mapToObj(map) {
    const obj = {};
    for (const [key, val] of map.entries()) {
        obj[key] = val;
    }
    return obj;
}
export function inlineI18N(text, getMessage, langFile, lang) {
    const ast = AST.getAST(text);
    // istanbul ignore next
    if (!ast) {
        // istanbul ignore next
        throw new Error('Failed to create AST');
    }
    const results = new Map((lang ? [lang] : Object.getOwnPropertyNames(langFile)).map((lang) => {
        const replacements = [];
        ast.forEachChild(child => AST.find({
            node: child,
            replacements,
            isExpr(node) {
                return isI18NExpression(node);
            },
            decodeExpr(node) {
                return decodeI18NExpression(node, getMessage, langFile, lang);
            },
            findExpr(node) {
                if (isI18NExpression(node))
                    return node;
                return null;
            }
        }));
        return [
            lang, AST.applyReplacements(text, replacements)
        ];
    }));
    if (lang) {
        return results.get(lang);
    }
    return mapToObj(results);
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
export function inlineI18NPipe(getMessage, langFile, lang) {
    return function (file) {
        if (file.isNull()) {
            return file;
        }
        if (file.isStream()) {
            throw new Error('Streaming not supported');
        }
        file.contents = Buffer.from(inlineI18N(file.contents.toString(), getMessage, langFile, lang));
        return file;
    };
}
//# sourceMappingURL=inline-i18n.js.map