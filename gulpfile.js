'use strict';
/*jshint node:true*/

import gulp from "gulp";
import { deleteAsync } from "del";
import qunit from "gulp-qunit";
import plumber from "gulp-plumber";
import jshint from "gulp-jshint";
import uglify from "gulp-uglify";
import replace from "gulp-replace";
import rename from "gulp-rename";
import header from "gulp-header";
import sourceMaps from 'gulp-sourcemaps';

import _pkg from "./package.json" assert {type: "json"};

var paths = {
  output: ["dist/**/*.js", "dist/**/*.ts", "dist/**/*.map"]
};

var buildConfig = {
  outputPath: 'dist',
  pkg: _pkg,
  banner: [
    '/*!',
    ' * Knockout Mapping plugin v<%= pkg.version %>',
    ' * (c) 2013 Steven Sanderson, Roy Jacobs - http://knockoutjs.com/',
    ' * Customizations by k80uu',
    ' * License: MIT (http://www.opensource.org/licenses/mit-license.php)',
    ' */\n'
  ].join('\n')
};


gulp.task('clear', function () {
  return deleteAsync(paths.output, {cwd: 'dist'});
});
gulp.task('clear_npm', function() {
  return deleteAsync('/node_modules');
});

gulp.task('build', function (done) {
  gulp.src('knockout.mapping.js')
    .pipe(plumber({errorHandler: process.env.NODE_ENV === 'development'}))
    .pipe(jshint()).pipe(jshint.reporter('jshint-stylish'))
    .pipe(header(buildConfig.banner, {pkg: buildConfig.pkg}))
    .pipe(gulp.dest(buildConfig.outputPath))
    .pipe(rename('knockout.mapping.min.js'))
    .pipe(replace(/(:?var\s*?DEBUG\s*?=\s*?true)/, 'var DEBUG=false'))
    .pipe(sourceMaps.init())
    .pipe(uglify())
    .pipe(sourceMaps.write('./'))
    .pipe(gulp.dest(buildConfig.outputPath));


    gulp.src("./knockout.mapping.d.ts").pipe(gulp.dest("dist", { overwrite: true }));

    return done();
});

gulp.task('jshint', function () {
  return gulp.src(['knockout.mapping.js', 'spec/*.js'])
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', gulp.series('build', 'jshint', function() {
  return gulp.src(process.env.CI ? 'spec/spec-runner-*.htm' : 'spec/spec-runner.htm')
    .pipe(plumber({errorHandler: process.env.NODE_ENV === 'development'}))
    .pipe(qunit({timeout: 30}));
}));

gulp.task('default', gulp.series('clear', 'test'));

gulp.task('watch', function () {
  gulp.watch(['knockout.mapping.js', 'spec/spec-runner.htm', 'spec/*.js'], gulp.series('clear', 'test'));
});
