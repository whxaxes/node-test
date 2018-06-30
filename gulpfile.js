var gulp = require('gulp');
var livereload = require('gulp-livereload');

gulp.task('watch', function() {
  livereload.listen();

  gulp.watch(['**/*.css', '**/*.js', '**/*.html'], function(file) {
    livereload.changed(file.path);
  });
});
