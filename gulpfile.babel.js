import gulp from 'gulp';
import plumber from 'gulp-plumber';
import sourcemaps from 'gulp-sourcemaps';
import cached from 'gulp-cached';
import babel from 'gulp-babel';
import PrettyError from 'pretty-error';
import beeper from 'beeper';

const prettyError = new PrettyError();
function handleError(err) {
  prettyError.render(err);
  beeper(2);
}

const libSrc = ['libs/**/*.+(js|jsx)', '!libs/**/*.test.js'];

gulp.task('libs', () => (
  gulp.src(libSrc)
    .pipe(plumber({errorHandler: handleError}))
    .pipe(cached('lib'))
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('dist'))
));

gulp.task('watch', ['libs'], () => {
  gulp.watch(libSrc, ['libs']);
});
