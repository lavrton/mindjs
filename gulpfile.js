"use strict";
var gulp = require("gulp");
var gutil = require('gulp-util');
var browserify = require('gulp-browserify');
var connect = require('gulp-connect');
var livereload = require('gulp-livereload');

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
            debug : true
        }).on('error', gutil.log))
        .pipe(gulp.dest('./dist/'))
        .pipe(livereload());
});

gulp.task('watch', function() {
  gulp.watch('src/*.js', ['scripts']);
});

gulp.task('default', ['connect', 'scripts', 'watch']);