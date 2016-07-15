var gulp          = require('gulp');
var browserSync   = require('browser-sync').create();
var sass          = require('gulp-sass');
var plumber       = require('gulp-plumber');
var autoprefixer  = require('gulp-autoprefixer');

// Static Server + watching scss/html files
gulp.task('serve', ['sass'], function() {

    browserSync.init({
        server: "./test/result"
    });

    gulp.watch("test/scss/*.scss", ['sass']);
    gulp.watch(["test/result/*.html", 'test/result/js/*.js']).on('change', browserSync.reload);
});

// Compile sass into CSS & auto-inject into browsers
gulp.task('sass', function() {
    return gulp.src('test/scss/*.scss')
        .pipe(plumber())
        .pipe(sass())
        .pipe(autoprefixer({
          browsers: ['last 2 versions'],
          cascade: false
        }))
        .pipe(gulp.dest('test/result/css'))
        .pipe(browserSync.stream());
});

gulp.task('default', ['serve']);
