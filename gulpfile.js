const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const webpackConfig = require('./webpack.config');
const webpackStream = require('webpack-stream');
const babel = require('gulp-babel');
const eslint = require('gulp-eslint');
const manifest = require('./package.json');

const mainFile = manifest.main
const destinationDirectory = path.dirname(mainFile);

function build() {
  return gulp.src('./src/formwood.js')
    .pipe(webpackStream(webpackConfig, webpack))
    .pipe(gulp.dest(destinationDirectory));
}

function sendToCoveralls() {
  gulp.src('coverage/**/lcov.info')
    .pipe(coveralls());
}

function lint() {
  return gulp.src('src/**/*')
    .pipe(eslint())
    .pipe(eslint.format())
    .pipe(eslint.failAfterError());
}

gulp.task('build', build);
gulp.task('coveralls', sendToCoveralls);
gulp.task('lint', lint);
gulp.task('default', ['build']);
