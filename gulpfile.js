const replace = require('gulp-replace');
const gulp = require('gulp');

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