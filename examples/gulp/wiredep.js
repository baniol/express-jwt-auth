'use strict';

var gulp = require('gulp');

// inject bower components
gulp.task('wiredep', function () {
  var wiredep = require('wiredep').stream;

  gulp.src('src/styles/*.scss')
    .pipe(wiredep({
      directory: 'bower_components',
      ignorePath: /^\/|\.\.\//
    }))
    .pipe(gulp.dest('.tmp'));

  gulp.src('src/*.html')
    .pipe(wiredep({
      directory: 'bower_components',
      exclude: ['bootstrap-sass-official'],
      ignorePath: /^\/|\.\.\//
    }))
    .pipe(gulp.dest('src'));
});
