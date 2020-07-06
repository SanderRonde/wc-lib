import { cmd as _cmd, choice as _choice, flag, escape, str } from 'makfy';
import { choice, cmd } from './types/makfy-extended';
const choice = (_choice as unknown) as choice;
const cmd = (_cmd as unknown) as cmd;

cmd('clean')
    .desc('Clean repo')
    .run(async (exec) => {
        await exec('rimraf ./.nyc_output || echo "No files to delete"');
        await exec('rimraf ./build || echo "No files to delete"');
        await exec('rimraf ./coverage || echo "No files to delete"');
        await exec('rimraf ./instrumented || echo "No files to delete"');
        await exec('rimraf ./instrumented-cjs || echo "No files to delete"');
        await exec('rimraf ./examples/bundled || echo "No files to delete"');
        await exec('rimraf ./examples/modules || echo "No files to delete"');
        await exec('rimraf ./examples/ssr || echo "No files to delete"');
        await exec('rimraf ./src/**/*.js || echo "No files to delete"');
        await exec('rimraf ./src/**/*.d.ts || echo "No files to delete"');
        await exec('rimraf ./src/**/*.map || echo "No files to delete"');
        await exec('rimraf ./test/modules || echo "No files to delete"');
    });

cmd('compile')
    .desc('Compile source typescript')
    .args({
        dir: choice(['src', 'test', 'bin', 'examples', 'all'], 'src'),
        watch: flag(),
    })
    .argsDesc({
        dir:
            'The directory to compile (or all if you want to compile them all)',
        watch: 'Watch for changes',
    })
    .run(async (exec, { watch, dir }) => {
        const watchArg = watch ? '--watch' : '';

        await exec(`? compiling directory ${dir}`);
        switch (dir) {
            case 'src':
                await exec([
                    `tsc -p src/tsconfig.cjs.json ${watchArg}`,
                    `tsc -p src/tsconfig.json ${watchArg}`,
                ]);
                break;
            case 'test':
                await exec([
                    `tsc -p test/tsconfig.cjs.json ${watchArg}`,
                    `tsc -p test/tsconfig.json ${watchArg}`,
                ]);
                break;
            case 'bin':
                await exec(`tsc -p ./tsconfig.bin.json ${watchArg}`);
                break;
            case 'examples':
                await exec(`tsc -p examples/tsconfig.json ${watchArg}`);
                break;
            case 'all':
                await exec(`@compile --dir src ${watchArg}`);
                await exec(`@compile --dir test ${watchArg}`);
                await exec(`@compile --dir bin ${watchArg}`);
                await exec(`@compile --dir examples ${watchArg}`);
                break;
        }
    });

cmd('watch')
    .desc('Watch compile typescript files')
    .args({
        dir: choice(['es', 'cjs', 'test-es', 'test-cjs', 'all'], 'es'),
        noclear: flag(),
    })
    .argsDesc({
        dir:
            'The directory to compile (or all if you want to compile them all)',
        noclear: "Don't clear output on re-compile",
    })
    .run(async (exec, { dir, noclear }) => {
        const clearArg = noclear ? '--preserveWatchOutput' : '';
        await exec(`? watching directory ${dir}`);
        switch (dir) {
            case 'es':
                await exec(`tsc -p src/tsconfig.json -w ${clearArg}`);
                break;
            case 'cjs':
                await exec(`tsc -p src/tsconfig.cjs.json -w ${clearArg}`);
                break;
            case 'test-es':
                await exec(`tsc -p test/tsconfig.json -w ${clearArg}`);
                break;
            case 'test-cjs':
                await exec(`tsc -p test/tsconfig.cjs.json -w ${clearArg}`);
                break;
            case 'all':
                await exec(
                    escape(
                        'concurrently',
                        `tsc -p src/tsconfig.json -w --preserveWatchOutput`,
                        `tsc -p src/tsconfig.cjs.json -w --preserveWatchOutput`,
                        `tsc -p test/tsconfig.json -w --preserveWatchOutput`,
                        `tsc -p test/tsconfig.cjs.json -w --preserveWatchOutput`
                    )
                );
        }
    });

cmd('cypress')
    .desc('Run cypress tests')
    .run('node test/usage/test.js');

cmd('_set-cypress')
    .desc('Set the cypress config to only run given files')
    .args({
        selection: choice(
            [
                'all',
                'classes',
                'lib',
                'partial-classes-basic',
                'partial-classes-complex-template',
                'partial-classes-i18n',
                'partial-classes-theming',
                'properties',
                'tasks',
            ],
            'all'
        ),
    })
    .argsDesc({
        selection: 'What part of the files to select for running',
    })
    .run(async (exec, { selection }) => {
        switch (selection) {
            case 'all':
                await exec(`? setting selection to test/usage/integration`);
                await exec('node scripts/set-specs.js test/usage/integration');
                break;
            case 'classes':
                await exec(
                    `? setting selection to test/usage/integration/classes`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/classes'
                );
                break;
            case 'lib':
                await exec(`? setting selection to test/usage/integration/lib`);
                await exec(
                    'node scripts/set-specs.js test/usage/integration/lib'
                );
                break;
            case 'partial-classes-basic':
                await exec(
                    `? setting selection to test/usage/integration/partial-classes/basic`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/partial-classes/basic'
                );
                break;
            case 'partial-classes-complex-template':
                await exec(
                    `? setting selection to test/usage/integration/partial-classes/complex-template`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/partial-classes/complex-template'
                );
                break;
            case 'partial-classes-i18n':
                await exec(
                    `? setting selection to test/usage/integration/partial-classes/i18n`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/partial-classes/i18n'
                );
                break;
            case 'partial-classes-theming':
                await exec(
                    `? setting selection to test/usage/integration/partial-classes/theming`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/partial-classes/theming'
                );
                break;
            case 'properties':
                await exec(
                    `? setting selection to test/usage/integration/properties`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/properties'
                );
                break;
            case 'tasks':
                await exec(
                    `? setting selection to test/usage/integration/tasks`
                );
                await exec(
                    'node scripts/set-specs.js test/usage/integration/tasks'
                );
                break;
        }
    });

