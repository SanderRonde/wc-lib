import { getAST } from "./get-ast";
import { css } from "../lib/css";
import * as ts from 'typescript';

const visited: WeakSet<ts.Node> = new WeakSet();

interface Replacement {
	start: number;
	end: number;
	str: string;
	node: ts.Node;
	inString: boolean;
}

function resolveStringLiteral(node: ts.Node): string|number|null {
	if (ts.isStringLiteral(node)) {
		return node.text;
	} else if (ts.isNumericLiteral(node)) {
		return ~~node.text;
	} else if (ts.isBinaryExpression(node) && 
		node.operatorToken.kind === ts.SyntaxKind.PlusToken) {
			const left = resolveStringLiteral(node.left);
			if (left === null) return null;
			const right = resolveStringLiteral(node.right);
			if (right === null) return null;

			return (left as any) + (right as any);
		}
	return null;
}


class CSS {
	instance: any = css<any>();
	private _lastInstance = this.instance;
	private _lastError: boolean = false;

	private _try<T>(fn: () => T): T|null {
		try {
			return fn();
		} catch(e) {
			this._lastError = true;
			return null;
		}
	}

	callFn(args: ts.NodeArray<ts.Expression>) {
		// No function to call
		const basicArgs = args.map((arg) => {
			let stringLiteral = resolveStringLiteral(arg);
			if (stringLiteral !== null) {
				return stringLiteral;
			} else {
				const expr = getCSSExpression(arg);
				if (expr) {
					return decodeCSSExpression(expr, true);
				}
				// Skip this one
				return null;
			}
		});
		if (basicArgs.some(v => v === null)) {
			return false;
		}

		this._try(() => {
			this.instance = this.instance.call(this._lastInstance, ...basicArgs);
		});
		if (this._lastError) return false;

		return true;
	}

	access(name: string) {
		this._try(() => {
			this._lastInstance = this.instance;
			this.instance = this.instance[name];
		});
		return !this._lastError;
	}

	toString() {
		const str = this._try(() => {
			return this.instance.toString() as string;
		});
		// istanbul ignore next
		if (this._lastError) {
			return null;
		}
		return str;
	}
}

function getCSSExpression(expr: ts.Expression): ts.CallExpression|null {
	if (ts.isCallExpression(expr)) {
		if (ts.isIdentifier(expr.expression) && expr.expression.text === 'css') {
			return expr;
		}
	} else if (!ts.isPropertyAccessExpression(expr) && !ts.isElementAccessExpression(expr)) {
		return null;
	}

	return getCSSExpression(expr.expression);
}

function getNodeComments(node: ts.Node) {
	const nodePos = node.pos;
	const parentPos = node.parent.pos;

	if (node.parent.kind === ts.SyntaxKind.SourceFile || nodePos !== parentPos) {
		let comments = ts.getLeadingCommentRanges(
			node.getSourceFile().getFullText(), nodePos);

		if (Array.isArray(comments)) {
			return comments;
		}
	}
	return undefined;
}

const usedComments: WeakSet<ts.CommentRange> = new WeakSet();
function collectComments(node: ts.Node, comments: ts.CommentRange[]): ts.CommentRange[] {
	if (ts.isFunctionLike(node)) return comments;
	if (ts.isClassLike(node)) return comments;
	if (ts.isSourceFile(node)) return comments;

	comments.push(...getNodeComments(node) || []);

	return collectComments(node.parent, comments);
}

function isIgnored(node: ts.Node) {
	// Find the root block
	const comments = collectComments(node, [])
		.filter((c, i, a) => a.indexOf(c) === i);

	for (const comment of comments) {
		// istanbul ignore next
		if (usedComments.has(comment)) continue;

		const { pos, end } = comment;
		const text = node.getSourceFile().text.substring(pos, end);
		if (text.includes('typed-css-ignore')) {
			usedComments.add(comment);
			return true;
		}
	}

	return false;
}

function decodeCSSExpression(node: ts.CallExpression|ts.PropertyAccessExpression|ts.ElementAccessExpression,
	noStr: true): { toString(): any }|null;
function decodeCSSExpression(node: ts.CallExpression|ts.PropertyAccessExpression|ts.ElementAccessExpression,
	noStr: false): { str: string; lastNode: ts.Node }|null;
