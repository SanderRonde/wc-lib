const fs = require('fs-extra');
const path = require('path');

(async () => {
	const specs = process.argv[2];

	const base = JSON.parse(await fs.readFile(
		path.join(__dirname, 'cypress.base.json'), {
			encoding: 'utf8'
		}));
	await fs.writeFile(path.join(__dirname, '../',
		'cypress.json'), JSON.stringify({
			...base,
			integrationFolder: specs
		}, null, 4), {
			encoding: 'utf8'
		});
})();