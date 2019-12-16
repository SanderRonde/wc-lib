#!/usr/bin/env node

import * as path from 'path';
import * as fs from 'fs';

function mkdir(dirPath: string) {
	return new Promise((resolve) => {
		fs.exists(dirPath, (exists) => {
			if (exists) {
				resolve();
				return;
			}
			fs.mkdir(dirPath, (err) => {
				if (err) {
					console.log(`Failed to make dir "${dirPath}"`);
					process.exit(1);
				}
				resolve();
			});
		});
	})
}

function writeFile(filePath: string, data: string) {
	return new Promise((resolve) => {
		fs.writeFile(filePath, data, {
			encoding: 'utf8'
		}, (err) => {
			if (err) {
				console.log(`Failed to create file "${filePath}"`);
				process.exit(1);
			}
			resolve();
		});
	});
}

function dashesToUppercase(name: string) {
	let newName = '';
	for (let i = 0; i < name.length; i++) {
		if (name[i] === '-') {
			newName += name[i + 1].toUpperCase();
			i++;
		} else {
			newName += name[i];
		}
	}
	return newName;
}

function capitalize(name: string) {
	return name[0].toUpperCase() + name.slice(1);
}

const indexTemplate = (name: string, wclib: string, querymap: boolean) => 
`import { ConfigurableWebComponent, Props, PROP_TYPE, config } from '${wclib}';\n${
	querymap ? `import { IDMap, ClassMap } from './${name}-querymap';\n` : ''
}
import { ${capitalize(dashesToUppercase(name))}HTML } from './${name}.html.js';
import { ${capitalize(dashesToUppercase(name))}CSS } from './${name}.css.js';

@config({
	is: '${name}',
	css: ${capitalize(dashesToUppercase(name))}CSS,
	html: ${capitalize(dashesToUppercase(name))}HTML
})
export class ${capitalize(dashesToUppercase(name))} extends ConfigurableWebComponent${querymap ? `<{
	IDS: IDMap;
	CLASSES: ClassMap;
}>` : ''} {
	props = Props.define(this, {
		// ...
	});

	mounted() {
		// ...
	}

	firstRender() {
		// ...
	}
}`;

const htmlTemplate = (name: string, wclib: string, lithtml: string) => 
`import { TemplateFn, CHANGE_TYPE } from '${wclib}';
import { ${capitalize(dashesToUppercase(name))} } from './${name}.js';
import { render } from '${lithtml}';

export const ${capitalize(dashesToUppercase(name))}HTML = new TemplateFn<${
	capitalize(dashesToUppercase(name))
}>(function (html, props) {
	return html\`
		<div></div>
	\`
}, CHANGE_TYPE.PROP, render);
`;

const cssTemplate = (name: string, wclib: string, lithtml: string) => 
`import { TemplateFn, CHANGE_TYPE } from '${wclib}';
import { ${capitalize(dashesToUppercase(name))} } from './${name}.js';
import { render } from '${lithtml}';

export const ${capitalize(dashesToUppercase(name))}CSS = new TemplateFn<${
	capitalize(dashesToUppercase(name))
}>(function (html) {
	return html\`<style>
		
	</style>\`
}, CHANGE_TYPE.THEME, render);
`;

function parseArgs() {
	const options: {
		[key: string]: string|boolean;
	} = {};
	const keywords: string[] = [];
	const args = process.argv.slice(2);
	for (let i = 0; i < args.length; i++) {
		if (args[i].startsWith('--')) {
			if (args[i].includes('=')) {
				const [ key, val ] = args[i].split('=');
				options[key.slice(2)] = val;
			} else {
				options[args[i].slice(2)] = args[i + 1];
				i++;
			}
		} else if (args[i].startsWith('-')) {
			options[args[i].slice(1)] = true;
		} else {
			keywords.push(args[i]);
		}
	}
	return { options, keywords };
}

function green(text: string) {
	return `\u001b[32m${text}\u001b[39m`;
}

function checkmark() {
	if (process.platform !== 'win32' || process.env.CI || process.env.TERM === 'xterm-256color') {
		return '✔';
	} else {
		return '√';
	}
}

function validateName(name: string|boolean): name is string {
	if (!name || typeof name !== 'string') {
		console.log('Missing name, supply it with --name {name}');
		process.exit(1);
		return false;
	}
	const nameStr = name as string;
	if (nameStr.indexOf('-') === -1) {
		console.log('Webcomponent names need to contain a dash "-"');
		process.exit(1);
		return false;
	}
	if (/[A-Z]/.test(nameStr)) {
		console.log('Webcomponent names can not contain uppercase ASCII characters.');
		process.exit(1);
		return false;
	}
	if (/^\d/i.test(nameStr)) {
		console.log('Webcomponent names can not start with a digit.');
		process.exit(1);
		return false;
	}
	if (/^-/i.test(nameStr)) {
		console.log('Webcomponent names can not start with a hyphen.');
		process.exit(1);
		return false;
	}
	return true;
}

async function create(options: {
	[key: string]: string|boolean;
}) {
	const name = options['name'];
	if (!validateName(name)) return;

	await mkdir(path.join(process.cwd(), name));
	console.log(green(`${name}\\`), green(checkmark()));

	const wclib = (() => {
		const wclibArg = options['wc-lib-path'];
		if (typeof wclibArg === 'boolean') {
			console.log('Please pass a path after the wc-lib param');
			process.exit(1);
			return 'wc-lib';
		}
		return `../${wclibArg}` || 'wc-lib';
	})();
	const litHTML = (() => {
		const litHTMLArg = options['lit-html-path'];
		if (typeof litHTMLArg === 'boolean') {
			console.log('Please pass a path after the wc-lib param');
			process.exit(1);
			return 'lit-html';
		}
		return `../${litHTMLArg}` || 'lit-html';
	})();

	await writeFile(path.join(process.cwd(), name, `${name}.ts`),
		indexTemplate(name, wclib, !!options['q']));
	console.log(green(`\t${name}.ts`), green(checkmark()));

	await writeFile(path.join(process.cwd(), name, `${name}.html.ts`),
		htmlTemplate(name, wclib, litHTML));
	console.log(green(`\t${name}.html.ts`), green(checkmark()));

	await writeFile(path.join(process.cwd(), name, `${name}.css.ts`),
		cssTemplate(name, wclib, litHTML));
	console.log(green(`\t${name}.css.ts`), green(checkmark()));
}

export async function main() {
	const { options, keywords: [ mainCmd ] } = parseArgs();
	if (options.h || options.help) {
		console.log('Usage: wc-lib command-name [options]');
		console.log('\n');
		console.log('Main command can be any of the following (options lised below them):');
		console.log('\tcreate - Creates a new component in the current folder');
		console.log('\t\t--name\t\tThe name of the new component');
		console.log('\t\t-q\t\tAdd code for a local querymap');
		console.log('\t\t--wc-lib-path\tThe path to the wc-lib installation (relative to cwd)');
		console.log('\t\t--lit-html-path\tThe path to the lit-html installation (relative to cwd)');
		process.exit(0);
	}

	if (!mainCmd) {
		console.log('Please supply a main command');
		process.exit(1);
	}

	switch (mainCmd) {
		case 'create':
			await create(options);
			break;
		default:
			console.log('Unknown main command');
			process.exit(1);
	}
}