import { inlineTypedCSSPipe } from '../build/cjs/tasks/tasks';
const gulpClean = require('gulp-clean');
import * as replace from 'gulp-replace';
import * as webpack from 'webpack';
import * as rimraf from 'rimraf';
import * as fs from 'fs-extra'; 
import * as gulp from 'gulp';
import * as path from 'path';

// Bundle pages
gulp.task('bundle', gulp.series(function remove() {
	return new Promise((resolve) => {
		rimraf(path.join(__dirname, '../examples-bundled'), (_err) => {
			// Ignore errors because if it doesn't exist
			// it's been removed anyway
			resolve();
		});
	});
}, function copy() {
	// Copy all source files to the bundled directory
	return gulp.src([
		'**/*.js',
		'**/*.html',
		'**/*.json',
		'**/*.png',
	], {
		cwd: './',
		base: './'
	})
	.pipe(gulp.dest('../examples-bundled/'));
}, function inlineCSS() {
	// Inline all typed CSS
	return gulp.src([
		'**/*.css.js'
	], {
		cwd: '../examples-bundled/',
		base: '../examples-bundled/'
	})
	.pipe(inlineTypedCSSPipe())
	.pipe(gulp.dest('../examples-bundled'));
}, function changeImports() {
	// Change imports to be relative to the root (since
	// it's been moved to bundled/)
	return gulp.src([
		'**/*.js',
	], {
		cwd: '../examples-bundled/',
		base: '../examples-bundled/'
	})
	.pipe(replace(/\.\.\/\.\.\//g, 
		'../../../'))
	.pipe(gulp.dest('bundled'));
}, async function bundle() {
	// GEt all directories in the bundled/ folder
	const dirs = (await Promise.all((await fs.readdir(path.join(__dirname, '../examples-bundled'))).map(async (file) => {
		return [file, await fs.stat(file)]
	}))).filter(([ _, stat ]) => (stat as fs.Stats).isDirectory())
		.map(([name, _]) => name as string);

	// For every dir, bundle the index.js file
	return Promise.all(dirs.map((dir) => {
		return new Promise((resolve, reject) => {
			webpack({
				mode: 'production',
				entry: path.join(__dirname, '../examples-bundled', dir, 'index.js'),
				output: {
					path: path.join(__dirname, '../examples-bundled', dir),
					filename: 'index.js'
				},
				optimization: {
					usedExports: true
				},
				node: false
			}, (err) => {
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}))
}, function clean() {
	// Clean all non-bundle files
	return gulp.src([
		'**/*.*',
		'!**/index.js',
		'!**/index.html',
		'!**/*.json',
		'!**/*.png',
	], {
		cwd: '../examples-bundled',
		base: '../examples-bundled',
		read: false
	})
	.pipe(gulpClean())
}, function changeHTML() {
	// Change the overview index page to display
	// different text depending on whether it's bundled or not
	return gulp.src([
		'index.html'
	], {
		cwd: '../examples-bundled',
		base: '../examples-bundled',
	})
	.pipe(replace(/hidden id="ifnotbundled"/g, 'id="ifnotbundled"'))
	.pipe(replace(/id="ifbundled"/g, 'hidden id="ifbundled"'))
	.pipe(gulp.dest('./'))
}));