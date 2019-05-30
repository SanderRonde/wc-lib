const replace = require('gulp-replace');
const fs = require('fs-extra');
const glob = require('glob');
const gulp = require('gulp');

const ISTANBUL_IGNORE_START = '/* istanbul ignore start */';
const ISTANBUL_IGNORE_END = '/* istanbul ignore end */';

const typescriptInsertedData = [
	[
		'var __decorate = (this && this.__decorate)',
		'};'
	], [
		'var __awaiter = (this && this.__awaiter)',
		'};'
	]
];

function istanbulIgnoreTypescript(file) {
	let found = false;
	for (const [ start ] of typescriptInsertedData) {
		if (file.indexOf(start) > -1) {
			found = true;
		}
	}
	if (!found || file.indexOf(ISTANBUL_IGNORE_START) > -1 || 
		file.indexOf(ISTANBUL_IGNORE_END) > -1) {
			return file;
		}

	const ignoredLines = [];
	let ignoring = false;
	const lines = file.split('\n');
	for (let i = 0; i < lines.length; i++) {
		if (ignoring) {
			for (const [ , endStr ] of typescriptInsertedData) {
				if (lines[i].indexOf(endStr) > -1) {
					ignoring = false;
					break;
				}
			}
			ignoredLines.push(i);
		} else {
			for (const [ startStr ] of typescriptInsertedData) {
				if (lines[i].indexOf(startStr) > -1) {
					ignoring = true;
					ignoredLines.push(i);
					break;
				}
			}
		}
	}

	// Find contiguous blocks
	const blocks = [];
	let currentBlock = null;
	for (let i = 1; i < ignoredLines.length; i++) {
		if (ignoredLines[i] === ignoredLines[i -1] + 1) {
			// Contiguous
			if (currentBlock === null) {
				currentBlock = {
					start: ignoredLines[i - 1],
					end: Infinity
				}
			}
		} else {
			// End of contiguous block
			currentBlock.end = ignoredLines[i - 1];
			blocks.push(currentBlock);
			currentBlock = null;
		}
	}
	if (currentBlock) {
		currentBlock.end = ignoredLines[ignoredLines.length - 1];
		blocks.push(currentBlock);
	}

	// Insert comments before/after those blocks
	const newLines = [...lines];
	for (let i = blocks.length - 1; i >= 0; i--) {
		const { start, end } = blocks[i];
		newLines.splice(end + 1, 0, ISTANBUL_IGNORE_END);
		newLines.splice(start, 0, ISTANBUL_IGNORE_START);
	}

	return newLines.join('\n');
}

gulp.task('replaceTestImports', () => {
	return gulp.src([
			'**/*.js'
		], {
			cwd: './test',
			base: './test'
		})
		.pipe(replace('/src/', '/instrumented/'))
		.pipe(gulp.dest('test'));
});

function globProm(pattern, options) {
	return new Promise((resolve, reject) => [
		glob(pattern, options || {}, (err, matches) => {
			if (err) {
				reject(err);
			} else {
				resolve(matches);
			}
		})
	]);
}

gulp.task('addIstanbulIgnore', async () => {
	return Promise.all((await globProm('src/**/*.js')).map(async (filePath) => {
		const content = await fs.readFile(filePath, {
			encoding: 'utf8'
		});
		await fs.writeFile(filePath, istanbulIgnoreTypescript(content), {
			encoding: 'utf8'
		})
	}));
});