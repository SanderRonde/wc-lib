"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const makfy_1 = require("makfy");
const choice = makfy_1.choice;
const cmd = makfy_1.cmd;
cmd('clean')
    .desc('Clean repo')
    .run((exec) => __awaiter(void 0, void 0, void 0, function* () {
    yield exec('rimraf ./.nyc_output || echo "No files to delete"');
    yield exec('rimraf ./build || echo "No files to delete"');
    yield exec('rimraf ./coverage || echo "No files to delete"');
    yield exec('rimraf ./instrumented || echo "No files to delete"');
    yield exec('rimraf ./instrumented-cjs || echo "No files to delete"');
    yield exec('rimraf ./examples/bundled || echo "No files to delete"');
    yield exec('rimraf ./examples/modules || echo "No files to delete"');
    yield exec('rimraf ./examples/ssr || echo "No files to delete"');
    yield exec('rimraf ./src/**/*.js || echo "No files to delete"');
    yield exec('rimraf ./src/**/*.d.ts || echo "No files to delete"');
    yield exec('rimraf ./src/**/*.map || echo "No files to delete"');
    yield exec('rimraf ./test/modules || echo "No files to delete"');
}));
cmd('compile')
    .desc('Compile source typescript')
    .args({
    dir: choice(['src', 'test', 'bin', 'examples', 'all'], 'src'),
    watch: makfy_1.flag(),
})
    .argsDesc({
    dir: 'The directory to compile (or all if you want to compile them all)',
    watch: 'Watch for changes',
})
    .run((exec, { watch, dir }) => __awaiter(void 0, void 0, void 0, function* () {
    const watchArg = watch ? '--watch' : '';
    yield exec(`? compiling directory ${dir}`);
    switch (dir) {
        case 'src':
            yield exec([
                `tsc -p src/tsconfig.cjs.json ${watchArg}`,
                `tsc -p src/tsconfig.json ${watchArg}`,
            ]);
            break;
        case 'test':
            yield exec([
                `tsc -p test/tsconfig.cjs.json ${watchArg}`,
                `tsc -p test/tsconfig.json ${watchArg}`,
            ]);
            break;
        case 'bin':
            yield exec(`tsc -p ./tsconfig.bin.json ${watchArg}`);
            break;
        case 'examples':
            yield exec(`tsc -p examples/tsconfig.json ${watchArg}`);
            break;
        case 'all':
            yield exec(`@compile --dir src ${watchArg}`);
            yield exec(`@compile --dir test ${watchArg}`);
            yield exec(`@compile --dir bin ${watchArg}`);
            yield exec(`@compile --dir examples ${watchArg}`);
            break;
    }
}));
cmd('watch')
    .desc('Watch compile typescript files')
    .args({
    dir: choice(['es', 'cjs', 'test-es', 'test-cjs', 'all'], 'es'),
    noclear: makfy_1.flag(),
})
    .argsDesc({
    dir: 'The directory to compile (or all if you want to compile them all)',
    noclear: "Don't clear output on re-compile",
})
    .run((exec, { dir, noclear }) => __awaiter(void 0, void 0, void 0, function* () {
    const clearArg = noclear ? '--preserveWatchOutput' : '';
    yield exec(`? watching directory ${dir}`);
    switch (dir) {
        case 'es':
            yield exec(`tsc -p src/tsconfig.json -w ${clearArg}`);
            break;
        case 'cjs':
            yield exec(`tsc -p src/tsconfig.cjs.json -w ${clearArg}`);
            break;
        case 'test-es':
            yield exec(`tsc -p test/tsconfig.json -w ${clearArg}`);
            break;
        case 'test-cjs':
            yield exec(`tsc -p test/tsconfig.cjs.json -w ${clearArg}`);
            break;
        case 'all':
            yield exec(makfy_1.escape('concurrently', `tsc -p src/tsconfig.json -w --preserveWatchOutput`, `tsc -p src/tsconfig.cjs.json -w --preserveWatchOutput`, `tsc -p test/tsconfig.json -w --preserveWatchOutput`, `tsc -p test/tsconfig.cjs.json -w --preserveWatchOutput`));
    }
}));
cmd('cypress')
    .desc('Run cypress tests')
    .run('node test/usage/test.js');
