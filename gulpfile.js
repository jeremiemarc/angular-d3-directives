/* jshint node:true */

'use strict';
var fs = require('fs');
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();
var JS_FILES = ['./js/**/*.js'];
var CSS_FILES = ['./css/*/*.css'];
var HTML_FILES = ['index.html', './partials/**/*.html'];
var IMG_FILES = ['./img/**/*'];

gulp.task('jshint', function() {
    return gulp.src(JS_FILES)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('styles', function() {
    return gulp.src(CSS_FILES)
        .pipe($.autoprefixer({
            browsers: ['last 1 version']
        }))
        .pipe(gulp.dest('.tmp/styles'));
});

gulp.task('html', ['styles'], function() {
    var assets = $.useref.assets({
        noconcat: false
    });
    return gulp.src(HTML_FILES)
        .pipe(assets)
        .pipe($.if('*.js', $.uglify()))
        .pipe($.if('*.css', $.csso()))
        .pipe(assets.restore())
        .pipe($.useref())
        .pipe($.if('*.html', $.minifyHtml({
            conditionals: true,
            loose: true
        })))
        .pipe(gulp.dest('dist'));
});

gulp.task('connect', function() {
    var serveStatic = require('serve-static');
    var serveIndex = require('serve-index');
    var app = require('connect')().use(require('connect-livereload')({
            port: 35729
        })).use(serveStatic('.tmp')).use(serveStatic('./'))
        // paths to bower_components should be relative to the current file
        // e.g. in app/index.html you should use ../bower_components
        .use('/lib', serveStatic('lib')).use(serveIndex('app'));
    require('http').createServer(app).listen(9000).on('listening', function() {
        console.log('Started connect web server on http://localhost:9000');
    });
});

gulp.task('serve', ['connect', 'watch'], function() {
    require('opn')('http://localhost:9000');
});

gulp.task('watch', ['connect'], function() {
    $.livereload.listen();
    var watching = [].concat(['./css/**/*.css',
        JS_FILES,
        HTML_FILES,
        IMG_FILES
    ]);
    gulp.watch(watching).on('change', $.livereload.changed);
    gulp.watch(JS_FILES, ['jshint']);
    gulp.watch(CSS_FILES, ['styles']);
    gulp.watch('bower.json', ['wiredep']);
});


gulp.task('default', function() {
    return gulp.start('serve');
});
