"use strict";

// Load plugins
const autoprefixer = require("gulp-autoprefixer");
const browsersync = require("browser-sync").create();
const cleanCSS = require("gulp-clean-css");
const del = require("del");
const gulp = require("gulp");
const header = require("gulp-header");
const merge = require("merge-stream");
const plumber = require("gulp-plumber");
const rename = require("gulp-rename");
const sass = require("gulp-sass");
const uglify = require("gulp-uglify");

// Load package.json for banner
const pkg = require('./package.json');

// Set the banner content
const banner = ['/*!\n',
  ' * Power Set Solutions - <%= pkg.title %> v<%= pkg.version %> (<%= pkg.homepage %>)\n',
  ' * Copyright 2019-' + (new Date()).getFullYear(), '\n',
  ' * Licensed under https://powersettech.com\n',
  ' */\n',
  '\n'
].join('');

// Distribution Configuration
var distConfiguration = {
  paths: {
    src: {
      html: '*.html',
      css: [
        './css/**/*.min.css'
      ],
      js: './js/*.js',
      vendor: './vendor/*',
      images: './images/*'
    },
    dest: './dist'
  }
};

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/"]);
}

// Clean dist
function distClean() {
  return del(["./dist/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./vendor/bootstrap'));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
      .pipe(gulp.dest('./vendor/jquery-easing'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  return merge(bootstrap, jquery);
}

// CSS task
function css() {
  return gulp
    .src("./scss/**/*.scss")
    .pipe(plumber())
    .pipe(sass({
      outputStyle: "expanded",
      includePaths: "./node_modules",
    }))
    .on("error", sass.logError)
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(gulp.dest("./css"))
    .pipe(rename({
      suffix: ".min"
    }))
    .pipe(cleanCSS())
    .pipe(gulp.dest("./css"))
    .pipe(browsersync.stream());
}

// JS task
function js() {
  return gulp
    .src([
      './js/*.js',
      '!./js/*.min.js',
      '!./js/contact_me.js',
      '!./js/jqBootstrapValidation.js'
    ])
    .pipe(uglify())
    .pipe(header(banner, {
      pkg: pkg
    }))
    .pipe(rename({
      suffix: '.min'
    }))
    .pipe(gulp.dest('./js'))
    .pipe(browsersync.stream());
}

// Copy task HTML to dist
function distHtml() {
  return gulp
    .src(distConfiguration.paths.src.html)
      .pipe(gulp.dest(distConfiguration.paths.dest))
}

// Copy task css to dist
function distCss() {
  return gulp
      .src(distConfiguration.paths.src.css)
      .pipe(gulp.dest(distConfiguration.paths.dest +'/css'))
}

// Copy task js to dist
function distJS() {

}

// Copy task images to dist
function distImages() {
  return gulp
      .src(distConfiguration.paths.src.images)
      .pipe(gulp.dest(distConfiguration.paths.dest + '/images'))
}

// Copy task vendor files to dist
function distVendor() {

}

// Watch files
function watchFiles() {
  gulp.watch("./scss/**/*", css);
  gulp.watch("./js/**/*", js);
  gulp.watch("./**/*.html", browserSyncReload);
}

// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, gulp.parallel(css, js));
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));
const distBuild = gulp.series(distClean, gulp.parallel(distHtml, distCss,
    distHtml, distJS, distImages, distVendor));

// Export tasks
exports.css = css;
exports.js = js;
exports.clean = clean;
exports.distClean = distClean;
exports.distHtml = distHtml;
exports.distCss = distCss;
exports.distJS = distJS;
exports.distImages = distImages;
exports.distVendor = distVendor;
exports.vendor = vendor;
exports.build = build;
exports.watch = watch;
exports.distBuild = distBuild;
exports.default = build;
