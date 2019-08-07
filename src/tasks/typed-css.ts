import { css } from "../lib/css";

const ignoreReg = /\/\/(\s*)typed-css-ignore/;

function findParts(text: string) {
	const lines = text.split('\n');
	const ignoreLines = lines
		.map((line, index) => ignoreReg.exec(line) ? (index + 1) : null)
		.filter(index => index !== null);
	
	let parts: string[] = [];
	const state: {
		lastChar: string;
		opened: boolean;
		comment: 'none'|'line'|'multiline';
		brackets: number;
		openedText: string;
	} = {
		lastChar: '',
		opened: false,
		comment: 'none',
		brackets: 0,
		openedText: ''
	};
	for (let lineNum = 0; lineNum <  lines.length; lineNum++) {
		const line = lines[lineNum];
		if (state.comment === 'line') {
			state.comment = 'none';
		}
		if (ignoreLines.indexOf(lineNum) > -1) continue;
		state.openedText += '\n';
		for (const char of line) {
			if (state.comment !== 'none') {
				if (state.comment === 'multiline') {
					if (char === '/' && state.lastChar === '*') {
						state.comment = 'none';
					}
				}
			} else {
				if (!state.opened && char === '{' && state.lastChar === '$') {
					state.opened = true;
					state.brackets = 1;
					state.openedText = '$';
				// istanbul ignore next
				} else if (state.opened && char === '{' && state.lastChar !== '\\') {
					state.brackets++;
				} else if (state.opened && char === '}' && state.lastChar !== '\\') {
					state.brackets--;
					// istanbul ignore next
					if (state.brackets === 0) {
						state.opened = false;
						parts.push(state.openedText + '}');
					}
				} else if (char === '/' && state.lastChar === '/') {
					state.comment = 'line';
					continue;
				} else if (char === '*' && state.lastChar === '/') {
					state.comment = 'multiline';
				}
			}

			if (state.opened) {
				state.openedText += char;
			}
			state.lastChar = char;
		}
	}
	return parts;
}

function evalExpr(expr: string) {
	const fn = new Function('css', `return ${expr}`);
	return fn(css);
}

/**
 * Inlines typed CSS in passed string
 * 
 * For example css<{}>().id['some-id'].and['some-class']
 * is replaced with #some-id.some-class 
 * This saves some processing on the user's
 * end when the file is served
 */
export function inlineTypedCSS(text: string): string {
	console.log(text);
	const parts = findParts(text);
	for (const part of parts) {		
		// Slice the expression
		let partExpr = part.slice(2, part.length - 1);

		// Ignore the class value
		partExpr = partExpr.replace(/css\(.*?\)\./, 'css().');

		text = text.replace(part, evalExpr(partExpr));
		console.log(partExpr, evalExpr(partExpr), text);
	}
	console.log('');
	return text;
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