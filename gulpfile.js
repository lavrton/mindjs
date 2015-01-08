var gulp = require("gulp");
var concat = require('gulp-concat');
var connect = require('gulp-connect');
//var sourcemaps = require('gulp-sourcemaps');
var livereload = require('gulp-livereload');
var browserify = require('gulp-browserify');
var gutil = require('gulp-util');

gulp.task('connect', function () {
    connect.server({
        root: [__dirname + '/'],
        host: "0.0.0.0",
        port: 8000,
        livereload: false
    });
});

gulp.task('scripts', function() {
    gulp.src('src/mind.js')
        .pipe(browserify({
            debug : true,
            transform : ['6to5ify']
        }).on('error', gutil.log))
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['scripts']);
});

gulp.task('default', ['connect', 'scripts', 'watch']);