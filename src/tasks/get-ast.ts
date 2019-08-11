import * as ts from 'typescript';

export function  getAST(code: string) {
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