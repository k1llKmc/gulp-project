const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const cachebust = require('gulp-cache-bust');
const bem = require('gulp-html-bem-validator');
const imagemin = require('gulp-imagemin');
const del = require('del');

// SYNC
function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app'
    }
  });
}

exports.sync = browsersync;

// WATCHING
function watching() {
  watch(['app/src/scss/**/*.scss'], styles);
  watch(['app/src/js/**/*.js', '!app/src/js/main.min.js'], scripts);
  watch(['app/**/*.html']).on('change', browserSync.reload);
}

exports.watch = watching;

// HTML
function html() {
  return src('app/index.html')
    .pipe(bem())
    .pipe(cachebust({
      type: 'timestamp'
    }))
    .pipe(dest('app'));
}

exports.html = html;

// STYLES
function styles() {
  return src('app/src/scss/style.scss')
    .pipe(concat('style.min.css'))
    .pipe(sass({ outputStyle: 'compressed' }).on('error', sass.logError))
    .pipe(dest('app/src/css'))
    .pipe(browserSync.stream());
}

exports.styles = styles;

// JS
function scripts() {
  return src('app/src/js/main.js')
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/src/js'))
    .pipe(browserSync.stream());
}

exports.scripts = scripts;

// IMAGES
function images() {
  return src(['app/src/images/**/*', '!app/src/images/**/*.svg'], { base: 'app' })
    .pipe(imagemin())
    .pipe(dest('dist'));
}

// DEL
function cleanDist() {
  return del('dist/**/*');
}

// BUILD
function build() {
  return src([
    'app/src/css/style.min.css',
    'app/src/js/main.min.js',
    'app/src/fonts/**/*',
    'app/index.html',
    'app/src/images/*',
  ], { base: 'app' })
    .pipe(dest('dist/'));
}

exports.build = series(cleanDist, build, images);

// DEFAULT TASK
exports.default = parallel(styles, scripts, html, browsersync, watching);
