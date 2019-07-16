import { createServer } from 'http-server';
import * as cypress from 'cypress';
import * as fs from 'fs-extra';
import * as path from 'path';

export const USAGE_TEST_PORT = 1251;

console.log('Starting http-server');
const httpServer = createServer({
	root: path.join(__dirname, '../../')
});
httpServer.listen(USAGE_TEST_PORT, async () => {
	console.log('Started http-server, running cypress');
	const configFile = JSON.parse(await fs.readFile(path.join(__dirname, '../../',
		'cypress.json'), {
			encoding: 'utf8'
		}));
	cypress.run({
		...configFile,
		record: process.argv.includes('--record'),
		key: process.env.key,
		spec: process.argv.includes('--spec') ?
			process.argv[process.argv.indexOf('--spec') + 1] : 'test/**/*.spec.js'
	}).then((results) => {
		console.log('Done');
		httpServer.close();
		process.exit(results.totalFailed);
	});
});