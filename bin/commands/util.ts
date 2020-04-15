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
