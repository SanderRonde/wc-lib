#!/usr/bin/env node

import { commandCreate } from './commands/create';
import { commandInlineTypedCSS } from './commands/inline-typed-css';

function displayMainHelp() {
    console.log('Usage: wc-lib command-name [options]');
    console.log('');
    console.log(
        'Main command can be any of the following (options lised below them):'
    );
    console.log('\tcreate - Creates a new component in the current folder');
    console.log(
        '\tinlined-typed-css - Inline typed CSS for given input files and output them somewhere'
    );
    process.exit(0);
}

export async function main() {
    const isHelp =
        process.argv.includes('--help') || process.argv.includes('-h');

    const mainCmd = process.argv[2];
    if (!mainCmd && !isHelp) {
        console.log('Please supply a main command');
        process.exit(1);
    }

    switch (mainCmd) {
        case 'create':
            await commandCreate();
            break;
        case 'inline-typed-css':
            await commandInlineTypedCSS();
            break;
        default:
            if (isHelp) {
                displayMainHelp();
                process.exit(0);
            } else {
                console.log('Unknown main command');
                process.exit(1);
            }
    }
}
