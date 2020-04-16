import { mkdir, writeFile, getIO, IO_FORMAT } from './util';
import * as path from 'path';

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
        querymap
            ? `import { IDMap, ClassMap } from './${name}-querymap';\n`
            : ''
    }import { ${capitalize(
        dashesToUppercase(name)
    )}HTML } from './${name}.html.js';
import { ${capitalize(dashesToUppercase(name))}CSS } from './${name}.css.js';

@config({
	is: '${name}',
	css: ${capitalize(dashesToUppercase(name))}CSS,
	html: ${capitalize(dashesToUppercase(name))}HTML
})
export class ${capitalize(
        dashesToUppercase(name)
    )} extends ConfigurableWebComponent${
        querymap
            ? `<{
	selectors: {
		IDS: IDMap;
		CLASSES: ClassMap;
	}
}>`
            : ''
    } {
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

export const ${capitalize(
        dashesToUppercase(name)
    )}HTML = new TemplateFn<${capitalize(
        dashesToUppercase(name)
    )}>(function (html, props) {
	return html\`
		<div></div>
	\`
}, CHANGE_TYPE.PROP, render);
`;

const cssTemplate = (name: string, wclib: string, lithtml: string) =>
    `import { TemplateFn, CHANGE_TYPE } from '${wclib}';
import { ${capitalize(dashesToUppercase(name))} } from './${name}.js';
import { render } from '${lithtml}';

export const ${capitalize(
        dashesToUppercase(name)
    )}CSS = new TemplateFn<${capitalize(
        dashesToUppercase(name)
    )}>(function (html) {
	return html\`<style>
		
	</style>\`
}, CHANGE_TYPE.THEME, render);
`;

function green(text: string) {
    return `\u001b[32m${text}\u001b[39m`;
}

function checkmark() {
    if (
        process.platform !== 'win32' ||
        process.env.CI ||
        process.env.TERM === 'xterm-256color'
    ) {
        return 'âœ”';
    } else {
        return 'âˆš';
    }
}

function validateName(name: string | boolean): name is string {
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
        console.log(
            'Webcomponent names can not contain uppercase ASCII characters.'
        );
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

export async function commandCreate() {
    const io = getIO('create', {
        help: {
            type: IO_FORMAT.BOOLEAN,
            description: 'Show this help command',
            alternatives: ['-h'],
        },
        name: {
            type: IO_FORMAT.STRING,
            description: 'The name of the new component',
            alternatives: ['-n'],
            required: true,
        },
        querymap: {
            type: IO_FORMAT.BOOLEAN,
            description: 'Add code for a local querymap',
            alternatives: ['-q'],
        },
        'wc-lib-path': {
            type: IO_FORMAT.STRING,
            description:
                'The path to the wc-lib installation (relative to the new folder)',
            alternatives: ['--wclib-path'],
        },
        'lit-html-path': {
            type: IO_FORMAT.STRING,
            description:
                'The path to the lit-html installation (relative to the new folder)',
            alternatives: ['--lithtml-path'],
        },
    });

    const name = io.name;
    if (!validateName(name)) return;

    await mkdir(path.join(process.cwd(), name));
    console.log(green(`${name}\\`), green(checkmark()));

    const wclib = (() => {
        const wclibArg = io['wc-lib-path'];
        return wclibArg ? `../${wclibArg}` : 'wc-lib';
    })();
    const litHTML = (() => {
        const litHTMLArg = io['lit-html-path'];
        return litHTMLArg ? `../${litHTMLArg}` : 'lit-html';
    })();

    await writeFile(
        path.join(process.cwd(), name, `${name}.ts`),
        indexTemplate(name, wclib, io.querymap)
    );
    console.log(green(`\t${name}.ts`), green(checkmark()));

    await writeFile(
        path.join(process.cwd(), name, `${name}.html.ts`),
        htmlTemplate(name, wclib, litHTML)
    );
    console.log(green(`\t${name}.html.ts`), green(checkmark()));

    await writeFile(
        path.join(process.cwd(), name, `${name}.css.ts`),
        cssTemplate(name, wclib, litHTML)
    );
    console.log(green(`\t${name}.css.ts`), green(checkmark()));
}
