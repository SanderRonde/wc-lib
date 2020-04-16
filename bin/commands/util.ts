import * as path from 'path';
import * as fs from 'fs';

export function mkdirp(dirPath: string) {
    dirPath.split(path.sep).reduce((prevPath, folder) => {
        const currentPath = path.join(prevPath, folder, path.sep);
        if (!fs.existsSync(currentPath)) {
            fs.mkdirSync(currentPath);
        }
        return currentPath;
    }, '');
}

export function mkdir(dirPath: string) {
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
    });
}

export function writeFile(filePath: string, data: string) {
    return new Promise((resolve) => {
        fs.writeFile(
            filePath,
            data,
            {
                encoding: 'utf8',
            },
            (err) => {
                if (err) {
                    console.log(`Failed to create file "${filePath}"`);
                    process.exit(1);
                }
                resolve();
            }
        );
    });
}

export function readFile(filePath: string) {
    return new Promise<string>((resolve) => {
        fs.readFile(
            filePath,
            {
                encoding: 'utf8',
            },
            (err, data) => {
                if (err) {
                    console.log(`Failed to read file "${filePath}"`);
                    process.exit(1);
                }
                resolve(data);
            }
        );
    });
}

export const enum IO_FORMAT {
    BOOLEAN,
    NUMBER,
    STRING,
}

namespace IO {
    function hasArg(name: string, ...alternatives: string[]): boolean {
        for (const arg of [`--${name}`, ...alternatives]) {
            if (process.argv.includes(arg)) return true;
        }
        return false;
    }

    function getArg(name: string, ...alternatives: string[]): string | void {
        for (let i = process.argv.length - 1; i; i--) {
            const arg = process.argv[i];
            for (const keyword of [`--${name}`, ...alternatives]) {
                if (arg === keyword) {
                    return process.argv[i + 1];
                } else if (arg.startsWith(`${keyword}=`)) {
                    return arg.slice(keyword.length + 1);
                }
            }
        }
        return void 0;
    }

    function getNumArg(name: string, ...alternatives: string[]): number | void {
        const arg = getArg(name, ...alternatives);
        if (arg === void 0) return void 0;
        return ~~arg;
    }

    function objFromEntries(
        entries: [string, string | number | boolean | void][]
    ): {
        [key: string]: string | number | boolean | void;
    } {
        const obj: {
            [key: string]: string | number | boolean | void;
        } = {};
        for (const [key, value] of entries) {
            obj[key] = value;
        }
        return obj;
    }

    export interface ArgConfig {
        type: IO_FORMAT;
        description: string;
        required?: boolean;
        alternatives?: string[];
    }

    export function printHelp<
        F extends {
            [key: string]: ArgConfig;
        }
    >(command: string, format: F): never {
        console.log(`Usage of command "${command}"`);
        console.log('');
        for (const key in format) {
            const { alternatives = [], description, required } = format[key];
            console.log(
                `\t--${[key, ...alternatives].join(', ')} ${
                    !required ? '(optional)' : ''
                } - ${description}`
            );
        }
        process.exit(0);
    }

    export function getIO<
        F extends {
            [key: string]: ArgConfig;
        }
    >(
        command: string,
        format: F
    ): {
        [key in keyof F]: GetIO<F[key]>;
    } {
        if (hasArg('help', '-h')) {
            printHelp(command, format);
        }
        return objFromEntries(
            Object.keys(format).map((key) => {
                const { type, required, alternatives = [] } = format[key];

                if (required && !hasArg(key, ...alternatives)) {
                    console.error(`Argument "${key}" is required`);
                }
                switch (type) {
                    case IO_FORMAT.BOOLEAN:
                        return [key, hasArg(key, ...alternatives)];
                    case IO_FORMAT.NUMBER:
                        return [key, getNumArg(key, ...alternatives)];
                    case IO_FORMAT.STRING:
                        return [key, getArg(key, ...alternatives)];
                }
            })
        ) as {
            [key in keyof F]: GetIO<F[key]>;
        };
    }
}

type GetIO<F extends IO.ArgConfig> = F['type'] extends IO_FORMAT.BOOLEAN
    ? boolean
    : F['type'] extends IO_FORMAT.STRING
    ? F['required'] extends boolean
        ? string
        : string | void
    : F['type'] extends IO_FORMAT.NUMBER
    ? F['required'] extends boolean
        ? number
        : number | void
    : void;

export function getIO<
    F extends {
        [key: string]: IO.ArgConfig;
    }
>(
    command: string,
    format: F
): {
    [key in keyof F]: GetIO<F[key]>;
} {
    return IO.getIO(command, format);
}
