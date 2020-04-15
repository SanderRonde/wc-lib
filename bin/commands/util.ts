import * as fs from 'fs';

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

export const enum IO_FORMAT {
    BOOLEAN,
    NUMBER,
    STRING,
}

namespace IO {
    /**
     * Check if an argument with given name is present
     *
     * @param {string} name - The name of the argument
     * @param {string} [short] - A short name for the argument
     *
     * @returns {boolean} Whether the argument was passed
     */
    function hasArg(name: string, short?: string): boolean {
        for (let i = 0; i < process.argv.length; i++) {
            const arg = process.argv[i];
            if (arg === `--${name}` || (short && arg === `-${short}`)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Get a string-type argument by name
     *
     * @param {string} name - The name of the argument
     * @param {string} [short] - A short name for the argument
     *
     * @returns {string|void} The argument's value or undefined
     */
    function getArg(name: string, short?: string): string | void {
        for (let i = process.argv.length - 1; i; i--) {
            const arg = process.argv[i];
            if (arg === `--${name}` || (short && arg === `-${short}`)) {
                return process.argv[i + 1];
            } else if (arg.startsWith(`--${name}=`)) {
                return arg.slice(3 + name.length);
            }
        }
        return void 0;
    }

    /**
     * Get a number-type argument by name
     *
     * @param {string} name - The name of the argument
     * @param {string} [short] - A short name for the argument
     *
     * @returns {number|void} A number-representation of the argument
     * 	or undefined
     */
    function getNumArg(name: string, short?: string): number | void {
        const arg = getArg(name, short);
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

    export function printHelp<
        F extends {
            [key: string]: [IO_FORMAT, string] | [IO_FORMAT, string, string];
        }
    >(command: string, format: F): never {
        console.log(`Usage of command "${command}"`);
        console.log('\n');
        for (const key in format) {
            const [, description, short = undefined] = format[key];
            if (!short) {
                console.log(`\t--${key} - ${description}`);
            } else {
                console.log(`\t--${key}, -${short} - ${description}`);
            }
        }
        process.exit(0);
    }

    export function getIO<
        F extends {
            [key: string]: [IO_FORMAT, string] | [IO_FORMAT, string, string];
        }
    >(
        command: string,
        format: F
    ): {
        [key in keyof F]: GetIO<F[key]>;
    } {
        if (hasArg('help', 'h')) {
            printHelp(command, format);
        }
        return objFromEntries(
            Object.keys(format).map((key) => {
                const [value, short = undefined] = format[key];

                switch (value) {
                    case IO_FORMAT.BOOLEAN:
                        return [key, hasArg(key, short)];
                    case IO_FORMAT.NUMBER:
                        return [key, getNumArg(key, short)];
                    case IO_FORMAT.STRING:
                        return [key, getArg(key, short)];
                }
            })
        ) as {
            [key in keyof F]: GetIO<F[key]>;
        };
    }
}

type GetIO<F> = F extends Array<any>
    ? F[0] extends IO_FORMAT.BOOLEAN
        ? boolean
        : F[0] extends IO_FORMAT.STRING
        ? string
        : F[0] extends IO_FORMAT.NUMBER
        ? number
        : void
    : void;

export function getIO<
    F extends {
        [key: string]: [IO_FORMAT, string] | [IO_FORMAT, string, string];
    }
>(
    command: string,
    format: F
): {
    [key in keyof F]: GetIO<F[key]>;
} {
    return IO.getIO(command, format);
}
