import { inlineTypedCSS } from '../../build/cjs/tasks/inline-typed-css';
import { getIO, IO_FORMAT, readFile, writeFile, mkdirp } from './util';
import * as glob from 'glob';
import * as path from 'path';

function globProm(pattern: string, options?: any): Promise<string[]> {
    return new Promise((resolve, reject) => [
        glob(pattern, options || {}, (err: any | void, matches: string[]) => {
            if (err) {
                reject(err);
            } else {
                resolve(matches);
            }
        }),
    ]);
}

export async function commandInlineTypedCSS() {
    const io = getIO('create', {
        help: {
            type: IO_FORMAT.BOOLEAN,
            description: 'Show this help command',
            alternatives: ['-h'],
        },
        input: {
            type: IO_FORMAT.STRING,
            description: 'Glob of the input file(s)',
            alternatives: ['-i'],
            required: true,
        },
        output: {
            type: IO_FORMAT.STRING,
            description: 'The output directory',
            alternatives: ['-o'],
            required: true,
        },
        filename: {
            type: IO_FORMAT.STRING,
            description:
                "The name of the output file. (defaults to the individual input files' names)",
            alternatives: ['-f'],
        },
    });

    const files = await globProm(io.input);
    if (files.length === 0) {
        console.log('No files found');
        process.exit(0);
    }

    mkdirp(io.output);
    await Promise.all(
        files.map(async (filePath) => {
            const content = await readFile(filePath);
            const result = inlineTypedCSS(content);
            const outPath = path.join(
                io.output,
                io.filename || path.basename(filePath)
            );
            await writeFile(outPath, result);
            console.log(`Wrote file "${outPath}`);
        })
    );
}
