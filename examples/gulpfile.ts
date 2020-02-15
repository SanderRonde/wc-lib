import { inlineTypedCSSPipe } from '../build/cjs/tasks/tasks';
import { ssr } from '../build/cjs/lib/ssr/ssr';
import { theme } from './tic-tac-toe/theme';
const gulpClean = require('gulp-clean');
import * as replace from 'gulp-replace';
import * as webpack from 'webpack';
import * as rimraf from 'rimraf';
import * as fs from 'fs-extra';
import * as gulp from 'gulp';
import * as path from 'path';

const EXCLUDED_DIRS = ['ssr', 'modules', 'bundled'];

function bundleToDir(dir: string) {
    return gulp.series(
        function remove() {
            return new Promise((resolve) => {
                rimraf(path.join(__dirname, dir), (_err) => {
                    // Ignore errors because if it doesn't exist
                    // it's been removed anyway
                    resolve();
                });
            });
        },
        function copy() {
            // Copy all source files to the bundled directory
            return gulp
                .src(
                    [
                        '**/*.js',
                        '**/*.html',
                        '**/*.json',
                        '**/*.png',
                        '!ssr/**',
                        '!bundled/**',
                    ],
                    {
                        cwd: './',
                        base: './',
                    }
                )
                .pipe(gulp.dest(dir));
        },
        function inlineCSS() {
            // Inline all typed CSS
            return gulp
                .src(['**/*.css.js'], {
                    cwd: dir,
                    base: dir,
                })
                .pipe(inlineTypedCSSPipe())
                .pipe(gulp.dest(dir));
        },
        function changeImports() {
            // Change imports to be relative to the root (since
            // it's been moved to dir/)
            return gulp
                .src(['**/*.js'], {
                    cwd: dir,
                    base: dir,
                })
                .pipe(replace(/\.\.\/modules/g, '../../modules'))
                .pipe(gulp.dest(dir));
        },
        async function bundle() {
            // Get all directories in the bundled/ folder
            const dirs = (
                await Promise.all(
                    (await fs.readdir(path.join(__dirname, dir))).map(
                        async (file) => {
                            return [file, await fs.stat(file)];
                        }
                    )
                )
            )
                .filter(([_, stat]) => (stat as fs.Stats).isDirectory())
                .map(([name, _]) => name as string)
                .filter((name) => EXCLUDED_DIRS.indexOf(name) === -1);

            // For every dir, bundle the index.js file
            return Promise.all(
                dirs.map((dir) => {
                    return new Promise((resolve, reject) => {
                        webpack(
                            {
                                mode: 'production',
                                entry: path.join(
                                    __dirname,
                                    dir,
                                    dir,
                                    'index.js'
                                ),
                                output: {
                                    path: path.join(__dirname, dir, dir),
                                    filename: 'index.js',
                                },
                                optimization: {
                                    usedExports: true,
                                },
                                node: false,
                            },
                            (err) => {
                                if (err) {
                                    reject(err);
                                    return;
                                }
                                resolve();
                            }
                        );
                    });
                })
            );
        },
        function clean() {
            // Clean all non-bundle files
            return gulp
                .src(
                    [
                        '**/*.*',
                        '!**/index.js',
                        '!**/index.html',
                        '!**/*.json',
                        '!**/*.png',
                    ],
                    {
                        cwd: dir,
                        base: dir,
                        read: false,
                    }
                )
                .pipe(gulpClean());
        }
    );
}

// Bundle pages
gulp.task(
    'bundle',
    gulp.series(bundleToDir('bundled'), function changeHTML() {
        // Change the overview index page to display
        // different text depending on whether it's bundled or not
        return gulp
            .src(['index.html'], {
                cwd: './bundled',
                base: './bundled',
            })
            .pipe(replace(/hidden id="ifnotbundled"/g, 'id="ifnotbundled"'))
            .pipe(replace(/id="ifbundled"/g, 'hidden id="ifbundled"'))
            .pipe(gulp.dest('./'));
    })
);

// Bundle and server-side render pages
gulp.task(
    'ssr',
    gulp.series(
        bundleToDir('ssr'),
        async function serverSideRender() {
            // Get all directories in the bundled/ folder
            const dirs = (
                await Promise.all(
                    (await fs.readdir(__dirname)).map(async (file) => {
                        return [file, await fs.stat(file)];
                    })
                )
            )
                .filter(([_, stat]) => (stat as fs.Stats).isDirectory())
                .map(([name, _]) => name as string)
                .filter((name) => EXCLUDED_DIRS.indexOf(name) === -1);

            return Promise.all(
                dirs.map(async (dir) => {
                    const imports = await import(
                        path.join(__dirname, dir, `${dir}.js`)
                    );
                    const keys = Object.keys(imports).filter(
                        (k) => k[0] === k[0].toUpperCase()
                    );
                    if (keys.length === 0) {
                        throw new Error('No exports');
                    }
                    const mainExport = imports[keys[0]];

                    // There's currently just one theme, use that one for all example elements
                    const rendered = ssr(mainExport, {}, {}, theme['light']);

                    const htmlPath = path.join(
                        __dirname,
                        'ssr',
                        dir,
                        'index.html'
                    );
                    const ssrHTML = await fs.readFile(htmlPath, {
                        encoding: 'utf8',
                    });

                    const replaced = ssrHTML.replace(
                        `<${mainExport.is}></${mainExport.is}>`,
                        rendered
                    );
                    await fs.writeFile(htmlPath, replaced, {
                        encoding: 'utf8',
                    });
                })
            );
        }
        // TODO: changeHTML
    )
);
