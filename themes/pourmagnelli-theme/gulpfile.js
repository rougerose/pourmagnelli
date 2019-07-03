const {src, dest, series, watch} = require('gulp');
const concat = require('gulp-concat');

const options = {
  jsLib: {
    src: [
      'node_modules/jquery/dist/jquery.min.js',
      'node_modules/body-scroll-lock/lib/bodyScrollLock.min.js',
      'node_modules/headroom.js/dist/headroom.min.js',
      'node_modules/headroom.js/dist/jQuery.headroom.min.js'
    ],
    dest: 'assets/js/'
  }
};

function lib(cb) {
  src(options.jsLib.src)
    .pipe(concat('lib.min.js'))
    .pipe(dest(options.jsLib.dest));
  cb();
}

exports.js = series(lib);

exports.default = exports.js;
