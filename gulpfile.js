'use strict';

const gulp = require('gulp');
const ts = require('gulp-typescript');
const plumber = require('gulp-plumber');
const babel = require('gulp-babel');
const browserSync = require('browser-sync').create();
const ignore = require('gulp-ignore');
const nightwatch = require('gulp-nightwatch');

/////////////////////////////////////////////////////////////////////////
// TypeScript Compile

gulp.task('tscClient', () => {
  const tsProject = ts.createProject('tsconfig.json', { noExternalResolve: true });
  tsProject.src()
    .pipe(plumber())
    //.pipe(ignore.exclude(['src-server/**/*']))
    .pipe(ignore.include(['{./,}src-{client,front}/**/*.ts']))
    .pipe(ts(tsProject))
    // .pipe(babel())
    .pipe(gulp.dest('.'));
});

gulp.task('tscServer', () => {
  const tsProject = ts.createProject('tsconfig.json', { noExternalResolve: true });
  tsProject.src()
    .pipe(plumber())
    //.pipe(ignore.exclude(['src-server/**/*.ts']))
    .pipe(ignore.include(['{./,}src-{server,middle}/**/*.ts']))
    .pipe(ts(tsProject))
    .pipe(babel())
    .pipe(gulp.dest('.'));
});

gulp.task('compile', ['tscServer']);

gulp.task('watch', [], () => {
  // gulp.watch(['src-client/**/*.ts'], ['tscClient']);
  gulp.watch(['{./,}src-{server,middle}/**/*.ts'], ['tscServer']);
});

/////////////////////////////////////////////////////////////////////////
// EXPRESS

gulp.task('browsersync', () => {
  browserSync.init({
    // files: ['src-{client,middle}/**/*.{js,css,jade,html,json}', 'bundles/**/*.js'], // BrowserSyncにまかせるファイル群
    files: ['views/**/*.{js,css,jade,html}', 'bundles/**/*.js'], // BrowserSyncにまかせるファイル群
    proxy: 'http://localhost:3000',  // express の動作するポートにプロキシ
    port: 4000,  // BrowserSync は 4000 番ポートで起動
    open: true,
    ghostMode: false,
    ui: false,
  });
});

gulp.task('browsersync:e2e', () => {
  browserSync.init({
    // files: ['src-{client,middle}/**/*.{js,css,jade,html,json}', 'bundles/**/*.js'], // BrowserSyncにまかせるファイル群
    files: ['views/**/*.{js,css,jade,html}', 'bundles/**/*.js'], // BrowserSyncにまかせるファイル群
    proxy: 'http://localhost:3000',  // express の動作するポートにプロキシ
    port: 5000,  // BrowserSync は 5000 番ポートで起動
    open: false,
    ghostMode: false,
    ui: false,
  });
});

/////////////////////////////////////////////////////////////////////////
// ELECTRON

// gulp.task('electron', () => {
//   const electron = require('electron-prebuilt');
//   const proc = require('child_process');
//   proc.spawn(electron, ['src-server/electron.js']);  
// });



gulp.task('nightwatch', () => {
  gulp.src('')
    .pipe(plumber())
    .pipe(nightwatch({
      configFile: 'nightwatch.conf.js'
    }));
});

gulp.task('nightwatch:w', ['nightwatch'], () => {
  gulp.watch(['{./,}bundles/**/*.js', '{./,}test-{e2e,nightwatch}/**/*.js'], ['nightwatch']);
});