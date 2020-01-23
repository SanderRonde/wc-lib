import { createServer } from 'http-server';
import * as cypress from 'cypress';
import * as fs from 'fs-extra';
import * as path from 'path';

export const USAGE_TEST_PORT = 1251;

async function fileExists(fileName: string) {
    return await fs.pathExists(fileName);
}

console.log('Starting http-server');
const httpServer = createServer({
    root: path.join(__dirname, '../../'),
});
httpServer.listen(USAGE_TEST_PORT, async () => {
    console.log('Started http-server, running cypress');
    const cypressPath = path.join(__dirname, '../../', 'cypress.json');
    const configFile = JSON.parse(
        (await fileExists(cypressPath))
            ? await fs.readFile(cypressPath, {
                  encoding: 'utf8',
              })
            : await fs.readFile(
                  path.join(
                      __dirname,
                      '../../',
                      'scripts',
                      'cypress.base.json'
                  ),
                  {
                      encoding: 'utf8',
                  }
              )
    );
    cypress
        .run({
            ...configFile,
            record: process.argv.includes('--record'),
            key: process.env.key,
        })
        .then((results) => {
            console.log('Done');
            httpServer.close();
            process.exit(results.totalFailed);
        });
});
