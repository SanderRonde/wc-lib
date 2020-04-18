import { inlineTypedCSSPipe } from '../build/cjs/tasks';
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

const I18N_FILE = {
    ...{
        what_is_your_name: [
            {
                defaultValue: 'What is your name',
            },
        ],
        my_name_is: [
            {
                defaultValue: 'My name is',
            },
        ],
        set_lang_to: [
            {
                defaultValue: 'Set language to ',
            },
            {
                defaultValue: 'language',
                replaceable: true,
            },
        ],
        english: [
            {
                defaultValue: 'english',
            },
        ],
        german: [
            {
                defaultValue: 'german',
            },
        ],
        spanish: [
            {
                defaultValue: 'spanish',
            },
        ],
    },
    ...{
        change_lang: [
            {
                defaultValue: 'Change language',
            },
        ],
        change_theme: [
            {
                defaultValue: 'Change theme',
            },
        ],
        has_won: [
            {
                defaultValue: '$WINNER$ has won ðŸŽ‰',
            },
        ],
    },
};

type MessageEntry = {
    defaultValue: string;
    replaceable?: boolean;
}[];

const I18N_GET_MESSAGE = (
    langFile: {
        [key: string]: MessageEntry;
    },
    key: string,
    values: any[]
) => {
    if (!(key in langFile)) {
        return '???';
    }

    if (values.some((v) => v instanceof Promise)) {
        // Values contain promises, return placeholder since this
        // only renders once
        return `{{${key}}}`;
    }

    // Get the relevant entry
    const item = langFile[key as keyof typeof langFile];

    let valueIndex: number = 0;

    let result: string = '';
    for (const { defaultValue, replaceable } of item) {
        if (!replaceable || values[valueIndex] === void 0) {
            result += defaultValue;
        } else {
            result += values[valueIndex];
            valueIndex++;
        }
    }

    return result;
};

function bundleToDir(bundleDir: string) {
    return gulp.series(
        function remove() {
            return new Promise((resolve) => {
                rimraf(path.join(__dirname, bundleDir), (_err) => {
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
                .pipe(gulp.dest(bundleDir));
        },
        function inlineCSS() {
            // Inline all typed CSS
            return gulp
                .src(['**/*.css.js'], {
                    cwd: bundleDir,
                    base: bundleDir,
                })
                .pipe(inlineTypedCSSPipe())
                .pipe(gulp.dest(bundleDir));
        },
        function changeImports() {
            // Change imports to be relative to the root (since
            // it's been moved to dir/)
            return gulp
                .src(['**/*.js'], {
                    cwd: bundleDir,
                    base: bundleDir,
                })
                .pipe(replace(/\.\.\/modules/g, '../../modules'))
                .pipe(gulp.dest(bundleDir));
        },
        async function bundle() {
            // Get all directories in the bundled/ folder
            const dirs = (
                await Promise.all(
                    (await fs.readdir(path.join(__dirname, bundleDir))).map(
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
                                    bundleDir,
                                    dir,
                                    'index.js'
                                ),
                                output: {
                                    path: path.join(__dirname, bundleDir, dir),
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
                        cwd: bundleDir,
                        base: bundleDir,
                        read: false,
                    }
                )
                .pipe(gulpClean());
        }
    );
}

function changeDirHTML(name: string) {
    // Change the overview index page to display
    // different text depending on whether it's bundled or not
    return function changeHTML() {
        return gulp
            .src(['./index.html'], {
                cwd: `./${name}`,
                base: `./${name}`,
            })
            .pipe(replace(/body class="regular"/g, `body class="${name}"`))
            .pipe(gulp.dest(`./${name}`));
    };
}

// Bundle pages
gulp.task(
    'bundle',
    gulp.series(bundleToDir('bundled'), changeDirHTML('bundled'))
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

            const {
                TemplateResult,
                PropertyCommitter,
                EventPart,
                BooleanAttributePart,
                AttributeCommitter,
                NodePart,
                isDirective,
                noChange,
                //@ts-ignore
            } = await import('./modules/lit-html/lit-html.js');

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

                    if ('initComplexTemplateProvider' in mainExport) {
                        mainExport.initComplexTemplateProvider({
                            TemplateResult,
                            PropertyCommitter,
                            EventPart,
                            BooleanAttributePart,
                            AttributeCommitter,
                            NodePart,
                            isDirective,
                            noChange,
                        });
                    }

                    // There's currently just one theme, use that one for all example elements
                    const rendered = ssr(mainExport, {
                        theme: theme['light'],
                        i18n: I18N_FILE,
                        getMessage: I18N_GET_MESSAGE,
                    });

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
        },
        changeDirHTML('ssr')
    )
);
