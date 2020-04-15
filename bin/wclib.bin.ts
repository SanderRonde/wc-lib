#!/usr/bin/env node

import { create } from './commands/create';

export async function main() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log('Usage: wc-lib command-name [options]');
        console.log('\n');
        console.log(
            'Main command can be any of the following (options lised below them):'
        );
        console.log('\tcreate - Creates a new component in the current folder');
        process.exit(0);
    }

    const mainCmd = process.argv[2];
    if (!mainCmd) {
        console.log('Please supply a main command');
        process.exit(1);
    }

    switch (mainCmd) {
        case 'create':
            await create();
            break;
        default:
            console.log('Unknown main command');
            process.exit(1);
    }
}
