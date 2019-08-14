import * as replace from 'gulp-replace';
import * as fs from 'fs-extra';
import * as glob from 'glob';
import * as gulp from 'gulp';
import * as path from 'path';

declare class Promise<T> {
	constructor(handlers: (resolve: (value: T) => any, reject: (err: any) => any) => any);
	then(callback: (value: T) => any): this;
	static all<T>(promises: T[]): Promise<T[]>;
}

const ISTANBUL_IGNORE_NEXT = '/* istanbul ignore next */';
const typescriptInsertedData = [[
	'var __decorate = (this && this.__decorate)',
	'};'
], [
	'var __awaiter = (this && this.__awaiter)',
	'};'
]];

function istanbulIgnoreTypescript(file: string) {
	let found = false;
	for (const [ start ] of typescriptInsertedData) {
		if (file.indexOf(start) > -1) {
			found = true;
		}
	}
	if (!found) {
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
	const blocks: {
		start: number;
		end: number;
	}[] = [];
	let currentBlock: {
		start: number;
		end: number;
	}|null = {
		start: 0,
		end: Infinity
	};
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
			currentBlock!.end = ignoredLines[i - 1];
			blocks.push(currentBlock!);
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
		const { start } = blocks[i];
		if (newLines[Math.max(start - 1, 0)].indexOf(ISTANBUL_IGNORE_NEXT) === -1) {
			newLines.splice(start, 0, ISTANBUL_IGNORE_NEXT);
		}
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
		.pipe(replace('/build/es/', '/instrumented/'))
		.pipe(gulp.dest('test'));
});

function globProm(pattern: string, options?: any): Promise<string[]> {
	return new Promise((resolve, reject) => [
		glob(pattern, options || {}, (err: any|void, matches: string[]) => {
			if (err) {
				reject(err);
			} else {
				resolve(matches);
			}
		})
	]);
}

gulp.task('istanbulIgnoreTypescript', async () => {
	return Promise.all((await globProm('src/**/*.js')).map(async (filePath) => {
		const content = await fs.readFile(filePath, {
			encoding: 'utf8'
		});
		await fs.writeFile(filePath, istanbulIgnoreTypescript(content), {
			encoding: 'utf8'
		})
	}));
});

gulp.task('patchCypressIstanbul', async () => {
	const filePath = path.join(__dirname,
		'node_modules/cypress-istanbul/task.js');
	const file = await fs.readFile(filePath, {
			encoding: 'utf8'
		});
	await fs.writeFile(filePath, file.replace(
		/console.log\('wrote coverage file %s', nycFilename\)/g,
		''), {
			encoding: 'utf8'
		});
});

// Removes istanbul ignores from the compiled JS
gulp.task('removeIstanbulIgnoresCompiled', () => {
	return gulp.src([
			'**/*.js',
			'**/*.d.ts'
	 	], {
			cwd: 'build/',
			base: 'build/'
		})
		.pipe(replace(/(\n\s+)?\/\*(\s*)istanbul(.*?)\*\//g, ''))
		.pipe(gulp.dest('build/'));
});

// Removes istanbul ignores from the uncompiled TS. Should only be done before packaging
gulp.task('removeIstanbulIgnoresSource', () => {
	return gulp.src([
			'**/*.ts'
		], {
			cwd: 'src/',
			base: 'src/'
		})
		.pipe(replace(/(\n\s+)?\/\*(\s*)istanbul(.*?)\*\//g, ''))
		.pipe(gulp.dest('src/'));
});

// Prepares the examples for hosting on gh-pages
gulp.task('prepareWebsite', gulp.parallel(function moveLitHTML() {
		return gulp.src([
				'**/*.*'
			], {
				cwd: 'node_modules/lit-html/',
				base: 'node_modules/lit-html/'
			})
			.pipe(gulp.dest('examples/modules/lit-html/'));
	}, function movewclib() {
		return gulp.src([
				'**/*.*'
			], {
				cwd: 'build/es/',
				base: 'build/es/'
			})
			.pipe(gulp.dest('examples/modules/wc-lib/'));
	}, function changeImports() {
		return gulp.src([
				'**/*.js',
				'**/*.ts'
			], {
				cwd: 'examples',
				base: 'examples'
			})
			.pipe(replace(/\.\.\/\.\.\/node\_modules\/lit\-html/g, 
				'../modules/lit-html'))
			.pipe(replace(/\.\.\/\.\.\/build\/es/g, 
				'../modules/wc-lib'))
			.pipe(gulp.dest('examples/'));
	}));