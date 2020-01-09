import { inlineTypedCSSPipe } from '../build/cjs/tasks/tasks';
import * as replace from 'gulp-replace';
import * as webpack from 'webpack';
import * as rimraf from 'rimraf';
import * as fs from 'fs-extra'; 
import * as gulp from 'gulp';
import * as path from 'path';

// Prepares the examples for hosting on gh-pages
gulp.task('bundle', gulp.series(function clean() {
	return new Promise((resolve) => {
		rimraf(path.join(__dirname, 'temp'), (_err) => {
			console.log(_err);
			// Ignore errors because if it doesn't exist
			// it's been removed anyway
			resolve();
		});
	});
}, function copy() {
	return gulp.src([
		'**/*.js',
		'**/*.html'
	], {
		cwd: './',
		base: './'
	})
	.pipe(gulp.dest('./temp/'));
}, function inlineCSS() {
	return gulp.src([
		'**/*.css.js'
	], {
		cwd: './temp/',
		base: './temp/'
	})
	.pipe(inlineTypedCSSPipe())
	.pipe(gulp.dest('./temp'));
}, function changeImports() {
	return gulp.src([
		'**/*.js',
	], {
		cwd: './temp/',
		base: './temp/'
	})
	.pipe(replace(/\.\.\/\.\.\//g, 
		'../../../'))
	.pipe(gulp.dest('temp'));
}, async function bundle() {
	const dirs = (await Promise.all((await fs.readdir(path.join(__dirname, 'temp'))).map(async (file) => {
		return [file, await fs.stat(file)]
	}))).filter(([ _, stat ]) => (stat as fs.Stats).isDirectory())
		.map(([name, _]) => name as string);
	console.log(dirs);
	return Promise.all(dirs.map((dir) => {
		console.log(dir);
		return new Promise((resolve, reject) => {
			webpack({
				mode: 'production',
				entry: path.join(__dirname, 'temp', dir, 'index.js'),
				output: {
					path: path.join(__dirname, 'temp', dir),
					filename: 'index2.js'
				}
			}, (err, stats) => {
				console.log(err, stats.compilation.outputOptions.path);
				if (err) {
					reject(err);
					return;
				}
				resolve();
			});
		});
	}))
}));