cmd('_set-cypress')
    .desc('Set the cypress config to only run given files')
    .args({
    selection: choice([
        'all',
        'classes',
        'lib',
        'partial-classes-basic',
        'partial-classes-complex-template',
        'partial-classes-i18n',
        'partial-classes-theming',
        'properties',
        'tasks',
    ], 'all'),
})
    .argsDesc({
    selection: 'What part of the files to select for running',
})
    .run((exec, { selection }) => __awaiter(void 0, void 0, void 0, function* () {
    switch (selection) {
        case 'all':
            yield exec(`? setting selection to test/usage/integration`);
            yield exec('node scripts/set-specs.js test/usage/integration');
            break;
        case 'classes':
            yield exec(`? setting selection to test/usage/integration/classes`);
            yield exec('node scripts/set-specs.js test/usage/integration/classes');
            break;
        case 'lib':
            yield exec(`? setting selection to test/usage/integration/lib`);
            yield exec('node scripts/set-specs.js test/usage/integration/lib');
            break;
        case 'partial-classes-basic':
            yield exec(`? setting selection to test/usage/integration/partial-classes/basic`);
            yield exec('node scripts/set-specs.js test/usage/integration/partial-classes/basic');
            break;
        case 'partial-classes-complex-template':
            yield exec(`? setting selection to test/usage/integration/partial-classes/complex-template`);
            yield exec('node scripts/set-specs.js test/usage/integration/partial-classes/complex-template');
            break;
        case 'partial-classes-i18n':
            yield exec(`? setting selection to test/usage/integration/partial-classes/i18n`);
            yield exec('node scripts/set-specs.js test/usage/integration/partial-classes/i18n');
            break;
        case 'partial-classes-theming':
            yield exec(`? setting selection to test/usage/integration/partial-classes/theming`);
            yield exec('node scripts/set-specs.js test/usage/integration/partial-classes/theming');
            break;
        case 'properties':
            yield exec(`? setting selection to test/usage/integration/properties`);
            yield exec('node scripts/set-specs.js test/usage/integration/properties');
            break;
        case 'tasks':
            yield exec(`? setting selection to test/usage/integration/tasks`);
            yield exec('node scripts/set-specs.js test/usage/integration/tasks');
            break;
    }
}));
cmd('test')
    .desc('Run tests')
    .args({
    subtest: choice(['unit', 'cypress', 'all'], 'all'),
})
    .argsDesc({
    subtest: 'Which subtest to run',
})
    .run((exec, { subtest }) => __awaiter(void 0, void 0, void 0, function* () {
    switch (subtest) {
        case 'unit':
            yield exec('? generating CJS lit-html bundle at test/modules/lit-html.js');
            yield exec('rollup node_modules/lit-html/lit-html.js --file test/modules/lit-html.js --format cjs --banner "var window = {}"');
            yield exec('? testing with ava');
            yield exec('ava');
            break;
        case 'cypress':
            yield exec('? testing with cypress');
            yield exec('node test/usage/test.js');
            break;
        case 'all':
            yield exec('? compiling typescript and setting test selection');
            yield exec([
                '@compile --dir all',
                '@_set-cypress --selection all',
            ]);
            yield exec('? running tests');
            yield exec('@test --subtest cypress');
            yield exec('@test --subtest unit');
            break;
    }
}));
cmd('serve')
    .desc('Serve current directory on localhost')
    .args({
    port: makfy_1.str('1251'),
})
    .argsDesc({
    port: 'The port to serve it on',
})
    .run((exec, { port }) => __awaiter(void 0, void 0, void 0, function* () {
    yield exec(`http-server -c-1 -p ${port} .`);
}));
cmd('examples')
    .desc('Compile and prepare examples for serving')
    .run('@compile --dir all', '@serve');
cmd('website')
    .desc('Compile and prepare website for serving, including bundled and SSRed examples')
    .run((exec) => __awaiter(void 0, void 0, void 0, function* () {
    yield exec('? compiling TS');
    yield exec('@compile --dir all');
    yield exec('? preparing website');
    yield exec('gulp prepareWebsite');
    yield exec('? generating bundles');
    yield exec('node -r @std/esm ./node_modules/gulp/bin/gulp.js --cwd examples bundle', 'node -r @std/esm ./node_modules/gulp/bin/gulp.js --cwd examples ssr');
}));
cmd('coverage')
    .args({
    subset: choice([
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
    ], 'all'),
})
    .argsDesc({
    subset: 'The subset for which to collect coverage',
})
    .run((exec, { subset }) => __awaiter(void 0, void 0, void 0, function* () {
    yield exec('? clearing previous coverage');
    yield exec('rimraf ./.nyc_output');
    if (subset === 'unit' || subset == 'all') {
        yield exec('? generating CJS lit-html bundle at test/modules/lit-html.js');
        yield exec('rollup node_modules/lit-html/lit-html.js --file test/modules/lit-html.js --format cjs --banner "var window = {}"');
    }
    else {
        const cypressSubset = subset === 'cypress' ? 'all' : subset;
        yield exec(`? setting cypress selection to ${cypressSubset}`);
        yield exec(`@_set-cypress --selection ${cypressSubset}`);
    }
    yield exec('? compiling TS');
    yield exec('@compile --dir all');
    yield exec('? copying maps and ignoring typescript for coverage');
    yield exec('gulp precoverage');
    yield exec('? instrumenting code');
    yield exec('nyc instrument build/es/ instrumented/', 'nyc instrument build/cjs/ instrumented-cjs/');
    yield exec('? rerouting imports to instrumented code');
    yield exec('gulp replaceTestImports');
    if (subset !== 'unit') {
        yield exec('? running cypress test');
        yield exec(`nyc --no-clean --reporter=text npm run cypress`);
    }
    if (subset === 'unit' || subset === 'all') {
        yield exec('? running unit test');
        yield exec(`nyc --no-clean --reporter=text npm run ava`);
    }
    yield exec('? filtering out invalid paths');
    yield exec('gulp filterInstrumented');
    yield exec('? compiling to sourcemaps');
    yield exec('tsc -p src/tsconfig.sourcemap.json');
    yield exec('? joining coverages');
    yield exec('nyc merge .nyc_output .nyc_output/joined.json');
    yield exec('? mapping coverage to sourcemaps');
    yield exec('remap-istanbul -i .nyc_output/joined.json -t html -o coverage/', 'remap-istanbul -i .nyc_output/joined.json -t lcovonly -o coverage/lcov.info');
    yield exec('? Done! Coverage can be found in coverage/index.html');
}));
cmd('prepack')
    .desc('Command to run before packaging, builds and runs prepack commands')
    .run('? cleaning', '@clean', '? compiling TS', '@compile --dir all', '? removing flags', 'gulp prepack', '? creating bundle', 'rollup build/es/wc-lib.js --file build/wc-lib.bundle.js --format umd --name "wc-lib"', '? minifiying', 'uglifyjs build/wc-lib.bundle.js -o build/wc-lib.bundle.min.js');
//# sourceMappingURL=makfyfile.js.map