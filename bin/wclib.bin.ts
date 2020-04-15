#!/usr/bin/env node

import { create } from './commands/create';

function parseArgs() {
    const options: {
        [key: string]: string | boolean;
    } = {};
    const keywords: string[] = [];
    const args = process.argv.slice(2);
    for (let i = 0; i < args.length; i++) {
        if (args[i].startsWith('--')) {
            if (args[i].includes('=')) {
                const [key, val] = args[i].split('=');
                options[key.slice(2)] = val;
            } else {
                const argName = args[i].slice(2);
                if (argName === 'help') {
                    options[argName] = true;
                } else {
                    options[argName] = args[i + 1];
                    i++;
                }
            }
        } else if (args[i].startsWith('-')) {
            options[args[i].slice(1)] = true;
        } else {
            keywords.push(args[i]);
        }
    }
    return { options, keywords };
}

export async function main() {
    const {
        options,
        keywords: [mainCmd],
    } = parseArgs();
    if (options.h || options.help) {
        console.log('Usage: wc-lib command-name [options]');
        console.log('\n');
        console.log(
            'Main command can be any of the following (options lised below them):'
        );
        console.log('\tcreate - Creates a new component in the current folder');
        console.log('\t\t--name\t\tThe name of the new component');
        console.log('\t\t-q\t\tAdd code for a local querymap');
        console.log(
            '\t\t--wc-lib-path\tThe path to the wc-lib installation (relative to the new folder)'
        );
        console.log(
            '\t\t--lit-html-path\tThe path to the lit-html installation (relative to the new folder)'
        );
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
