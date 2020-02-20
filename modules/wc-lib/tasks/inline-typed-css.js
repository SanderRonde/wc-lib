import * as through2 from 'through2';
import { AST } from './get-ast';
import { css } from '../lib/css';
import * as ts from 'typescript';
const visited = new WeakSet();
class CSS {
    constructor() {
        this.instance = css();
        this._lastInstance = this.instance;
        this._lastError = false;
    }
    _try(fn) {
        try {
            return fn();
        }
        catch (e) {
            this._lastError = true;
            return null;
        }
    }
    callFn(args) {
        // No function to call
        const basicArgs = args.map((arg) => {
            let stringLiteral = AST.resolveStringLiteral(arg);
            if (stringLiteral !== null) {
                return stringLiteral;
            }
            else {
                const expr = getCSSExpression(arg);
                if (expr) {
                    return decodeCSSExpression(expr, true);
                }
                // Skip this one
                return null;
            }
        });
        if (basicArgs.some((v) => v === null)) {
            return false;
        }
        this._try(() => {
            this.instance = this.instance.call(this._lastInstance, ...basicArgs);
        });
        if (this._lastError)
            return false;
        return true;
    }
    access(name) {
        this._try(() => {
            this._lastInstance = this.instance;
            this.instance = this.instance[name];
        });
        return !this._lastError;
    }
    toString() {
        const str = this._try(() => {
            return this.instance.toString();
        });
        // istanbul ignore next
        if (this._lastError) {
            return null;
        }
        return str;
    }
}
function getCSSExpression(expr) {
    if (ts.isCallExpression(expr)) {
        if (ts.isIdentifier(expr.expression) &&
            expr.expression.text === 'css') {
            return expr;
        }
    }
    else if (!ts.isPropertyAccessExpression(expr) &&
        !ts.isElementAccessExpression(expr)) {
        return null;
    }
    return getCSSExpression(expr.expression);
}
function decodeCSSExpression(node, noStr = false) {
    // istanbul ignore next
    if (visited.has(node))
        return null;
    visited.add(node);
    if (AST.isIgnored(node, 'typed-css-ignore'))
        return null;
    let activeNode = node;
    const css = new CSS();
    while ((ts.isCallExpression(activeNode.parent) ||
        ts.isPropertyAccessExpression(activeNode.parent) ||
        ts.isElementAccessExpression(activeNode.parent)) &&
        activeNode.parent.pos >= node.pos) {
        activeNode = activeNode.parent;
        if (ts.isCallExpression(activeNode)) {
            if (!css.callFn(activeNode.arguments)) {
                return null;
            }
        }
        else if (ts.isPropertyAccessExpression(activeNode)) {
            if (!css.access(activeNode.name.text)) {
                return null;
            }
        }
        else {
            const stringLiteral = AST.resolveStringLiteral(activeNode.argumentExpression);
            if (stringLiteral === null || typeof stringLiteral === 'number') {
                return null;
            }
            if (!css.access(stringLiteral)) {
                return null;
            }
        }
    }
    if (noStr)
        return css.instance;
    const str = (() => {
        try {
            return css.toString();
        }
        catch (e) {
            // istanbul ignore next
            return null;
        }
    })();
    // istanbul ignore next
    if (str === null)
        return null;
    return {
        str: str,
        lastNode: activeNode,
    };
}
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
export function inlineTypedCSS(text) {
    const ast = AST.getAST(text);
    // istanbul ignore next
    if (!ast) {
        // istanbul ignore next
        throw new Error('Failed to create AST');
    }
    const replacements = [];
    ast.forEachChild((child) => AST.find({
        node: child,
        replacements,
        isExpr(node) {
            return (ts.isCallExpression(node) &&
                ts.isIdentifier(node.expression) &&
                node.expression.escapedText === 'css');
        },
        decodeExpr(node) {
            return decodeCSSExpression(node);
        },
        findExpr(node) {
            return getCSSExpression(node);
        },
    }));
    return AST.applyReplacements(text, replacements);
}
/**
 * Inlines typed CSS in piped file
 *
 * For example css<{}>().id['some-id'].and['some-class']
 * is replaced with #some-id.some-class
 * This saves some processing on the user's
 * end when the file is served
 */
export function inlineTypedCSSPipe() {
    return through2.obj((file, _, cb) => {
        // The else case is tested by gulp
        /* istanbul ignore else */
        if (Buffer.isBuffer(file)) {
            file = Buffer.from(inlineTypedCSS(file.toString()));
        }
        else if (file.isBuffer()) {
            file.contents = Buffer.from(inlineTypedCSS(file.contents.toString()));
        }
        cb(null, file);
    });
}
//# sourceMappingURL=inline-typed-css.js.map