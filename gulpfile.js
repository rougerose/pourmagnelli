// source : https://github.com/florianbouvot/gulp-boilerplate

const { gulp, src, dest, watch, series, parallel } = require("gulp");
const config = require("./gulp.config.js");
const del = require("del");
const browserSync = require("browser-sync");
const sass = require("gulp-sass")(require("sass"));
const postcss = require("gulp-postcss");
const size = require("gulp-size");
const rename = require("gulp-rename");
const rollup = require("rollup");
const { nodeResolve } = require("@rollup/plugin-node-resolve");
const { terser } = require("rollup-plugin-terser");

// Clean task
const clean = function (done) {
  // Make sure this feature is activated before running
  if (!config.tasks.clean) return done();

  del.sync(config.clean);

  // Signal completion
  return done();
};

// Styles task
const css = function (done) {
  // Make sure this feature is activated before running
  if (!config.tasks.css) return done();

  return src(config.scss.src + "**/*.scss")
    .pipe(
      sass
        .sync({ includePaths: config.scss.loadPath })
        .on("error", sass.logError)
    )
    .pipe(dest(config.css.src))
    .pipe(postcss())
    .pipe(rename({ basename: "styles" }))
    .pipe(size({ title: "CSS", gzip: true, showFiles: true }))
    .pipe(dest(config.css.dest))
    .pipe(browserSync.stream());
};

// Scripts task
const js = function (done) {
  // Make sure this feature is activated before running
  if (!config.tasks.js) return done();

  return rollup
    .rollup({
      input: config.js.src,
      plugins: [nodeResolve(), terser()],
    })
    .then((bundle) => {
      return bundle.write({
        file: config.js.dest + config.js.name,
        format: "iife",
      });
    });
};

// Server task
const startServer = function (done) {
  // Make sure this feature is activated before running
  if (!config.tasks.reload) return done();

  // Initialize BrowserSync
  browserSync.init({
    proxy: config.server.proxy,
  });

  // Signal completion
  done();
};

// Reload the browser when files change
const reloadBrowser = function (done) {
  // Make sure this feature is activated before running
  if (!config.tasks.reload) return done();

  browserSync.reload();

  // Signal completion
  done();
};

// Watch for changes
const watchSource = function (done) {
  watch(config.scss.src + "**/*.scss", series(css));
  watch(config.tailwind, series(css));
  watch(config.js.src, series(js, reloadBrowser));
  watch(config.html.src, reloadBrowser);

  // Signal completion
  done();
};

// Default task = dev + watch
exports.default = series(clean, parallel(css, js), startServer, watchSource);

// Clean task
exports.clean = clean;

// Dev task
exports.dev = series(clean, parallel(css, js));

// Build task
exports.build = series(clean, parallel(css, js));
