const gulp = require('gulp');
const plumber = require('gulp-plumber');
const less = require('gulp-less');

gulp.task('style', () => (
  gulp.src('src/styles/**/*.less')
    .pipe(plumber())
    .pipe(less())
    .pipe(gulp.dest('dist/styles'))
));

gulp.task('watch', ['style'], () => {
  gulp.watch('src/styles/**/*.less', ['style']);
});
