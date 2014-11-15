'use strict';

var gulp = require('gulp');

gulp.task('watch', ['config', 'styles'] ,function () {
  gulp.watch('src/styles/*.scss', ['styles']);
  gulp.watch('src/**/*.js', ['scripts']);
  gulp.watch('src/assets/images/**/*', ['images']);
  gulp.watch('bower.json', ['wiredep']);
});