function decodeCSSExpression(node: ts.CallExpression|ts.PropertyAccessExpression|ts.ElementAccessExpression): { str: string; lastNode: ts.Node }|null;
function decodeCSSExpression(node: ts.CallExpression|ts.PropertyAccessExpression|ts.ElementAccessExpression,
	noStr: boolean = false): { str: string; lastNode: ts.Node }|null|{toString(): any;} {
		// istanbul ignore next
		if (visited.has(node)) return null;
		visited.add(node);
		
		if (isIgnored(node)) return null;

		let activeNode: ts.CallExpression|ts.PropertyAccessExpression|ts.ElementAccessExpression = node;

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
				} else if (ts.isPropertyAccessExpression(activeNode)) {
					if (!css.access(activeNode.name.text)) {
						return null;
					}
				} else {
					const stringLiteral = 
						resolveStringLiteral(activeNode.argumentExpression);
					if (stringLiteral === null || 
						typeof stringLiteral === 'number') {
							return null;
						}

					if (!css.access(stringLiteral)) {
						return null;
					}
				}
			}

		if (noStr) return css.instance;
		const str = (() => {
			try {
				return css.toString();
			} catch(e) {
				// istanbul ignore next
				return null;
			}
		})();
		// istanbul ignore next
		if (str === null) return null;

		return {
			str: str,
			lastNode: activeNode
		}
	}

function handleCSSExpression(node: ts.CallExpression, replacements: Replacement[]) {
	const result = decodeCSSExpression(node);
	if (result === null) return;

	const { lastNode, str } = result;
	replacements.push({
		start: lastNode.pos,
		end: lastNode.end,
		node: lastNode,
		str,
		inString: false
	});
}

function handleTaggedTemplate(node: ts.TaggedTemplateExpression, replacements: Replacement[]) {
	// Iterate over all template spans and handle every part
	// istanbul ignore next
	if (!ts.isTemplateExpression(node.template)) return;
	for (const span of node.template.templateSpans) {
		// If the expression is just a css expression replace it entirely, if not
		// just replace the text
		const cssExpr = getCSSExpression(span.expression);

		if (cssExpr) {
			const result = decodeCSSExpression(cssExpr);
			if (!result) continue;

			const { lastNode, str } = result;
			// Start it at 2 chars before the real start of this expression
			// and end it at 1 after that to replace the template literal value
			replacements.push({
				start: lastNode.pos - 2,
				end: lastNode.end + 1,
				node: lastNode,
				str,
				inString: true
			});
		} else {
			// If it's not just one expression, keep searching for
			// css expression in its children
			span.forEachChild(child => iterateChildren(child, replacements));
		}
	}
}

function iterateChildren(node: ts.Node, replacements: Replacement[]) {
	if (ts.isCallExpression(node) && 
		ts.isIdentifier(node.expression) && 
		node.expression.escapedText === 'css') {
			handleCSSExpression(node, replacements);
			return;
		}
	
	if (ts.isTaggedTemplateExpression(node)) {
		handleTaggedTemplate(node, replacements);
		return;
	}

	node.forEachChild(child => iterateChildren(child, replacements));
}

function applyReplacements(text: string, replacements: Replacement[]): string {
	for (const { start, end, str, inString } of replacements.reverse()) {
		text = `${text.slice(0, start)}${inString ? str : `'${str}'`}${text.slice(end)}`;
	}
	return text;
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
export function inlineTypedCSS(text: string): string {
	const ast = getAST(text);

	// istanbul ignore next
	if (!ast) {
		// istanbul ignore next
		throw new Error('Failed to create AST');
	}

	const replacements: Replacement[] = [];
	ast.forEachChild(child => iterateChildren(child, replacements));

	return applyReplacements(text, replacements);
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
    return function(file: { 
		isNull: () => boolean; 
		isStream: () => boolean; 
		contents: Buffer; 
	}) {
		if (file.isNull()) {
			return file;
		}
		if (file.isStream()) {
			throw new Error('Streaming not supported');
		}

		file.contents = Buffer.from(
			inlineTypedCSS(file.contents.toString()))

		return file;
 	 };
};