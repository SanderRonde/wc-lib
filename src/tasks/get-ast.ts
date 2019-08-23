import * as ts from 'typescript';

export namespace AST {
	export interface Config {
		node: ts.Node; 
		replacements: Replacement[]; 
		isExpr(node: ts.Node): boolean;
		findExpr(node: ts.Expression): ts.Node|null;
		decodeExpr(node: ts.Node): {
			str: string;
			lastNode: ts.Node;
		}|null;
	}

	export interface Replacement {
		start: number;
		end: number;
		str: string;
		node: ts.Node;
		inString: boolean;
	}

	export function resolveStringLiteral(node: ts.Node): string|number|null {
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

	export function isIgnored(node: ts.Node, ignoreString: string) {
		// Find the root block
		const comments = collectComments(node, [])
			.filter((c, i, a) => a.indexOf(c) === i);

		for (const comment of comments) {
			// istanbul ignore next
			if (usedComments.has(comment)) continue;

			const { pos, end } = comment;
			const text = node.getSourceFile().text.substring(pos, end);
			if (text.includes(ignoreString)) {
				usedComments.add(comment);
				return true;
			}
		}

		return false;
	}

	function handleExpr({ node, decodeExpr, replacements }: Config) {
		const result = decodeExpr(node);
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

	interface TaggedTemplateConfig extends Config {
		node: ts.TaggedTemplateExpression;
	}
	function handleTaggedTemplate(config: TaggedTemplateConfig) {
		const { node, findExpr, decodeExpr, replacements } = config;

		// Iterate over all template spans and handle every part
		// istanbul ignore next
		if (!ts.isTemplateExpression(node.template)) return;
		for (const span of node.template.templateSpans) {
			// If the expression is just an expression replace it entirely, if not
			// just replace the text
			const expr = findExpr(span.expression);
	
			if (expr) {
				const result = decodeExpr(expr);
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
				span.forEachChild(child => find({
					...config,
					node: child
				}));
			}
		}
	}

	export function find(config: Config) {
		const { node, isExpr } = config;

		if (isExpr(node)) {
			handleExpr(config);
			return;
		}
		
		if (ts.isTaggedTemplateExpression(node)) {
			handleTaggedTemplate({
				...config,
				node
			});
			return;
		}

		node.forEachChild(child => find({
			...config,
			node: child
		}));
	}

	export function applyReplacements(text: string, replacements: Replacement[]): string {
		for (const { start, end, str, inString } of replacements.reverse()) {
			text = `${text.slice(0, start)}${inString ? str : `'${str}'`}${text.slice(end)}`;
		}
		return text;
	}

	export function getAST(code: string) {
		const host: ts.CompilerHost = {
			// istanbul ignore next
			fileExists() { return true },
			getCanonicalFileName(fileName) { return fileName },
			getCurrentDirectory() { return ''; },
			getDefaultLibFileName() { return 'lib.d.ts' },
			// istanbul ignore next
			getNewLine() { return '\n' },
			getSourceFile(fileName) {
				return ts.createSourceFile(fileName, code, ts.ScriptTarget.Latest, true);
			},
			// istanbul ignore next
			readFile() { return undefined; },
			useCaseSensitiveFileNames() { return true },
			// istanbul ignore next
			writeFile() { return undefined }
		}

		const fileName = 'sourcefile.ts';
		const program = ts.createProgram([fileName], {
			noResolve: true,
			target: ts.ScriptTarget.Latest,
			experimentalDecorators: true,
			jsxFactory: 'html.jsx',
			jsx: ts.JsxEmit.React
		}, host);

		return program.getSourceFile(fileName);
	}
}