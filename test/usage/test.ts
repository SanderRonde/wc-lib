import { createServer } from 'http-server';
import * as cypress from 'cypress';
import * as fs from 'fs-extra';
import * as path from 'path';

export const USAGE_TEST_PORT = 1251;

function optionalObj<O extends Object>(obj: O, condition: boolean): O|{} {
	if (condition) return obj;
	return {};
}

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
		...optionalObj({
			record: false,
			videosFolder: false,
			videoRecording: false,
			video: false
		}, process.argv.indexOf('--no-record') > -1),
		key: process.env.key
	}).then((results) => {
		console.log('Done');
		httpServer.close();
		process.exit(results.totalFailed);
	});
});