cmd('test')
    .desc('Run tests')
    .args({
        subtest: choice(['unit', 'cypress', 'all'], 'all'),
    })
    .argsDesc({
        subtest: 'Which subtest to run',
    })
    .run(async (exec, { subtest }) => {
        switch (subtest) {
            case 'unit':
                await exec(
                    '? generating CJS lit-html bundle at test/modules/lit-html.js'
                );
                await exec(
                    'rollup node_modules/lit-html/lit-html.js --file test/modules/lit-html.js --format cjs --banner "var window = {}"'
                );
                await exec('? testing with ava');
                await exec('ava');
                break;
            case 'cypress':
                await exec('? testing with cypress');
                await exec('node test/usage/test.js');
                break;
            case 'all':
                await exec('? compiling typescript and setting test selection');
                await exec([
                    '@compile --dir all',
                    '@_set-cypress --selection all',
                ]);
                await exec('? running tests');
                await exec('@test --subtest cypress');
                await exec('@test --subtest unit');
                break;
        }
    });

cmd('serve')
    .desc('Serve current directory on localhost')
    .args({
        port: str('1251'),
    })
    .argsDesc({
        port: 'The port to serve it on',
    })
    .run(async (exec, { port }) => {
        await exec(`http-server -c-1 -p ${port} .`);
    });

cmd('examples')
    .desc('Compile and prepare examples for serving')
    .run('@compile --dir all', '@serve');

cmd('website')
    .desc(
        'Compile and prepare website for serving, including bundled and SSRed examples'
    )
    .run(async (exec) => {
        await exec('? compiling TS');
        await exec('@compile --dir all');
        await exec('? preparing website');
        await exec('gulp prepareWebsite');
        await exec('? generating bundles');
        await exec(
            'node -r @std/esm ./node_modules/gulp/bin/gulp.js --cwd examples bundle',
            'node -r @std/esm ./node_modules/gulp/bin/gulp.js --cwd examples ssr'
        );
    });

cmd('coverage')
    .args({
        subset: choice(
            [
                'all',
                'classes',
                'lib',
                'partial-classes-basic',
                'partial-classes-complex-template',
                'partial-classes-i18n',
                'partial-classes-theming',
                'properties',
                'tasks',
                'cypress',
                'unit',
            ],
            'all'
        ),
    })
    .argsDesc({
        subset: 'The subset for which to collect coverage',
    })
    .run(async (exec, { subset }) => {
        await exec('? clearing previous coverage');
        await exec('rimraf ./.nyc_output');
        if (subset === 'unit') {
            await exec(
                '? generating CJS lit-html bundle at test/modules/lit-html.js'
            );
            await exec(
                'rollup node_modules/lit-html/lit-html.js --file test/modules/lit-html.js --format cjs --banner "var window = {}"'
            );
        } else {
            const cypressSubset = subset === 'cypress' ? 'all' : subset;
            await exec(`? setting cypress selection to ${cypressSubset}`);
            await exec(`@_set-cypress --selection ${cypressSubset}`);
        }
        await exec('? compiling TS');
        await exec('@compile --dir all');
        await exec('? copying maps and ignoring typescript for coverage');
        await exec('gulp precoverage');
        await exec('? instrumenting code');
        await exec(
            'nyc instrument build/es/ instrumented/',
            'nyc instrument build/cjs/ instrumented-cjs/'
        );
        await exec('? rerouting imports to instrumented code');
        await exec('gulp replaceTestImports');
        if (subset !== 'unit') {
            await exec('? running cypress test');
            await exec(`nyc --no-clean --reporter=text npm run cypress`);
        }
        if (subset === 'unit' || subset === 'all') {
            await exec('? running unit test');
            await exec(`nyc --no-clean --reporter=text npm run ava`);
        }
        await exec('? filtering out invalid paths');
        await exec('gulp filterInstrumented');
        await exec('? compiling to sourcemaps');
        await exec('tsc -p src/tsconfig.sourcemap.json');
        await exec('? joining coverages');
        await exec('nyc merge .nyc_output .nyc_output/joined.json');
        await exec('? mapping coverage to sourcemaps');
        await exec(
            'remap-istanbul -i .nyc_output/joined.json -t html -o coverage/',
            'remap-istanbul -i .nyc_output/joined.json -t lcovonly -o coverage/lcov.info'
        );
        await exec('? Done! Coverage can be found in coverage/index.html');
    });

cmd('prepack')
    .desc('Command to run before packaging, builds and runs prepack commands')
    .run(
        '? cleaning',
        '@clean',
        '? compiling TS',
        '@compile --dir all',
        '? removing flags',
        'gulp prepack',
        '? creating bundle',
        'rollup build/es/wc-lib.js --file build/wc-lib.bundle.js --format umd --name "wc-lib"',
        '? minifiying',
        'uglifyjs build/wc-lib.bundle.js -o build/wc-lib.bundle.min.js'
    );
